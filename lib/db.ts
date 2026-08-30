import { env } from 'cloudflare:workers';
import { doctorsSeed, reviewsSeed, schemaStatements, servicesSeed, settingsSeed } from '@/db/schema';

type RuntimeEnv = { DB: D1Database; ADMIN_EMAIL?: string };

let schemaReady = false;

export function getRuntimeEnv() {
  return env as unknown as RuntimeEnv;
}

export async function getDb() {
  const db = getRuntimeEnv().DB;
  if (!db) throw new Error('D1 binding DB is not available');
  if (!schemaReady) await ensureDatabase(db);
  return db;
}

export async function ensureDatabase(db: D1Database) {
  await db.batch(schemaStatements.map((statement) => db.prepare(statement)));

  const seedQueries: D1PreparedStatement[] = [];
  settingsSeed.forEach(([key, valueRu, valueKk]) => {
    seedQueries.push(db.prepare('INSERT OR IGNORE INTO settings (key, value_ru, value_kk) VALUES (?, ?, ?)').bind(key, valueRu, valueKk));
  });
  servicesSeed.forEach((service) => {
    seedQueries.push(db.prepare(`INSERT OR IGNORE INTO services
      (id, slug, title_ru, title_kk, description_ru, description_kk, price_from, price_to, unit, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      service.id, service.slug, service.title_ru, service.title_kk, service.description_ru,
      service.description_kk, service.price_from, service.price_to, service.unit, service.sort_order,
    ));
  });
  doctorsSeed.forEach((doctor) => {
    seedQueries.push(db.prepare(`INSERT OR IGNORE INTO doctors
      (slug, name_ru, name_kk, role_ru, role_kk, bio_ru, bio_kk, focus_ru, focus_kk, image_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      doctor.slug, doctor.name_ru, doctor.name_kk, doctor.role_ru, doctor.role_kk,
      doctor.bio_ru, doctor.bio_kk, doctor.focus_ru, doctor.focus_kk, doctor.image_url, doctor.sort_order,
    ));
  });
  reviewsSeed.forEach((review) => {
    seedQueries.push(db.prepare(`INSERT OR IGNORE INTO reviews
      (id, author, rating, body_ru, body_kk, source_url, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
      review.id, review.author, review.rating, review.body_ru, review.body_kk, review.source_url, review.published_at,
    ));
  });
  if (seedQueries.length) await db.batch(seedQueries);
  await db.prepare('PRAGMA optimize').run();
  schemaReady = true;
}

export async function getPublicData() {
  const db = await getDb();
  const [settings, services, doctors, reviews] = await Promise.all([
    db.prepare('SELECT key, value_ru, value_kk, updated_at FROM settings ORDER BY key').all(),
    db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY sort_order, title_ru').all(),
    db.prepare('SELECT * FROM doctors WHERE active = 1 ORDER BY sort_order, name_ru').all(),
    db.prepare('SELECT * FROM reviews WHERE active = 1 ORDER BY published_at DESC, updated_at DESC LIMIT 6').all(),
  ]);
  return { settings: settings.results, services: services.results, doctors: doctors.results, reviews: reviews.results };
}

export async function getDoctorBySlug(slug: string) {
  const db = await getDb();
  return db.prepare('SELECT * FROM doctors WHERE slug = ? AND active = 1 LIMIT 1').bind(slug).first<Record<string, unknown>>();
}
