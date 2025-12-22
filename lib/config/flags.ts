/**
 * Rock-solid feature flag helpers for server and client
 * 
 * This module provides canonical flag reading with:
 * - Comprehensive boolean value parsing
 * - Server vs client environment handling
 * - Validation and logging
 * - Type safety
 */

// === BOOLEAN FLAG PARSER ===

/**
 * Enhanced boolean flag parser with comprehensive value support
 * Supports: "1"/"0", "true"/"false", "yes"/"no", "on"/"off" (case-insensitive, whitespace-trimmed)
 */
export function readBooleanFlag(name: string, defaultVal: boolean = false): boolean {
  const value = process.env[name];
  if (value === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[FLAG] ${name}: using default ${defaultVal}`);
    }
    return defaultVal;
  }
  
  const normalized = value.trim().toLowerCase();
  const result = ['1', 'true', 'yes', 'on'].includes(normalized);
  
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[FLAG] ${name}: "${value}" → ${result}`);
  }
  
  return result;
}

// === CLIENT-SIDE FLAG HELPERS ===

/**
 * Client-safe flag reader - only reads NEXT_PUBLIC_* variables
 * Use this in client components to avoid server-only env vars
 */
export function readClientFlag(name: string, defaultVal: boolean = false): boolean {
  if (!name.startsWith('NEXT_PUBLIC_')) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[FLAG] Client flag "${name}" should start with NEXT_PUBLIC_`);
    }
    return defaultVal;
  }
  
  return readBooleanFlag(name, defaultVal);
}

// === SERVER-SIDE FLAG HELPERS ===

/**
 * Server-safe flag reader - can read both server and client flags
 * Use this in server components and API routes
 */
export function readServerFlag(name: string, defaultVal: boolean = false): boolean {
  return readBooleanFlag(name, defaultVal);
}

// === FLAG SNAPSHOT ===

/**
 * CANONICAL FLAGS ONLY - Get a snapshot of all canonical flags
 * Only includes the 5 canonical flags, not deprecated ones
 */
export function getFlagsSnapshot() {
  const canonicalFlags = [
    'FF_BOOST',
    'FF_CLERK',
    'FF_SITE_VERSION',
    'FF_N8N_NOOP',
    'ENABLE_STRIPE',
  ];
  
  const snapshot: Record<string, { value: boolean | string; raw: string | undefined; source: string }> = {};
  
  for (const flag of canonicalFlags) {
    const raw = process.env[flag];
    const value = flag === 'FF_SITE_VERSION' 
      ? (raw ?? 'v1') 
      : readBooleanFlag(flag, flag === 'FF_N8N_NOOP');
    const source = raw ? 'env' : 'default';
    
    snapshot[flag] = { value, raw, source };
  }
  
  return snapshot;
}

// === VALIDATION HELPERS ===

/**
 * Validate that all required canonical flags are set
 * Warns if flags are missing (uses defaults)
 */
export function validateFlags() {
  const canonicalFlags = [
    { name: 'FF_BOOST', required: false },
    { name: 'FF_CLERK', required: false },
    { name: 'FF_SITE_VERSION', required: false },
    { name: 'FF_N8N_NOOP', required: false },
    { name: 'ENABLE_STRIPE', required: false },
  ];
  
  const missing: string[] = [];
  
  for (const flag of canonicalFlags) {
    if (process.env[flag.name] === undefined) {
      missing.push(flag.name);
    }
  }
  
  if (missing.length > 0 && process.env.NODE_ENV !== 'production') {
    console.debug(`[FLAG] Using defaults for: ${missing.join(', ')}`);
  }
}

// === LEGACY COMPATIBILITY ===

/**
 * Legacy compatibility - use this to gradually migrate from direct process.env usage
 * @deprecated Use readBooleanFlag, readClientFlag, or readServerFlag instead
 */
export function readEnvAny(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined) return value;
  }
  return undefined;
}

// === USAGE EXAMPLES ===

/*
// Client component
'use client';
import { readClientFlag } from '@/lib/config/flags';

export function MyComponent() {
  const stripeEnabled = readClientFlag('NEXT_PUBLIC_ENABLE_STRIPE', true);
  // ...
}

// Server component
import { readServerFlag } from '@/lib/config/flags';

export function MyServerComponent() {
  const n8nNoop = readServerFlag('FF_N8N_NOOP', true);
  // ...
}

// API route
import { getFlagsSnapshot, validateFlags } from '@/lib/config/flags';

export async function GET() {
  validateFlags();
  const flags = getFlagsSnapshot();
  return Response.json({ flags });
}
*/