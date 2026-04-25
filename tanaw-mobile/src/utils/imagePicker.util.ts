import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

export interface PickedImage {
  uri: string;
  name: string;
  mimeType: string;
  width: number;
  height: number;
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

// Cap on the longest edge after resize. 1600px is enough for a sharp full-screen
// view on phones and brings typical 4000x3000 camera photos down to ~1MB JPEG.
const MAX_DIMENSION_PX = 1600;
const COMPRESS_QUALITY = 0.7;

export class UnsupportedImageTypeError extends Error {
  constructor() {
    super('Only JPEG and PNG images are allowed');
    this.name = 'UnsupportedImageTypeError';
  }
}

function inferMimeFromUri(uri: string): string | null {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  return null;
}

function inferNameFromUri(uri: string): string {
  const last = uri.split('/').pop() ?? 'photo.jpg';
  return last.includes('.') ? last : `${last}.jpg`;
}

function isAllowedMime(mime: string | null | undefined): mime is string {
  return !!mime && ALLOWED_MIME_TYPES.has(mime);
}

// Resize and re-encode every picked asset before it leaves the picker.
// This is the load-bearing fix for upload reliability — keeps requests well
// under multer's 8MB-per-file and nginx's 15MB-body limits, and makes uploads
// fast enough to stay inside the axios timeout on mobile networks.
async function compressAsset(asset: ImagePicker.ImagePickerAsset): Promise<PickedImage> {
  const width = asset.width ?? 0;
  const height = asset.height ?? 0;
  const longestEdge = Math.max(width, height);

  const actions: ImageManipulator.Action[] =
    longestEdge > MAX_DIMENSION_PX
      ? [{ resize: width >= height ? { width: MAX_DIMENSION_PX } : { height: MAX_DIMENSION_PX } }]
      : [];

  const result = await ImageManipulator.manipulateAsync(asset.uri, actions, {
    compress: COMPRESS_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return {
    uri: result.uri,
    mimeType: 'image/jpeg',
    name: (asset.fileName ?? inferNameFromUri(asset.uri)).replace(/\.(png|webp|gif|heic|heif)$/i, '.jpg'),
    width: result.width,
    height: result.height,
  };
}

async function ensureLibraryPermission(): Promise<boolean> {
  const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;
  const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return req.granted;
}

function assertSupportedSource(asset: ImagePicker.ImagePickerAsset): void {
  // We always re-encode to JPEG, so the source's encoding doesn't matter for
  // the upload — but the source must still be a real image. Reject anything
  // that comes through with a non-image mime (e.g. video picked by mistake).
  const sourceMime = asset.mimeType ?? inferMimeFromUri(asset.uri);
  if (!isAllowedMime(sourceMime)) {
    // Allow HEIC/HEIF/webp by inference here too — manipulator can re-encode them.
    const lower = asset.uri.toLowerCase();
    const isImageLike =
      lower.endsWith('.heic') ||
      lower.endsWith('.heif') ||
      lower.endsWith('.webp') ||
      asset.mimeType?.startsWith('image/');
    if (!isImageLike) throw new UnsupportedImageTypeError();
  }
}

export async function pickSingleImage(options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
}): Promise<PickedImage | null> {
  const ok = await ensureLibraryPermission();
  if (!ok) throw new Error('Photo library access denied');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: options?.allowsEditing ?? true,
    aspect: options?.aspect,
    quality: 1,
    selectionLimit: 1,
  });

  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  assertSupportedSource(asset);
  return compressAsset(asset);
}

export async function pickMultipleImages(maxCount: number): Promise<PickedImage[]> {
  const ok = await ensureLibraryPermission();
  if (!ok) throw new Error('Photo library access denied');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: maxCount,
    quality: 1,
  });

  if (result.canceled) return [];

  const compressed: PickedImage[] = [];
  for (const asset of result.assets.slice(0, maxCount)) {
    assertSupportedSource(asset);
    compressed.push(await compressAsset(asset));
  }
  return compressed;
}

export function toFormDataFile(image: PickedImage): {
  uri: string;
  name: string;
  type: string;
} {
  // iOS file URIs need the `file://` prefix stripped for FormData uploads;
  // Android keeps it as-is.
  const uri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
  return { uri, name: image.name, type: image.mimeType };
}
