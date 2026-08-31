import { NextResponse } from 'next/server';
import { isAdminUser } from '@/app/chatgpt-auth';
import { getDb, getPublicData } from '@/lib/db';
import { ADMIN_APPOINTMENTS_QUERY } from '@/lib/appointments';

export const dynamic = 'force-dynamic';

function clean(value: unknown, max = 1000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function authorize() {
  const auth = await isAdminUser();
  if (auth.ok) return null;
  return NextResponse.json({ error: auth.reason }, { status: auth.reason === 'signed_out' ? 401 : 403 });
}

export async function GET() {
  const denied = await authorize();
  if (denied) return denied;
  try {
    const db = await getDb();
    const [data, appointments] = await Promise.all([
      getPublicData(),
      db.prepare(ADMIN_APPOINTMENTS_QUERY).all(),
    ]);
    return NextResponse.json({ ...data, appointments: appointments.results });
  } catch (error) {
    console.error('admin-get', error);
    return NextResponse.json({ error: 'data_unavailable' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await authorize();
  if (denied) return denied;
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = clean(body.action, 60);
    const db = await getDb();

    if (action === 'update_service') {
      const id = clean(body.id, 80);
      await db.prepare(`UPDATE services SET
        title_ru = ?, title_kk = ?, description_ru = ?, description_kk = ?,
        price_from = ?, price_to = ?, active = ?, updated_at = datetime('now')
        WHERE id = ?`).bind(
        clean(body.title_ru, 120), clean(body.title_kk, 120), clean(body.description_ru), clean(body.description_kk),
        Number.isFinite(Number(body.price_from)) ? Number(body.price_from) : null,
        body.price_to === '' || body.price_to == null ? null : Number(body.price_to),
        body.active === false ? 0 : 1, id,
      ).run();
    } else if (action === 'update_doctor') {
      const slug = clean(body.slug, 80);
      await db.prepare(`UPDATE doctors SET
        name_ru = ?, name_kk = ?, role_ru = ?, role_kk = ?, bio_ru = ?, bio_kk = ?,
        focus_ru = ?, focus_kk = ?, image_url = ?, active = ?, updated_at = datetime('now')
        WHERE slug = ?`).bind(
        clean(body.name_ru, 120), clean(body.name_kk, 120), clean(body.role_ru, 180), clean(body.role_kk, 180),
        clean(body.bio_ru), clean(body.bio_kk), clean(body.focus_ru, 240), clean(body.focus_kk, 240),
        clean(body.image_url, 400), body.active === false ? 0 : 1, slug,
      ).run();
    } else if (action === 'upsert_review') {
      const id = clean(body.id, 100) || crypto.randomUUID();
      const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));
      const publishedAt = clean(body.published_at, 20) || new Date().toISOString().slice(0, 10);
      await db.prepare(`INSERT INTO reviews
        (id, author, rating, body_ru, body_kk, source_url, published_at, active, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET author = excluded.author, rating = excluded.rating,
        body_ru = excluded.body_ru, body_kk = excluded.body_kk, source_url = excluded.source_url,
        published_at = excluded.published_at, active = excluded.active, updated_at = datetime('now')`).bind(
        id, clean(body.author, 120), rating, clean(body.body_ru), clean(body.body_kk),
        clean(body.source_url, 400), publishedAt, body.active === false ? 0 : 1,
      ).run();
    } else if (action === 'update_setting') {
      const key = clean(body.key, 80);
      await db.prepare(`INSERT INTO settings (key, value_ru, value_kk, updated_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET value_ru = excluded.value_ru, value_kk = excluded.value_kk,
        updated_at = datetime('now')`).bind(key, clean(body.value_ru), clean(body.value_kk)).run();
    } else if (action === 'update_appointment_status') {
      const status = ['new', 'contacted', 'confirmed', 'done', 'cancelled'].includes(clean(body.status, 20)) ? clean(body.status, 20) : 'new';
      await db.prepare(`UPDATE appointments SET status = ?, updated_at = datetime('now') WHERE id = ?`).bind(status, clean(body.id, 80)).run();
    } else {
      return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('admin-post', error);
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }
}
