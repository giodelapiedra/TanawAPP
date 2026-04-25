import { prisma } from '../../config/database';
import { AppError } from '../../utils/response.util';
import { USER_INCLUDE, stripPassword } from '../../utils/user-shape.util';
import { resolveUserPhoto } from '../../utils/user-photo.util';
import * as storageService from '../storage/storage.service';
import { UpdateProfileDto, RegisterDeviceTokenDto } from './users.schema';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: USER_INCLUDE,
  });
  if (!user) throw new AppError('User not found', 404);
  return resolveUserPhoto(stripPassword(user));
}

export async function updateProfile(userId: string, data: UpdateProfileDto) {
  const { street, houseNo, ...profileFields } = data;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...profileFields,
      ...(street !== undefined || houseNo !== undefined
        ? { address: { update: { street, houseNo } } }
        : {}),
    },
    include: USER_INCLUDE,
  });

  return resolveUserPhoto(stripPassword(updated));
}

export async function updateProfilePhoto(
  userId: string,
  file: Express.Multer.File
): Promise<Awaited<ReturnType<typeof getProfile>>> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePhoto: true },
  });
  if (!existing) throw new AppError('User not found', 404);

  const key = storageService.buildObjectKey('avatars', userId, file.mimetype);
  try {
    await storageService.uploadBuffer(key, file.buffer, file.mimetype);
  } catch (err) {
    console.error('[users.updateProfilePhoto] upload failed', {
      userId,
      key,
      mimeType: file.mimetype,
      sizeBytes: file.buffer.length,
    });
    throw err;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: key },
    });
  } catch (err) {
    await storageService.deleteObject(key).catch(() => undefined);
    throw err;
  }

  if (existing.profilePhoto) {
    await storageService.deleteObject(existing.profilePhoto).catch(() => undefined);
  }

  return getProfile(userId);
}

export async function getPublicProfile(viewerId: string, targetId: string) {
  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      tanawId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      suffix: true,
      role: true,
      status: true,
      profilePhoto: true,
      createdAt: true,
      barangay: { select: { code: true, name: true } },
    },
  });
  if (!user || user.status !== 'ACTIVE') throw new AppError('User not found', 404);

  const [followerCount, followingCount, follow] = await Promise.all([
    prisma.follow.count({ where: { followingId: targetId } }),
    prisma.follow.count({ where: { followerId: targetId } }),
    viewerId === targetId
      ? null
      : prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: viewerId, followingId: targetId } },
          select: { id: true },
        }),
  ]);

  const resolved = await resolveUserPhoto(user);
  return {
    ...resolved,
    followerCount,
    followingCount,
    isFollowedByMe: !!follow,
    isSelf: viewerId === targetId,
  };
}

export async function getDigitalId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tanawId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      suffix: true,
      role: true,
      status: true,
      profilePhoto: true,
      birthDate: true,
      createdAt: true,
      barangay: { select: { code: true, name: true } },
      address: { select: { city: true } },
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return resolveUserPhoto(user);
}

export async function acceptCommunityRules(userId: string) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { acceptedCommunityRulesAt: new Date() },
    include: USER_INCLUDE,
  });
  return resolveUserPhoto(stripPassword(updated));
}

export async function registerDeviceToken(userId: string, data: RegisterDeviceTokenDto) {
  await prisma.deviceToken.upsert({
    where: { token: data.token },
    update: { userId, platform: data.platform },
    create: { userId, token: data.token, platform: data.platform },
  });
  return { registered: true };
}
