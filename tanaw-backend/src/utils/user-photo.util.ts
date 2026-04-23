import * as storageService from '../modules/storage/storage.service';

/**
 * Every user-facing response that carries a `profilePhoto` must run through
 * one of these resolvers. The DB stores an R2 object key; clients need a URL.
 *
 * Three shapes, three helpers:
 *   - top-level user    → resolveUserPhoto     (e.g. login, getMe, updateProfile)
 *   - nested { author } → resolveAuthorPhoto   (e.g. posts, comments)
 *   - nested { actor }  → resolveActorPhoto    (e.g. notifications)
 *
 * Each has a `*s` plural for list responses.
 */

type Photo = { profilePhoto: string | null };

export async function resolveUserPhoto<T extends Photo>(user: T): Promise<T> {
  const url = await storageService.resolvePublicUrlIfPresent(user.profilePhoto);
  return { ...user, profilePhoto: url };
}

export async function resolveUserPhotos<T extends Photo>(users: T[]): Promise<T[]> {
  return Promise.all(users.map(resolveUserPhoto));
}

export async function resolveAuthorPhoto<T extends { author: Photo }>(item: T): Promise<T> {
  const url = await storageService.resolvePublicUrlIfPresent(item.author.profilePhoto);
  return { ...item, author: { ...item.author, profilePhoto: url } };
}

export async function resolveAuthorPhotos<T extends { author: Photo }>(items: T[]): Promise<T[]> {
  return Promise.all(items.map(resolveAuthorPhoto));
}

export async function resolveActorPhoto<T extends { actor: Photo }>(item: T): Promise<T> {
  const url = await storageService.resolvePublicUrlIfPresent(item.actor.profilePhoto);
  return { ...item, actor: { ...item.actor, profilePhoto: url } };
}

export async function resolveActorPhotos<T extends { actor: Photo }>(items: T[]): Promise<T[]> {
  return Promise.all(items.map(resolveActorPhoto));
}
