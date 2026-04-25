import crypto from 'crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET } from '../../config/r2';
import { env } from '../../config/env';
import { AppError } from '../../utils/response.util';

export type StorageFolder = 'avatars' | 'posts';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

export function assertAllowedImageMime(mime: string): void {
  if (!ALLOWED_MIME_TYPES.has(mime)) {
    throw new AppError('Only JPEG and PNG images are allowed', 415);
  }
}

export function buildObjectKey(folder: StorageFolder, ownerId: string, mime: string): string {
  assertAllowedImageMime(mime);
  const ext = MIME_TO_EXT[mime];
  const random = crypto.randomBytes(6).toString('hex');
  return `${folder}/${ownerId}/${Date.now()}-${random}.${ext}`;
}

function getStorageErrorDetails(err: unknown) {
  const error = err as {
    name?: string;
    message?: string;
    code?: string;
    Code?: string;
    stack?: string;
    $metadata?: {
      httpStatusCode?: number;
      requestId?: string;
      attempts?: number;
    };
  };

  return {
    name: error?.name,
    message: error?.message,
    code: error?.code ?? error?.Code,
    httpStatusCode: error?.$metadata?.httpStatusCode,
    requestId: error?.$metadata?.requestId,
    attempts: error?.$metadata?.attempts,
    stack: error?.stack,
  };
}

export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
  } catch (err) {
    console.error('[storage.uploadBuffer] failed', {
      bucket: R2_BUCKET,
      key,
      contentType,
      sizeBytes: buffer.length,
      ...getStorageErrorDetails(err),
    });
    throw err;
  }
}

export async function deleteObject(key: string): Promise<void> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    );
  } catch (err) {
    console.error('[storage.deleteObject] failed', {
      bucket: R2_BUCKET,
      key,
      ...getStorageErrorDetails(err),
    });
    throw err;
  }
}

export async function resolvePublicUrl(key: string): Promise<string> {
  if (env.R2_PUBLIC_BASE_URL) {
    const base = env.R2_PUBLIC_BASE_URL.replace(/\/+$/, '');
    return `${base}/${key}`;
  }
  try {
    return await getSignedUrl(
      r2Client,
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
      { expiresIn: env.R2_SIGNED_URL_TTL_SECONDS }
    );
  } catch (err) {
    console.error('[storage.resolvePublicUrl] failed', {
      bucket: R2_BUCKET,
      key,
      ...getStorageErrorDetails(err),
    });
    throw err;
  }
}

export async function resolvePublicUrlIfPresent(key: string | null | undefined): Promise<string | null> {
  if (!key) return null;
  return resolvePublicUrl(key);
}
