/**
 * Node script to verify presence of required env vars for local dev.
 * Prints a table of present/missing. Does NOT print values.
 * Usage: `node -r ts-node/register scripts/verifyEnv.ts`
 */
import fs from 'fs';
import path from 'path';

// Categories and keys (Boost-first priority)
const ENV_CATEGORIES: Record<string, string[]> = {
  FEATURE_FLAGS: ["NEXT_PUBLIC_HP_GUIDE_STAR", "NEXT_PUBLIC_FF_USE_BOOST"],
  SUPABASE_BOOST: ["NEXT_PUBLIC_SUPABASE_URL_BOOST", "NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST", "SUPABASE_SERVICE_ROLE_KEY_BOOST"],
  SUPABASE_LEGACY: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  SUPABASE_SERVER: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
  AUTH: [], // Removed deprecated NextAuth variables
  STRIPE: ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  OPENAI: ["OPENAI_API_KEY"],
  N8N: ["N8N_BUSINESS_ONBOARDING_URL"],
  ANALYTICS: ["NEXT_PUBLIC_GOOGLE_ANALYTICS_ID"],
  OPTIONAL: ["NEXT_PUBLIC_SITE_URL", "IRA_ALLOWED_EMAILS"],
};

// Load .env.local or .env for dev
function loadEnvFile() {
  const envPaths = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach(line => {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2];
        }
      });
    }
  }
}

loadEnvFile();

// Scan for PRICE_* keys if referenced in codebase
function scanPriceKeys(): string[] {
  const pricesFile = path.resolve(process.cwd(), "lib/pricing/prices.ts");
  if (!fs.existsSync(pricesFile)) return [];
  const content = fs.readFileSync(pricesFile, "utf-8");
  const matches = Array.from(content.matchAll(/process\.env\.([A-Z0-9_]+)/g));
  const priceKeys = matches
    .map(m => m[1])
    .filter(k => k.startsWith("PRICE_"));
  return Array.from(new Set(priceKeys));
}

const priceKeys = scanPriceKeys();
if (priceKeys.length) {
  ENV_CATEGORIES["PRICING"] = priceKeys;
}

// Helper to check if either legacy or Boost key is present
function checkEnvPresence(key: string): boolean {
  if (process.env[key]) return true;
  
  // Boost-first mapping for automatic fallback detection
  const boostMap: Record<string, string> = {
    'NEXT_PUBLIC_SUPABASE_URL': 'NEXT_PUBLIC_SUPABASE_URL_BOOST',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST',
    'SUPABASE_SERVICE_ROLE_KEY': 'SUPABASE_SERVICE_ROLE_KEY_BOOST',
  };
  
  const boostKey = boostMap[key];
  if (boostKey && process.env[boostKey]) return true;
  
  return false;
}

const results: Record<string, Record<string, boolean>> = {};
let missingCount = 0;
let presentCount = 0;

for (const [group, keys] of Object.entries(ENV_CATEGORIES)) {
  results[group] = {};
  for (const key of keys) {
    const present = checkEnvPresence(key);
    results[group][key] = present;
    if (present) presentCount++;
    else missingCount++;
  }
}

// Print output
console.log("\nENVIRONMENT VARIABLE PRESENCE CHECK\n");
for (const [group, keys] of Object.entries(results)) {
  console.log(`== ${group} ==`);
  for (const [key, present] of Object.entries(keys)) {
    console.log(`  ${key.padEnd(36)} ${present ? "PRESENT" : "MISSING"}`);
  }
}
console.log("\nSummary:");
console.log(`  PRESENT: ${presentCount}`);
console.log(`  MISSING: ${missingCount}`);
console.log("\n(Exit code always 0. MISSING > 0 means required envs are missing!)\n");

process.exit(0);
