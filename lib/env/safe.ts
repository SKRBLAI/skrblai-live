import { getBaseUrl } from '../url';

export const SAFE = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  BASE_URL: getBaseUrl() || 'http://localhost:3000'
};