/**
 * Sports pricing configuration
 */


import { getDisplayPlan, getDisplayPlanOrNull, formatMoney } from './catalog';
import { ProductKey, BillingPeriod } from './types';

export function getAmount(key: ProductKey, period: BillingPeriod) {
  return getDisplayPlan(key, period).amountCents;
}

<<<<<<< Current (Your changes)
export { getDisplayPlan, formatMoney };
=======
export function getAmountOrNull(key: string, period: string): number | null {
  const plan = getDisplayPlanOrNull(key, period);
  return plan ? plan.amountCents : null;
}

export { getDisplayPlan, getDisplayPlanOrNull, formatMoney };
>>>>>>> Incoming (Background Agent changes)
