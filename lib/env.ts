/**
 * Environment validation and utilities for Supabase configuration
 * Validates required env vars and provides redaction helpers
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
 * Validates Supabase environment variables
 * Throws on missing vars or invalid formats
 */
export function validateSupabaseEnv(): SupabaseEnv {
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

  // Check NEXT_PUBLIC_SUPABASE_ANON_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  } else {
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey;
    
    if (!anonKey.startsWith('sbp_')) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY must start with "sbp_"');
    }
  }

  // Check SUPABASE_SERVICE_ROLE_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required');
  } else {
    env.SUPABASE_SERVICE_ROLE_KEY = serviceKey;
    
    if (!serviceKey.startsWith('sbs_')) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY must start with "sbs_"');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Supabase environment validation failed:\n${errors.join('\n')}`);
  }

  return env as SupabaseEnv;
}

/**
 * Safely validates environment without throwing
 * Returns validation result with errors array
 */
export function validateSupabaseEnvSafe(): ValidationResult {
  try {
    const env = validateSupabaseEnv();
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
 * Redacts sensitive values for logging
 * Shows first and last N characters, replaces middle with asterisks
 */
export function redact(value: string, keep: number = 4): string {
  if (!value || value.length <= keep * 2) {
    return '*'.repeat(Math.max(4, value?.length || 4));
  }
  
  const start = value.substring(0, keep);
  const end = value.substring(value.length - keep);
  const middle = '*'.repeat(Math.max(4, value.length - (keep * 2)));
  
  return `${start}${middle}${end}`;
}

/**
 * Gets validated environment variables
 * Throws if validation fails
 */
export function getSupabaseEnv(): SupabaseEnv {
  return validateSupabaseEnv();
}

/**
 * Gets environment variables safely without throwing
 * Returns partial env with validation status
 */
export function getSupabaseEnvSafe(): ValidationResult {
  return validateSupabaseEnvSafe();
}


