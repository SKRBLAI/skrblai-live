export function getPriceId(key: string): string | undefined {
  const raw = process.env.NEXT_PUBLIC_PRICE_MAP_JSON;
  const isProd = process.env.NODE_ENV === 'production';

  if (!raw) {
    if (!isProd) throw new Error('NEXT_PUBLIC_PRICE_MAP_JSON is missing. Expected a JSON object of price IDs.');
    return undefined;
    
  }
  let map: any;
  try {
    map = JSON.parse(raw);
  } catch (e) {
    if (!isProd) throw new Error('Invalid NEXT_PUBLIC_PRICE_MAP_JSON. Must be valid JSON.');
    return undefined;
  }

  const val = map?.[key];
  if (!val) {
    if (!isProd) {
      const keys = Object.keys(map || {});
      throw new Error(`Price key not found: ${key}. Available keys: ${keys.join(', ')}`);
    }
    return undefined;
  }

  if (typeof val === 'string') return val;
  if (typeof val === 'object' && typeof val.price_id === 'string') return val.price_id;

  if (!isProd) throw new Error(`Unsupported price map value for key '${key}'. Expected string or { price_id }.`);
  return undefined;
}
