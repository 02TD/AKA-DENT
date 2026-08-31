export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp';
const PHOTO_TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as const;
type PhotoFormat = { extension: keyof typeof PHOTO_TYPES; contentType: string };

export class PhotoUploadError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export function detectPhotoFormat(bytes: Uint8Array): PhotoFormat | null {
  const is = (offset: number, values: number[]) => values.every((value, index) => bytes[offset + index] === value);
  if (bytes.length >= 20 && is(0, [255, 216, 255]) && is(bytes.length - 2, [255, 217])) return { extension: 'jpg', contentType: 'image/jpeg' };
  if (bytes.length >= 45 && is(0, [137, 80, 78, 71, 13, 10, 26, 10]) && is(12, [73, 72, 68, 82]) && is(bytes.length - 8, [73, 69, 78, 68])) return { extension: 'png', contentType: 'image/png' };
  if (bytes.length >= 20 && is(0, [82, 73, 70, 70]) && is(8, [87, 69, 66, 80]) && is(12, [86, 80, 56]) && [32, 76, 88].includes(bytes[15])) {
    const length = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true) + 8;
    if (length === bytes.length) return { extension: 'webp', contentType: 'image/webp' };
  }
  return null;
}

export async function readPhotoUpload(request: Request) {
  const declaredType = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!Object.values(PHOTO_TYPES).includes(declaredType as typeof PHOTO_TYPES[keyof typeof PHOTO_TYPES])) throw new PhotoUploadError('unsupported_type', 415);
  const declaredLength = request.headers.get('content-length');
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_PHOTO_BYTES)) throw new PhotoUploadError('too_large', 413);
  if (!request.body) throw new PhotoUploadError('empty_file', 400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_PHOTO_BYTES) {
        await reader.cancel().catch(() => {});
        throw new PhotoUploadError('too_large', 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  if (!size) throw new PhotoUploadError('empty_file', 400);
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const format = detectPhotoFormat(bytes);
  if (!format || format.contentType !== declaredType) throw new PhotoUploadError('invalid_image', 415);
  return { bytes, ...format };
}

export async function saveDoctorPhoto(db: D1Database, bucket: R2Bucket, slug: string, request: Request) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new PhotoUploadError('doctor_not_found', 404);
  const doctor = await db.prepare('SELECT image_url FROM doctors WHERE slug = ?').bind(slug).first<{ image_url: string }>();
  if (!doctor) throw new PhotoUploadError('doctor_not_found', 404);
  const photo = await readPhotoUpload(request);
  const filename = crypto.randomUUID() + '.' + photo.extension;
  const key = 'doctor-photos/' + filename;
  const imageUrl = '/media/' + filename;
  const saved = await bucket.put(key, photo.bytes, { httpMetadata: { contentType: photo.contentType, cacheControl: 'public, max-age=31536000, immutable' } });
  if (!saved) throw new PhotoUploadError('upload_failed', 500);

  // Keep all previous photos. Never overwrite a newer photo from another admin tab.
  const result = await db.prepare("UPDATE doctors SET image_url = ?, updated_at = datetime('now') WHERE slug = ? AND image_url = ?").bind(imageUrl, slug, doctor.image_url).run();
  if (!result.success) throw new PhotoUploadError('save_failed', 500);
  if (result.meta.changes !== 1) {
    await bucket.delete(key);
    throw new PhotoUploadError('photo_changed', 409);
  }
  return imageUrl;
}

export async function servePhoto(bucket: R2Bucket, filename: string, headOnly = false) {
  const match = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/.exec(filename);
  if (!match) return new Response('Not found', { status: 404 });
  const key = 'doctor-photos/' + filename;
  const photo = headOnly ? await bucket.head(key) : await bucket.get(key);
  if (!photo) return new Response('Not found', { status: 404 });
  const headers = new Headers({
    'Content-Type': PHOTO_TYPES[match[1] as keyof typeof PHOTO_TYPES],
    'Content-Length': String(photo.size),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Disposition': 'inline; filename="' + filename + '"',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
    ETag: photo.httpEtag,
  });
  const body = headOnly ? null : (photo as R2ObjectBody).body;
  return new Response(body, { headers });
}
