const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const SITE_BASE_PATH = configuredBasePath
  ? '/' + configuredBasePath.replace(/^\/+|\/+$/g, '')
  : '';

export function sitePath(path = '/') {
  if (!path || path === '/') return SITE_BASE_PATH ? SITE_BASE_PATH + '/' : '/';
  if (path.startsWith('#') || /^(?:https?:|tel:|mailto:|data:|blob:)/.test(path)) return path;
  return SITE_BASE_PATH + (path.startsWith('/') ? path : '/' + path);
}

export function assetPath(path: string) {
  if (!path || /^(?:https?:|data:|blob:)/.test(path)) return path;
  return sitePath(path);
}
