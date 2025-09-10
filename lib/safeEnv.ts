// lib/safeEnv.ts
type PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

export function getPublicEnv(): PublicEnv {
  // During CI build we may provide harmless defaults; in runtime, Railway will inject real vars.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon';
  return { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: anon };
}