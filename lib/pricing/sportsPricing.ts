/**
 * Sports pricing configuration
 */


import { getDisplayPlan, formatMoney } from './catalog';
import { ProductKey, BillingPeriod } from './types';

export function getAmount(key: ProductKey, period: BillingPeriod) {
  return getDisplayPlan(key, period).amountCents;
}

export { getDisplayPlan, formatMoney };
