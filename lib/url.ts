// lib/url.ts
export function getBaseUrl() {
  const env = (process.env.NEXT_PUBLIC_BASE_URL ?? '').trim().replace(/\/+$/, '');
  // Never allow accidental :PORT on public URL
  return env.replace(/:\d+$/, '');
}