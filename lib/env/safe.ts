import { getBaseUrl } from '../url';

export function getSafeEnv() {
  return {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    SUPABASE_ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    BASE_URL: getBaseUrl() || 'http://localhost:3000'
  };
}

// Legacy export for backward compatibility
export const SAFE = getSafeEnv();