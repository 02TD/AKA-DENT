import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function clean(value: unknown, max = 240) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (clean(body.website)) return new NextResponse(null, { status: 204 });

    const name = clean(body.name, 80);
    const phone = clean(body.phone, 40);
    const serviceSlug = clean(body.serviceSlug, 80);
    const doctorSlug = clean(body.doctorSlug, 80);
    const notes = clean(body.notes, 500);
    const language = body.language === 'kk' ? 'kk' : 'ru';
    if (name.length < 2 || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'invalid_contact' }, { status: 400 });
    }

    const db = await getDb();
    const id = crypto.randomUUID();
    await db.prepare(`INSERT INTO appointments
      (id, name, phone, service_slug, doctor_slug, language, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(id, name, phone, serviceSlug, doctorSlug, language, notes).run();

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error('appointment', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
}
