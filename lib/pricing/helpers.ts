/**
 * Pricing helpers and utilities
 */

export const getAmount = (amountCents: number): number => {
  return Math.floor(amountCents / 100);
};

export const formatPrice = (amount: number): string => {
  return `$${amount}`;
};

export const formatCents = (amountCents: number): string => {
  return `$${(amountCents / 100).toFixed(2)}`;
};
