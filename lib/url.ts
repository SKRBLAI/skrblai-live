// lib/url.ts
export const getBaseUrl = () => {
  const raw =
    process.env.SITE_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    '';
  // strip trailing slash and any accidental :PORT
  return raw.replace(/\/$/, '').replace(/:\d+$/, '');
};