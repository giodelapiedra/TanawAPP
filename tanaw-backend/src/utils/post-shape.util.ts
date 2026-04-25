import * as storageService from '../modules/storage/storage.service';

/**
 * Single source of truth for the wire shape of a Post returned to clients.
 * Anywhere a Post is sent in an API response, the Prisma query MUST select
 * `images: POST_IMAGES_SELECT` and the result MUST go through `mapPostShape`.
 *
 * This guarantees that author photos and image object keys are resolved into
 * URLs that the mobile / admin client can load directly — and that the field
 * names stay consistent across feed, groups, and any future modules.
 */

export const POST_IMAGES_SELECT = {
  select: { id: true, objectKey: true, position: true },
  orderBy: { position: 'asc' as const },
};

interface RawPostInput {
  id: string;
  visibility: 'COMMUNITY' | 'PUBLIC';
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    tanawId: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string | null;
    role: 'RESIDENT' | 'BARANGAY_OFFICIAL' | 'GOVERNMENT_EMPLOYEE' | 'SUPER_ADMIN';
    profilePhoto: string | null;
  };
  _count: { comments: number; likes: number };
  likes: Array<{ id: string }>;
  // Optional so it works for endpoints that don't include images yet (e.g. a
  // community post whose composer doesn't accept attachments). Missing/empty
  // is treated as "no images" — the field is always present in the output.
  images?: Array<{ id: string; objectKey: string; position: number }>;
}

export async function mapPostShape(post: RawPostInput) {
  const images = post.images ?? [];

  const [authorPhotoUrl, imageUrls] = await Promise.all([
    storageService.resolvePublicUrlIfPresent(post.author.profilePhoto),
    Promise.all(images.map((img) => storageService.resolvePublicUrl(img.objectKey))),
  ]);

  return {
    id: post.id,
    visibility: post.visibility,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: { ...post.author, profilePhoto: authorPhotoUrl },
    images: images.map((img, idx) => ({ id: img.id, url: imageUrls[idx] })),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    likedByMe: post.likes.length > 0,
  };
}

export async function mapPostShapes(posts: RawPostInput[]) {
  return Promise.all(posts.map(mapPostShape));
}
