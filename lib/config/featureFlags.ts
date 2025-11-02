/**
 * Canonical feature flag registry.
 *
 * Goals
 *  - Centralize flag metadata and defaults in one place.
 *  - Provide safe, lazy helpers for reading env-backed flags on both server and edge runtimes.
 *  - Support audit/reporting without importing application logic.
 */

export type SiteVersion = 'legacy' | 'new';
type FlagType = 'boolean' | 'string';

type FlagDefinition = {
  key: string;
  type: FlagType;
  default: boolean | string;
  description?: string;
  public?: boolean;
  tags?: string[];
};

const FLAG_DEFINITIONS: FlagDefinition[] = [
  { key: 'FF_BOOST', type: 'boolean', default: false, description: 'Enable Boost Supabase routing/auth', tags: ['auth', 'boost'] },
  { key: 'FF_CLERK', type: 'boolean', default: false, description: 'Enable Clerk auth wiring (server)', tags: ['auth', 'clerk'] },
  { key: 'FF_N8N_NOOP', type: 'boolean', default: true, description: 'Run n8n integrations in NOOP safe mode', tags: ['automation'] },
  { key: 'FF_SITE_VERSION', type: 'string', default: 'legacy', description: 'Select which site shell to serve (legacy|new)', tags: ['routing'] },
  { key: 'FF_USE_BOOST_FOR_AUTH', type: 'boolean', default: false, description: 'Legacy Boost auth gateway', tags: ['auth', 'boost'] },
  { key: 'NEXT_PUBLIC_FF_CLERK', type: 'boolean', default: false, description: 'Enable Clerk client bundles', public: true, tags: ['auth', 'clerk'] },
  { key: 'NEXT_PUBLIC_ENABLE_STRIPE', type: 'boolean', default: true, description: 'Global Stripe payment toggle', public: true, tags: ['payments'] },
  { key: 'NEXT_PUBLIC_HP_GUIDE_STAR', type: 'boolean', default: true, description: 'Render homepage guide star', public: true, tags: ['marketing'] },
  { key: 'NEXT_PUBLIC_ENABLE_ORBIT', type: 'boolean', default: false, description: 'Orbit League visualizations', public: true, tags: ['orbit'] },
  { key: 'NEXT_PUBLIC_ENABLE_BUNDLES', type: 'boolean', default: false, description: 'Legacy bundles routes', public: true, tags: ['pricing', 'legacy'] },
  { key: 'NEXT_PUBLIC_ENABLE_LEGACY', type: 'boolean', default: false, description: 'Legacy UI switches', public: true, tags: ['legacy'] },
  { key: 'NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS', type: 'boolean', default: false, description: 'Use Stripe Payment Links fallback', public: true, tags: ['payments'] },
  { key: 'NEXT_PUBLIC_SHOW_PERCY_WIDGET', type: 'boolean', default: false, description: 'Show Percy floating widget', public: true, tags: ['percy'] },
  { key: 'NEXT_PUBLIC_USE_OPTIMIZED_PERCY', type: 'boolean', default: false, description: 'Use optimized Percy components', public: true, tags: ['percy'] },
  { key: 'NEXT_PUBLIC_ENABLE_PERCY_ANIMATIONS', type: 'boolean', default: true, description: 'Enable Percy animations', public: true, tags: ['percy'] },
  { key: 'NEXT_PUBLIC_ENABLE_PERCY_AVATAR', type: 'boolean', default: true, description: 'Enable Percy avatar', public: true, tags: ['percy'] },
  { key: 'NEXT_PUBLIC_ENABLE_PERCY_CHAT', type: 'boolean', default: true, description: 'Enable Percy chat', public: true, tags: ['percy'] },
  { key: 'NEXT_PUBLIC_ENABLE_PERCY_SOCIAL_PROOF', type: 'boolean', default: true, description: 'Enable Percy social proof', public: true, tags: ['percy'] },
  { key: 'NEXT_PUBLIC_PERCY_PERFORMANCE_MONITORING', type: 'boolean', default: true, description: 'Enable Percy perf monitoring', public: true, tags: ['percy'] },
  { key: 'NEXT_PUBLIC_PERCY_AUTO_FALLBACK', type: 'boolean', default: true, description: 'Enable Percy auto fallback', public: true, tags: ['percy'] },
  { key: 'NEXT_PUBLIC_PERCY_LOG_SWITCHES', type: 'boolean', default: true, description: 'Log Percy switch decisions', public: true, tags: ['percy'] },
  { key: 'NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE', type: 'boolean', default: true, description: 'AI automation homepage modules', public: true, tags: ['marketing'] },
  { key: 'NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN', type: 'boolean', default: true, description: 'Enhanced business scan flow', public: true, tags: ['marketing'] },
  { key: 'NEXT_PUBLIC_URGENCY_BANNERS', type: 'boolean', default: true, description: 'Urgency/Countdown banners', public: true, tags: ['marketing'] },
  { key: 'NEXT_PUBLIC_LIVE_METRICS', type: 'boolean', default: true, description: 'Live metrics counters', public: true, tags: ['marketing'] },
  { key: 'NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT', type: 'string', default: 'scan-first', description: 'Homepage hero variant (scan-first|split|legacy)', public: true, tags: ['marketing'] },
];

