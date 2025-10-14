/**
 * Environment validation and utilities for Supabase configuration
 * Validates required env vars and provides redaction helpers
 * Supports new Supabase keys: sb_publishable_*, sb_secret_* (and legacy sbp_/sbs_)
 */

export interface SupabaseEnv {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  env: Partial<SupabaseEnv>;
}

/**
 * New safe validation that accepts both legacy and new Supabase API key formats
 * Returns validation checks and redaction helper
 */
export function redact(v?: string, keep = 4) {
  if (!v) return "";
  const head = v.slice(0, keep);
  return head + "****";
}

export function validateEnvSafe() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Accept both default Supabase URLs and custom domains
  const urlOk =
    typeof url === "string" &&
    (
      /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) || // Default Supabase URL
      /^https:\/\/auth\.skrblai\.io$/i.test(url) || // Custom domain
      url.startsWith('https://') // Allow any HTTPS URL (for flexibility)
    );

  // Accept both legacy JWT (eyJ...) and new format (sbp_/sb_publishable_)
  const anonPrefixOk = !!anon && (/^eyJ/.test(anon) || /^sbp_/.test(anon) || /^sb_publishable_/i.test(anon));
  const serviceRolePrefixOk = !!service && (/^eyJ/.test(service) || /^sbs_/.test(service) || /^sb_secret_/i.test(service));

  return {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
      SUPABASE_SERVICE_ROLE_KEY: service,
    },
    checks: { urlOk, anonPrefixOk, serviceRolePrefixOk },
    redact,
  };
}

/**
 * Validates Supabase environment variables at runtime
 * Throws on missing vars or invalid formats - only call this inside handlers
 * @throws {Error} When environment validation fails
 */
export function assertEnvAtRuntime(): SupabaseEnv {
  const errors: string[] = [];
  const env: Partial<SupabaseEnv> = {};

  // Check NEXT_PUBLIC_SUPABASE_URL
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  } else {
    env.NEXT_PUBLIC_SUPABASE_URL = url;
    
    // Validate URL format
    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.startsWith('https:')) {
        errors.push('NEXT_PUBLIC_SUPABASE_URL must use HTTPS');
      }
      if (!urlObj.hostname.endsWith('.supabase.co')) {
        errors.push('NEXT_PUBLIC_SUPABASE_URL must end with .supabase.co');
      }
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid URL');
    }
  }

  // Check NEXT_PUBLIC_SUPABASE_ANON_KEY (supporting both legacy JWT and new formats)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  } else {
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey;
    
    // Accept legacy JWT format (eyJ...) OR new format (sbp_/sb_publishable_)
    const isLegacyJWT = anonKey.startsWith('eyJ');
    const isNewFormat = anonKey.startsWith('sbp_') || anonKey.startsWith('sb_publishable_');
    
    if (!isLegacyJWT && !isNewFormat) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY must start with "eyJ" (legacy JWT), "sbp_", or "sb_publishable_"');
    }
  }

  // Check SUPABASE_SERVICE_ROLE_KEY (supporting both legacy JWT and new formats)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required');
  } else {
    env.SUPABASE_SERVICE_ROLE_KEY = serviceKey;
    
    // Accept legacy JWT format (eyJ...) OR new format (sbs_/sb_secret_)
    const isLegacyJWT = serviceKey.startsWith('eyJ');
    const isNewFormat = serviceKey.startsWith('sbs_') || serviceKey.startsWith('sb_secret_');
    
    if (!isLegacyJWT && !isNewFormat) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY must start with "eyJ" (legacy JWT), "sbs_", or "sb_secret_"');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Supabase environment validation failed:\n${errors.join('\n')}`);
  }

  return env as SupabaseEnv;
}

/**
 * @deprecated Use assertEnvAtRuntime() instead - only call inside handlers/components, not at import time
 */
export function validateSupabaseEnv(): SupabaseEnv {
  return assertEnvAtRuntime();
}

/**
 * Safely validates environment without throwing
 * Returns validation result with errors array
 */
export function validateSupabaseEnvSafe(): ValidationResult {
  try {
    const env = assertEnvAtRuntime();
    return { isValid: true, errors: [], env };
  } catch (error) {
    return {
      isValid: false,
      errors: error instanceof Error ? error.message.split('\n').slice(1) : ['Unknown validation error'],
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    };
  }
}

/**
 * Gets validated environment variables at runtime
 * Throws if validation fails - only call inside handlers/components
 * @deprecated Use assertEnvAtRuntime() directly
 */
export function getSupabaseEnv(): SupabaseEnv {
  return assertEnvAtRuntime();
}

/**
 * Gets environment variables safely without throwing
 * Returns partial env with validation status
 */
export function getSupabaseEnvSafe(): ValidationResult {
  return validateSupabaseEnvSafe();
}


