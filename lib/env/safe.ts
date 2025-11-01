import { getBaseUrl } from '../url';
import { getEnvSafe } from './getEnvSafe';

export function getSafeEnv() {
  return {
    SUPABASE_URL: getEnvSafe('NEXT_PUBLIC_SUPABASE_URL') ?? '',
    SUPABASE_ANON: getEnvSafe('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? '',
    BASE_URL: getBaseUrl() || 'http://localhost:3000'
  };
}

// Legacy export for backward compatibility
export const SAFE = getSafeEnv();