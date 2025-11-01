export function getEnvSafe(key: string): string | undefined {
  const env = process.env[key];
  if (env && env.trim() !== "") return env;

  // Boost-first mapping
  const boostMap: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL: "NEXT_PUBLIC_SUPABASE_URL_BOOST",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST",
    SUPABASE_SERVICE_ROLE_KEY: "SUPABASE_SERVICE_ROLE_KEY_BOOST",
  };

  const boostKey = boostMap[key];
  if (boostKey && process.env[boostKey]) {
    console.warn(`[env-fallback] Using Boost key for ${key} → ${boostKey}`);
    return process.env[boostKey];
  }

  return undefined;
}
