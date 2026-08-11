export function joinBase(base: string, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (p === '/') return `${b}/`;
  return `${b}${p}`;
}

export function href(path: string): string {
  return joinBase(import.meta.env.BASE_URL, path);
}
