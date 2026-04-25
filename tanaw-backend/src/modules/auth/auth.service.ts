import bcrypt from 'bcrypt';
import { Gender } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/response.util';
import { signAccessToken, signRefreshToken, verifyRefreshToken, TokenPayload } from '../../utils/jwt.util';
import { generateTanawIdTx } from '../../utils/tanawId.util';
import { USER_INCLUDE, stripPassword } from '../../utils/user-shape.util';
import { resolveUserPhoto } from '../../utils/user-photo.util';
import { RegisterResidentDto, RegisterBarangayDto, RegisterEmployeeDto, LoginDto } from './auth.schema';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function lookupBarangay(code: string) {
  const barangay = await prisma.barangay.findUnique({ where: { code } });
  if (!barangay || !barangay.isActive) {
    throw new AppError('Invalid or inactive barangay code', 400);
  }
  return barangay;
}

async function assertNoDuplicate(email: string, phone: string) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing?.email === email) throw new AppError('Email already registered', 409);
  if (existing?.phone === phone) throw new AppError('Phone number already registered', 409);
}

// ─── Registration ────────────────────────────────────────

export async function registerResident(data: RegisterResidentDto) {
  const barangay = await lookupBarangay(data.barangayCode);
  await assertNoDuplicate(data.email, data.phone);
  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const tanawId = await generateTanawIdTx(tx, 'RESIDENT');

    const created = await tx.user.create({
      data: {
        tanawId,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: 'RESIDENT',
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        suffix: data.suffix,
        birthDate: data.birthDate,
        gender: data.gender as Gender,
        barangayId: barangay.id,
        address: { create: { houseNo: data.houseNo, street: data.street } },
      },
      include: USER_INCLUDE,
    });

    await tx.auditLog.create({ data: { userId: created.id, action: 'USER_REGISTERED' } });

    return created;
  });

  return resolveUserPhoto(stripPassword(user));
}

export async function registerBarangay(data: RegisterBarangayDto) {
  const barangay = await lookupBarangay(data.barangayCode);
  await assertNoDuplicate(data.email, data.phone);
  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const tanawId = await generateTanawIdTx(tx, 'BARANGAY_OFFICIAL');

    const created = await tx.user.create({
      data: {
        tanawId,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: 'BARANGAY_OFFICIAL',
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        suffix: data.suffix,
        birthDate: data.birthDate,
        gender: data.gender as Gender,
        barangayId: barangay.id,
        position: data.position,
        address: { create: { houseNo: data.houseNo, street: data.street } },
      },
      include: USER_INCLUDE,
    });

    await tx.auditLog.create({ data: { userId: created.id, action: 'USER_REGISTERED' } });

    return created;
  });

  return resolveUserPhoto(stripPassword(user));
}

export async function registerEmployee(data: RegisterEmployeeDto) {
  const empCode = await prisma.employeeCode.findUnique({ where: { code: data.employeeCode } });
  if (!empCode) throw new AppError('Invalid employee code', 400);
  if (empCode.isUsed) throw new AppError('Employee code already used', 400);

  const barangay = await lookupBarangay(data.barangayCode);
  await assertNoDuplicate(data.email, data.phone);
  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const tanawId = await generateTanawIdTx(tx, 'GOVERNMENT_EMPLOYEE');

    const created = await tx.user.create({
      data: {
        tanawId,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: 'GOVERNMENT_EMPLOYEE',
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        suffix: data.suffix,
        birthDate: data.birthDate,
        gender: data.gender as Gender,
        barangayId: barangay.id,
        employeeCode: data.employeeCode,
        department: data.department,
        position: data.position,
        address: { create: { houseNo: data.houseNo, street: data.street } },
      },
      include: USER_INCLUDE,
    });

    await tx.employeeCode.update({
      where: { code: data.employeeCode },
      data: { isUsed: true, usedBy: data.email },
    });

    await tx.auditLog.create({ data: { userId: created.id, action: 'USER_REGISTERED' } });

    return created;
  });

  return resolveUserPhoto(stripPassword(user));
}

// ─── Login / Logout / Refresh ────────────────────────────

export async function login(data: LoginDto) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.identifier },
        { phone: data.identifier },
        { tanawId: data.identifier },
      ],
    },
    include: USER_INCLUDE,
  });

  if (!user) throw new AppError('Invalid credentials', 401);

  if (user.status === 'SUSPENDED') {
    throw new AppError('Account suspended. Contact City Government of Tanauan.', 403);
  }
  if (user.status === 'DEACTIVATED') {
    throw new AppError('Account deactivated.', 403);
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const payload: TokenPayload = { userId: user.id, tanawId: user.tanawId, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) },
    });
    await tx.auditLog.create({ data: { userId: user.id, action: 'USER_LOGGED_IN' } });
  });

  return { user: await resolveUserPhoto(stripPassword(user)), accessToken, refreshToken };
}

export async function refresh(token: string) {
  const payload = verifyRefreshToken(token);

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, tanawId: true, role: true, status: true },
  });
  if (!user || user.id !== stored.userId || user.status !== 'ACTIVE') {
    throw new AppError('Invalid or inactive account. Please log in again.', 401);
  }

  const newPayload: TokenPayload = { userId: user.id, tanawId: user.tanawId, role: user.role };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = signRefreshToken(newPayload);

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({ where: { token }, data: { isRevoked: true } });
    await tx.refreshToken.create({
      data: { token: refreshToken, userId: stored.userId, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) },
    });
  });

  return { accessToken, refreshToken };
}

export async function logout(userId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.updateMany({ where: { userId, isRevoked: false }, data: { isRevoked: true } });
    await tx.auditLog.create({ data: { userId, action: 'USER_LOGGED_OUT' } });
  });
}
