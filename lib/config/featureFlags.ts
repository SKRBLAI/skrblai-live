/** Canonical flag registry for client-side usage. */

export type SiteVersion = 'legacy' | 'new';

export interface FlagRegistry {
  FF_BOOST: boolean;
  FF_CLERK: boolean;
  FF_N8N_NOOP: boolean;
  FF_SITE_VERSION: SiteVersion;
  FF_STRIPE_FALLBACK: boolean;
}

type RegistryKey = keyof FlagRegistry;

const TRUE_LITERALS = new Set(['1', 'true', 'yes', 'on']);
const FALSE_LITERALS = new Set(['0', 'false', 'no', 'off']);

const PRIMARY_ENV: Record<RegistryKey, string> = {
  FF_BOOST: 'FF_BOOST',
  FF_CLERK: 'FF_CLERK',
  FF_N8N_NOOP: 'FF_N8N_NOOP',
  FF_SITE_VERSION: 'FF_SITE_VERSION',
  FF_STRIPE_FALLBACK: 'FF_STRIPE_FALLBACK',
};

const DEPRECATED_ENV: Partial<Record<RegistryKey, string[]>> = {
  FF_BOOST: ['NEXT_PUBLIC_FF_USE_BOOST'],
  FF_CLERK: ['NEXT_PUBLIC_FF_CLERK'],
  FF_N8N_NOOP: ['NEXT_PUBLIC_FF_N8N'],
  FF_SITE_VERSION: ['NEXT_PUBLIC_SITE_VERSION', 'NEXT_PUBLIC_FF_SITE_VERSION'],
};

const loggedDeprecations = new Set<string>();

function maybeLogDeprecated(oldKey: string, newKey: string) {
  if (process.env.NODE_ENV === 'production') return;
  const cacheKey = `${oldKey}->${newKey}`;
  if (loggedDeprecations.has(cacheKey)) return;
  loggedDeprecations.add(cacheKey);
  console.warn(
    `[featureFlags] Environment variable "${oldKey}" is deprecated. Please migrate to "${newKey}".`
  );
}

function readEnvValue(key: string | undefined): string | undefined {
  return key ? process.env[key] : undefined;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (TRUE_LITERALS.has(normalized)) return true;
  if (FALSE_LITERALS.has(normalized)) return false;
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[featureFlags] Unable to parse boolean value "${value}". Falling back to ${fallback}.`
    );
  }
  return fallback;
}

function readBooleanFlag(key: RegistryKey, fallback: boolean): boolean {
  const primary = readEnvValue(PRIMARY_ENV[key]);
  if (primary !== undefined) {
    return parseBoolean(primary, fallback);
  }

  const deprecatedKeys = DEPRECATED_ENV[key] ?? [];
  for (const deprecatedKey of deprecatedKeys) {
    const deprecatedValue = readEnvValue(deprecatedKey);
    if (deprecatedValue !== undefined) {
      maybeLogDeprecated(deprecatedKey, PRIMARY_ENV[key]);
      return parseBoolean(deprecatedValue, fallback);
    }
  }

  return fallback;
}

function readSiteVersionFlag(fallback: SiteVersion): SiteVersion {
  const primary = readEnvValue(PRIMARY_ENV.FF_SITE_VERSION);
  if (primary !== undefined) {
    return normalizeSiteVersion(primary, fallback);
  }

  const deprecatedKeys = DEPRECATED_ENV.FF_SITE_VERSION ?? [];
  for (const deprecatedKey of deprecatedKeys) {
    const deprecatedValue = readEnvValue(deprecatedKey);
    if (deprecatedValue !== undefined) {
      maybeLogDeprecated(deprecatedKey, PRIMARY_ENV.FF_SITE_VERSION);
      return normalizeSiteVersion(deprecatedValue, fallback);
    }
  }

  return fallback;
}

function normalizeSiteVersion(value: string, fallback: SiteVersion): SiteVersion {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'legacy' || normalized === 'new') {
    return normalized;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[featureFlags] Invalid FF_SITE_VERSION value "${value}". Falling back to "${fallback}".`
    );
  }
  return fallback;
}

// Single source of truth (client-safe). Never read process.env in components.
const registry: FlagRegistry = {
  FF_BOOST: readBooleanFlag('FF_BOOST', true),
  FF_CLERK: readBooleanFlag('FF_CLERK', false),
  FF_N8N_NOOP: readBooleanFlag('FF_N8N_NOOP', true),
  FF_SITE_VERSION: readSiteVersionFlag('legacy'),
  FF_STRIPE_FALLBACK: readBooleanFlag('FF_STRIPE_FALLBACK', false),
};

export function isBoost(): boolean {
  return registry.FF_BOOST;
}

export function isClerk(): boolean {
  return registry.FF_CLERK;
}

export function isN8nNoop(): boolean {
  return registry.FF_N8N_NOOP;
}

export function siteVersion(): SiteVersion {
  return registry.FF_SITE_VERSION;
}

export function isStripeFallback(): boolean {
  return registry.FF_STRIPE_FALLBACK;
}

export function getFlagRegistry(): Readonly<FlagRegistry> {
  return { ...registry };
}

// Optional runtime updater for dev-only diagnostics overlay.
export function __devSetFlags(patch: Partial<FlagRegistry>): void {
  if (process.env.NODE_ENV !== 'production') {
    Object.assign(registry, patch);
  }
}

export type { FlagRegistry as FeatureFlagRegistry };