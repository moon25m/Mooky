export function sanitizeDbUrl(raw?: string) {
  if (!raw) return '';
  let s = raw.trim();
  s = s.replace(/^psql\s+/, '');
  s = s.replace(/^['"]|['"]$/g, '');
  return s;
}
