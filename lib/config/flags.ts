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
 * Get a snapshot of all known flags with their current values
 * Useful for debugging and monitoring
 */
export function getFlagsSnapshot() {
  const knownFlags = [
    // Client flags
    'NEXT_PUBLIC_ENABLE_STRIPE',
    'NEXT_PUBLIC_HP_GUIDE_STAR', 
    'NEXT_PUBLIC_ENABLE_ORBIT',
    'NEXT_PUBLIC_ENABLE_BUNDLES',
    'NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS',
    'NEXT_PUBLIC_SHOW_PERCY_WIDGET',
    'NEXT_PUBLIC_USE_OPTIMIZED_PERCY',
    'NEXT_PUBLIC_ENABLE_PERCY_ANIMATIONS',
    'NEXT_PUBLIC_ENABLE_PERCY_AVATAR',
    'NEXT_PUBLIC_ENABLE_PERCY_CHAT',
    'NEXT_PUBLIC_ENABLE_PERCY_SOCIAL_PROOF',
    'NEXT_PUBLIC_PERCY_PERFORMANCE_MONITORING',
    'NEXT_PUBLIC_PERCY_AUTO_FALLBACK',
    'NEXT_PUBLIC_PERCY_LOG_SWITCHES',
    'NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE',
    'NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN',
    'NEXT_PUBLIC_URGENCY_BANNERS',
    'NEXT_PUBLIC_LIVE_METRICS',
    
    // Server flags
    'FF_N8N_NOOP',
  ];
  
  const snapshot: Record<string, { value: boolean; raw: string | undefined; source: string }> = {};
  
  for (const flag of knownFlags) {
    const raw = process.env[flag];
    const value = readBooleanFlag(flag, false);
    const source = raw ? (flag.startsWith('NEXT_PUBLIC_') ? 'NEXT_PUBLIC_' : 'server') : 'default';
    
    snapshot[flag] = { value, raw, source };
  }
  
  return snapshot;
}

// === VALIDATION HELPERS ===

/**
 * Validate that all required flags are set
 * Throws in production if critical flags are missing
 */
export function validateFlags() {
  const criticalFlags = [
    'NEXT_PUBLIC_ENABLE_STRIPE',
  ];
  
  const missing: string[] = [];
  
  for (const flag of criticalFlags) {
    if (process.env[flag] === undefined) {
      missing.push(flag);
    }
  }
  
  if (missing.length > 0) {
    const message = `Missing critical flags: ${missing.join(', ')}`;
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    } else {
      console.warn(`[FLAG] ${message}`);
    }
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