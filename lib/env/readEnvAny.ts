/**
 * Reads the first non-empty environment variable from a list of keys.
 * Useful for handling multiple environment variable names (e.g., canonical and _M variants).
 * 
 * @param keys - Array of environment variable keys to check
 * @returns The first non-empty value found, or undefined if none are set
 * 
 * @example
 * // Check both canonical and _M variant
 * const priceId = readEnvAny('NEXT_PUBLIC_STRIPE_PRICE_PRO', 'NEXT_PUBLIC_STRIPE_PRICE_PRO_M');
 */
export function readEnvAny(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}