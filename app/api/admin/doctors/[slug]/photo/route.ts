import { NextResponse } from 'next/server';
import { isAdminUser } from '@/app/chatgpt-auth';
import { getDb, getRuntimeEnv } from '@/lib/db';
import { PhotoUploadError, saveDoctorPhoto } from '@/lib/photo-upload';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const auth = await isAdminUser();
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.reason === 'signed_out' ? 401 : 403 });
  if (request.headers.get('x-aka-dent-upload') !== '1' || request.headers.get('sec-fetch-site') === 'cross-site') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const bucket = getRuntimeEnv().PHOTOS;
  if (!bucket) return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 });
  try {
    const { slug } = await context.params;
    const imageUrl = await saveDoctorPhoto(await getDb(), bucket, slug, request);
    return NextResponse.json({ ok: true, imageUrl }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof PhotoUploadError) return NextResponse.json({ error: error.code }, { status: error.status });
    console.error('doctor-photo-upload failed');
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 });
  }
}
