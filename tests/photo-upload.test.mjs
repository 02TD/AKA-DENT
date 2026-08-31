import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { MAX_PHOTO_BYTES, PhotoUploadError, detectPhotoFormat, readPhotoUpload, saveDoctorPhoto, servePhoto } from '../lib/photo-upload.ts';
import { schemaStatements } from '../db/schema.ts';

const PNG = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aMioAAAAASUVORK5CYII=', 'base64'));

function request(bytes = PNG, type = 'image/png', extra = {}) {
  return new Request('https://example.test/upload', { method: 'POST', body: bytes, headers: { 'Content-Type': type, ...extra } });
}

function expectUploadError(code, status) {
  return (error) => error instanceof PhotoUploadError && error.code === code && error.status === status;
}

function database({ oldUrl = '/old.jpg', changes = 1, updateSuccess = true } = {}) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      return {
        bind(...values) {
          calls.push({ sql, values });
          return sql.startsWith('SELECT')
            ? { first: async () => oldUrl === null ? null : { image_url: oldUrl } }
            : { run: async () => ({ success: updateSuccess, meta: { changes } }) };
        },
      };
    },
  };
}

function bucket() {
  const objects = new Map();
  const deleted = [];
  return {
    objects, deleted,
    async put(key, value, options) {
      const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
      const object = { key, size: bytes.byteLength, httpEtag: '"etag"', body: new Blob([bytes]).stream(), options };
      objects.set(key, object);
      return object;
    },
    async get(key) { return objects.get(key) ?? null; },
    async head(key) { const value = objects.get(key); return value ? { ...value, body: undefined } : null; },
    async delete(key) { deleted.push(key); objects.delete(key); },
  };
}

test('recognizes a real PNG signature and rejects mismatched or disguised files', async () => {
  assert.deepEqual(detectPhotoFormat(PNG), { extension: 'png', contentType: 'image/png' });
  assert.deepEqual((await readPhotoUpload(request())).bytes, PNG);
  await assert.rejects(readPhotoUpload(request(PNG, 'image/jpeg')), expectUploadError('invalid_image', 415));
  await assert.rejects(readPhotoUpload(request(new Uint8Array(64), 'image/png')), expectUploadError('invalid_image', 415));
  await assert.rejects(readPhotoUpload(request(PNG, 'image/gif')), expectUploadError('unsupported_type', 415));
});

test('rejects empty and oversized uploads before saving', async () => {
  await assert.rejects(readPhotoUpload(request(new Uint8Array(), 'image/png')), expectUploadError('empty_file', 400));
  await assert.rejects(readPhotoUpload(request(PNG, 'image/png', { 'Content-Length': String(MAX_PHOTO_BYTES + 1) })), expectUploadError('too_large', 413));
});

test('enforces the actual byte limit even without a trustworthy Content-Length', async () => {
  let cancelled = false;
  const body = new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(MAX_PHOTO_BYTES)); controller.enqueue(new Uint8Array(1)); },
    cancel() { cancelled = true; },
  });
  const streamed = new Request('https://example.test/upload', { method: 'POST', body, duplex: 'half', headers: { 'Content-Type': 'image/png', 'Content-Length': '1' } });
  await assert.rejects(readPhotoUpload(streamed), expectUploadError('too_large', 413));
  assert.equal(cancelled, true);
});

test('validates JPEG endings and WebP container length instead of trusting MIME alone', () => {
  const jpeg = new Uint8Array(20);
  jpeg.set([255, 216, 255]); jpeg.set([255, 217], 18);
  assert.equal(detectPhotoFormat(jpeg).contentType, 'image/jpeg');
  jpeg[19] = 0;
  assert.equal(detectPhotoFormat(jpeg), null);
  const webp = new Uint8Array(20);
  webp.set([82, 73, 70, 70, 12, 0, 0, 0, 87, 69, 66, 80, 86, 80, 56, 32]);
  assert.equal(detectPhotoFormat(webp).contentType, 'image/webp');
  webp[4] = 13;
  assert.equal(detectPhotoFormat(webp), null);
  assert.equal(detectPhotoFormat(PNG.slice(0, -1)), null);
});

test('stores an immutable photo and changes only the matching doctor image URL', async () => {
  const db = database();
  const r2 = bucket();
  const url = await saveDoctorPhoto(db, r2, 'doctor-one', request());
  assert.match(url, /^\/media\/[0-9a-f-]{36}\.png$/);
  const savedKey = [...r2.objects.keys()][0];
  assert.equal(savedKey, 'doctor-photos/' + url.slice('/media/'.length));
  assert.equal(r2.objects.get(savedKey).options.httpMetadata.contentType, 'image/png');
  const update = db.calls.find((call) => call.sql.startsWith('UPDATE'));
  assert.match(update.sql, /WHERE slug = \? AND image_url = \?$/);
  assert.deepEqual(update.values, [url, 'doctor-one', '/old.jpg']);
});

