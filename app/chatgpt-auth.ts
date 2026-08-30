import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getRuntimeEnv } from '@/lib/db';

export type ChatGPTUser = { id: string; email: string; name: string | null };

export function chatgptSignInPath(returnTo = '/') {
  const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/';
  return '/signin-with-chatgpt?return_to=' + encodeURIComponent(safeReturnTo);
}

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const id = requestHeaders.get('oai-authenticated-user-id');
  const email = requestHeaders.get('oai-authenticated-user-email');
  if (!id || !email) return null;

  const encodedName = requestHeaders.get('oai-authenticated-user-full-name');
  const encoding = requestHeaders.get('oai-authenticated-user-full-name-encoding');
  let name: string | null = null;
  if (encodedName && encoding === 'percent-encoded-utf-8') {
    try { name = decodeURIComponent(encodedName); } catch { name = null; }
  }
  return { id, email, name };
}

export async function requireChatGPTUser(returnTo = '/') {
  const user = await getChatGPTUser();
  if (!user) redirect(chatgptSignInPath(returnTo));
  return user;
}

export async function isAdminUser() {
  const user = await getChatGPTUser();
  if (!user) return { ok: false as const, user: null, reason: 'signed_out' as const };
  const configuredEmail = getRuntimeEnv().ADMIN_EMAIL?.trim().toLowerCase();
  const devAdmin = process.env.NODE_ENV !== 'production' && user.email.toLowerCase() === 'seedy@sites.test';
  if (!configuredEmail && !devAdmin) return { ok: false as const, user, reason: 'not_configured' as const };
  if (!devAdmin && user.email.toLowerCase() !== configuredEmail) return { ok: false as const, user, reason: 'forbidden' as const };
  return { ok: true as const, user, reason: null };
}