const FLAG_META = new Map<string, FlagDefinition>(FLAG_DEFINITIONS.map((def) => [def.key, def]));

export const FLAG_REGISTRY = FLAG_DEFINITIONS;

export const KNOWN_FLAGS = FLAG_DEFINITIONS.reduce<Record<string, { default: boolean | string; description: string; type: FlagType; public: boolean; tags: string[] }>>((acc, def) => {
  acc[def.key] = {
    default: def.default,
    description: def.description ?? '',
    type: def.type,
    public: Boolean(def.public),
    tags: def.tags ?? [],
  };
  return acc;
}, {});

const envCache = new Map<string, string | undefined>();

const truthyValues = new Set(['1', 'true', 'yes', 'y', 'on', 'enable', 'enabled']);
const falsyValues = new Set(['0', 'false', 'no', 'n', 'off', 'disable', 'disabled']);

function readEnv(key: string): string | undefined {
  if (envCache.has(key)) {
    return envCache.get(key);
  }

  const value = typeof process !== 'undefined' ? process.env?.[key] : undefined;
  envCache.set(key, value);
  return value;
}

function coerceBoolean(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw === null) {
    return fallback;
  }

  const normalized = raw.trim().toLowerCase();
  if (truthyValues.has(normalized)) return true;
  if (falsyValues.has(normalized)) return false;

  return fallback;
}

export function getFlagBool(key: string, fallback = false): boolean {
  const raw = readEnv(key);
  return coerceBoolean(raw, fallback);
}

export function getFlagStr(key: string, fallback = ''): string {
  const raw = readEnv(key);
  return raw !== undefined && raw !== null && raw !== '' ? raw : fallback;
}

export function isBoost(): boolean {
  return getFlagBool('FF_BOOST') || getFlagBool('FF_USE_BOOST_FOR_AUTH');
}

export function isClerk(): boolean {
  if (getFlagBool('FF_CLERK')) return true;
  return getFlagBool('NEXT_PUBLIC_FF_CLERK');
}

export function n8nNoop(): boolean {
  return getFlagBool('FF_N8N_NOOP', true);
}

export function siteVersion(): SiteVersion {
  const raw = getFlagStr('FF_SITE_VERSION', String(FLAG_META.get('FF_SITE_VERSION')?.default ?? 'legacy'));
  const normalized = raw.trim().toLowerCase();

  if (normalized === 'legacy' || normalized === 'new') {
    return normalized;
  }

  if (normalized === '1') return 'new';
  if (normalized === '0') return 'legacy';

  return 'legacy';
}

