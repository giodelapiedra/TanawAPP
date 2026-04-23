import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface PickedImage {
  uri: string;
  name: string;
  mimeType: string;
  width: number;
  height: number;
}

const ALLOWED_MIME = 'image/jpeg';

export class UnsupportedImageTypeError extends Error {
  constructor() {
    super('Only JPEG images are allowed');
    this.name = 'UnsupportedImageTypeError';
  }
}

function inferMimeFromUri(uri: string): string | null {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return null;
}

function inferNameFromUri(uri: string): string {
  const last = uri.split('/').pop() ?? 'photo.jpg';
  return last.includes('.') ? last : `${last}.jpg`;
}

function toPickedImage(asset: ImagePicker.ImagePickerAsset): PickedImage | null {
  const mimeType = asset.mimeType ?? inferMimeFromUri(asset.uri);
  if (mimeType !== ALLOWED_MIME) return null;
  return {
    uri: asset.uri,
    mimeType,
    name: asset.fileName ?? inferNameFromUri(asset.uri),
    width: asset.width ?? 0,
    height: asset.height ?? 0,
  };
}

async function ensureLibraryPermission(): Promise<boolean> {
  const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;
  const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return req.granted;
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
    quality: 0.85,
    selectionLimit: 1,
  });

  if (result.canceled || !result.assets[0]) return null;
  const picked = toPickedImage(result.assets[0]);
  if (!picked) throw new UnsupportedImageTypeError();
  return picked;
}

export async function pickMultipleImages(maxCount: number): Promise<PickedImage[]> {
  const ok = await ensureLibraryPermission();
  if (!ok) throw new Error('Photo library access denied');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: maxCount,
    quality: 0.85,
  });

  if (result.canceled) return [];
  const picked = result.assets.map(toPickedImage);
  const valid = picked.filter((p): p is PickedImage => p !== null);
  if (valid.length < picked.length) throw new UnsupportedImageTypeError();
  return valid.slice(0, maxCount);
}

export function toFormDataFile(image: PickedImage): {
  uri: string;
  name: string;
  type: string;
} {
  const uri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
  return { uri, name: image.name, type: image.mimeType };
}