test('rejects unknown doctors before writing and cleans only the new object on a concurrent edit', async () => {
  const missingBucket = bucket();
  await assert.rejects(saveDoctorPhoto(database({ oldUrl: null }), missingBucket, 'missing', request()), expectUploadError('doctor_not_found', 404));
  assert.equal(missingBucket.objects.size, 0);

  const r2 = bucket();
  r2.objects.set('doctor-photos/previous.png', { size: 10 });
  await assert.rejects(saveDoctorPhoto(database({ changes: 0 }), r2, 'doctor-one', request()), expectUploadError('photo_changed', 409));
  assert.equal(r2.objects.size, 1);
  assert.ok(r2.objects.has('doctor-photos/previous.png'));
  assert.equal(r2.deleted.length, 1);
});

test('does not change the profile if storage rejects the upload', async () => {
  const db = database();
  const r2 = bucket();
  r2.put = async () => null;
  await assert.rejects(saveDoctorPhoto(db, r2, 'doctor-one', request()), expectUploadError('upload_failed', 500));
  assert.equal(db.calls.filter((call) => call.sql.startsWith('UPDATE')).length, 0);
  assert.equal(r2.deleted.length, 0);
});

test('invalid images and invalid slugs never reach storage', async () => {
  const db = database();
  const r2 = bucket();
  await assert.rejects(saveDoctorPhoto(db, r2, '../admin', request()), expectUploadError('doctor_not_found', 404));
  assert.equal(db.calls.length, 0);
  await assert.rejects(saveDoctorPhoto(db, r2, 'doctor-one', request(new Uint8Array(64))), expectUploadError('invalid_image', 415));
  assert.equal(r2.objects.size, 0);
  assert.equal(db.calls.filter((call) => call.sql.startsWith('UPDATE')).length, 0);
});

test('photo replacement works for inactive profiles and keeps all other SQLite fields intact', async () => {
  const sqlite = new DatabaseSync(':memory:');
  try {
    for (const statement of schemaStatements) sqlite.exec(statement);
    sqlite.prepare(`INSERT INTO doctors (slug, name_ru, name_kk, role_ru, role_kk, bio_ru, bio_kk, focus_ru, focus_kk, image_url, active)
      VALUES ('doctor-one', 'Доктор Тестов', 'Сынақ Дәрігер', 'Терапевт', 'Терапевт', '', '', '', '', '/old.jpg', 0)`).run();
    const d1 = {
      prepare(sql) {
        return { bind: (...values) => ({
          first: async () => sqlite.prepare(sql).get(...values),
          run: async () => ({ success: true, meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } }),
        }) };
      },
    };
    const r2 = bucket();
    const imageUrl = await saveDoctorPhoto(d1, r2, 'doctor-one', request());
    const doctor = sqlite.prepare("SELECT * FROM doctors WHERE slug = 'doctor-one'").get();
    assert.equal(doctor.image_url, imageUrl);
    assert.equal(doctor.name_ru, 'Доктор Тестов');
    assert.equal(doctor.name_kk, 'Сынақ Дәрігер');
    assert.equal(doctor.active, 0);
    const anotherUrl = await saveDoctorPhoto(d1, r2, 'doctor-one', request());
    assert.notEqual(anotherUrl, imageUrl);
    assert.equal(r2.objects.size, 2);
    assert.equal(r2.deleted.length, 0);
  } finally { sqlite.close(); }
});

test('failed database writes never remove previous photos', async () => {
  const r2 = bucket();
  r2.objects.set('doctor-photos/previous.png', { size: 10 });
  await assert.rejects(saveDoctorPhoto(database({ updateSuccess: false }), r2, 'doctor-one', request()), expectUploadError('save_failed', 500));
  assert.ok(r2.objects.has('doctor-photos/previous.png'));
  assert.equal(r2.deleted.length, 0);
});

test('serves only generated photo keys with safe immutable headers', async () => {
  const r2 = bucket();
  const filename = '123e4567-e89b-12d3-a456-426614174000.png';
  await r2.put('doctor-photos/' + filename, PNG, {});
  const response = await servePhoto(r2, filename);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'image/png');
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.match(response.headers.get('Cache-Control'), /immutable/);
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), PNG);
  assert.equal((await servePhoto(r2, filename, true)).body, null);
  assert.equal((await servePhoto(r2, '../secrets.png')).status, 404);
  assert.equal((await servePhoto(r2, 'not-a-uuid.png')).status, 404);
  assert.equal((await servePhoto(r2, filename.replace('174000', '174001'))).status, 404);
});
