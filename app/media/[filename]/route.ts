import { getRuntimeEnv } from '@/lib/db';
import { servePhoto } from '@/lib/photo-upload';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ filename: string }> };

async function respond(context: Context, headOnly: boolean) {
  const bucket = getRuntimeEnv().PHOTOS;
  if (!bucket) return new Response('Photo storage unavailable', { status: 503 });
  try {
    const { filename } = await context.params;
    return await servePhoto(bucket, filename, headOnly);
  } catch {
    return new Response('Photo temporarily unavailable', { status: 503 });
  }
}

export async function GET(_request: Request, context: Context) { return respond(context, false); }
export async function HEAD(_request: Request, context: Context) { return respond(context, true); }
