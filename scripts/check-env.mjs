const required = [
  'NEXT_PUBLIC_FF_USE_BOOST',
  'NEXT_PUBLIC_SUPABASE_URL_BOOST',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST',
  'SUPABASE_SERVICE_ROLE_KEY_BOOST',
  'NEXT_PUBLIC_PRICE_MAP_JSON',
];

const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing env vars:', missing.join(', '));
  process.exit(1);
}
console.log('✅ Env looks good for Boost.');
