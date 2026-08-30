import { NextResponse } from 'next/server';
import { getPublicData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getPublicData();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } });
  } catch (error) {
    console.error('public-data', error);
    return NextResponse.json({ error: 'data_unavailable' }, { status: 500 });
  }
}