export function flagsSnapshot(): Record<string, string | boolean> {
  const snapshot: Record<string, string | boolean> = {};

  for (const def of FLAG_DEFINITIONS) {
    if (def.type === 'boolean') {
      snapshot[def.key] = getFlagBool(def.key, def.default as boolean);
    } else {
      if (def.key === 'FF_SITE_VERSION') {
        snapshot[def.key] = siteVersion();
      } else {
        snapshot[def.key] = getFlagStr(def.key, def.default as string);
      }
    }
  }

  return snapshot;
}

type FeatureFlagValues = {
  readonly HP_GUIDE_STAR: boolean;
  readonly HOMEPAGE_HERO_VARIANT: 'scan-first' | 'split' | 'legacy';
  readonly ENABLE_STRIPE: boolean;
  readonly FF_STRIPE_FALLBACK_LINKS: boolean;
  readonly ENABLE_BUNDLES: boolean;
  readonly ENABLE_ORBIT: boolean;
  readonly ENABLE_LEGACY: boolean;
  readonly FF_N8N_NOOP: boolean;
  readonly AI_AUTOMATION_HOMEPAGE: boolean;
  readonly ENHANCED_BUSINESS_SCAN: boolean;
  readonly URGENCY_BANNERS: boolean;
  readonly LIVE_METRICS: boolean;
  readonly USE_OPTIMIZED_PERCY: boolean;
  readonly ENABLE_PERCY_ANIMATIONS: boolean;
  readonly ENABLE_PERCY_AVATAR: boolean;
  readonly ENABLE_PERCY_CHAT: boolean;
  readonly ENABLE_PERCY_SOCIAL_PROOF: boolean;
  readonly PERCY_PERFORMANCE_MONITORING: boolean;
  readonly PERCY_AUTO_FALLBACK: boolean;
  readonly PERCY_LOG_SWITCHES: boolean;
  readonly SHOW_PERCY_WIDGET: boolean;
};

const featureFlagsDefinition = {
  get HP_GUIDE_STAR(): boolean {
    return getFlagBool('NEXT_PUBLIC_HP_GUIDE_STAR', true);
  },
  get HOMEPAGE_HERO_VARIANT(): 'scan-first' | 'split' | 'legacy' {
    const raw = getFlagStr('NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT', 'scan-first').trim().toLowerCase();
    if (raw === 'split' || raw === 'legacy') {
      return raw;
    }
    return 'scan-first';
  },
  get ENABLE_STRIPE(): boolean {
    return getFlagBool('NEXT_PUBLIC_ENABLE_STRIPE', true);
  },
  get FF_STRIPE_FALLBACK_LINKS(): boolean {
    return getFlagBool('NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS', false);
  },
  get ENABLE_BUNDLES(): boolean {
    return getFlagBool('NEXT_PUBLIC_ENABLE_BUNDLES', false);
  },
  get ENABLE_ORBIT(): boolean {
    return getFlagBool('NEXT_PUBLIC_ENABLE_ORBIT', false);
  },
  get ENABLE_LEGACY(): boolean {
    return getFlagBool('NEXT_PUBLIC_ENABLE_LEGACY', false);
  },
  get FF_N8N_NOOP(): boolean {
    return n8nNoop();
  },
  get AI_AUTOMATION_HOMEPAGE(): boolean {
    return getFlagBool('NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE', true);
  },
  get ENHANCED_BUSINESS_SCAN(): boolean {
    return getFlagBool('NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN', true);
  },
  get URGENCY_BANNERS(): boolean {
    return getFlagBool('NEXT_PUBLIC_URGENCY_BANNERS', true);
  },
  get LIVE_METRICS(): boolean {
    return getFlagBool('NEXT_PUBLIC_LIVE_METRICS', true);
  },
  get USE_OPTIMIZED_PERCY(): boolean {
    return getFlagBool('NEXT_PUBLIC_USE_OPTIMIZED_PERCY', false);
  },
  get ENABLE_PERCY_ANIMATIONS(): boolean {
    return getFlagBool('NEXT_PUBLIC_ENABLE_PERCY_ANIMATIONS', true);
  },
  get ENABLE_PERCY_AVATAR(): boolean {
    return getFlagBool('NEXT_PUBLIC_ENABLE_PERCY_AVATAR', true);
  },
  get ENABLE_PERCY_CHAT(): boolean {
    return getFlagBool('NEXT_PUBLIC_ENABLE_PERCY_CHAT', true);
  },
  get ENABLE_PERCY_SOCIAL_PROOF(): boolean {
    return getFlagBool('NEXT_PUBLIC_ENABLE_PERCY_SOCIAL_PROOF', true);
  },
  get PERCY_PERFORMANCE_MONITORING(): boolean {
    return getFlagBool('NEXT_PUBLIC_PERCY_PERFORMANCE_MONITORING', true);
  },
  get PERCY_AUTO_FALLBACK(): boolean {
    return getFlagBool('NEXT_PUBLIC_PERCY_AUTO_FALLBACK', true);
  },
  get PERCY_LOG_SWITCHES(): boolean {
    return getFlagBool('NEXT_PUBLIC_PERCY_LOG_SWITCHES', true);
  },
  get SHOW_PERCY_WIDGET(): boolean {
    return getFlagBool('NEXT_PUBLIC_SHOW_PERCY_WIDGET', false);
  },
} satisfies FeatureFlagValues;

export const FEATURE_FLAGS: FeatureFlagValues = featureFlagsDefinition;

type BooleanFlagKeys = {
  [K in keyof FeatureFlagValues]: FeatureFlagValues[K] extends boolean ? K : never;
}[keyof FeatureFlagValues];

export const isFeatureEnabled = (flag: BooleanFlagKeys): boolean => {
  return Boolean(FEATURE_FLAGS[flag]);
};

export const getFeatureFlag = <K extends keyof FeatureFlagValues>(flag: K, fallback?: FeatureFlagValues[K]): FeatureFlagValues[K] => {
  const value = FEATURE_FLAGS[flag];
  return (value ?? fallback) as FeatureFlagValues[K];
};

export const getPercyConfig = () => {
  return {
    USE_OPTIMIZED_PERCY: FEATURE_FLAGS.USE_OPTIMIZED_PERCY,
    ENABLE_PERCY_AVATAR: FEATURE_FLAGS.ENABLE_PERCY_AVATAR,
    ENABLE_PERCY_CHAT: FEATURE_FLAGS.ENABLE_PERCY_CHAT,
    ENABLE_PERCY_SOCIAL_PROOF: FEATURE_FLAGS.ENABLE_PERCY_SOCIAL_PROOF,
    ENABLE_PERCY_ANIMATIONS: FEATURE_FLAGS.ENABLE_PERCY_ANIMATIONS,
    PERCY_PERFORMANCE_MONITORING: FEATURE_FLAGS.PERCY_PERFORMANCE_MONITORING,
    PERCY_AUTO_FALLBACK: FEATURE_FLAGS.PERCY_AUTO_FALLBACK,
    PERCY_LOG_SWITCHES: FEATURE_FLAGS.PERCY_LOG_SWITCHES,
  };
};

export const logPercySwitch = (component: string, version: 'legacy' | 'optimized') => {
  if (FEATURE_FLAGS.PERCY_LOG_SWITCHES) {
    console.log(`🔄 Percy ${component}: Using ${version} version`);
  }
};

export const showPerformanceWarning = () => {
  if (FEATURE_FLAGS.PERCY_PERFORMANCE_MONITORING) {
    console.warn(`
🔥 PERFORMANCE WARNING: Using Legacy Percy Component
   - 2,827 lines of code with 25+ useState hooks
   - Multiple intervals causing potential CPU overheating
   - Consider enabling optimized version: FEATURE_FLAGS.USE_OPTIMIZED_PERCY = true
   
📍 Configuration: lib/config/featureFlags.ts
    `);
  }
};