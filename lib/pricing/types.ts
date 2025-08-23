// lib/pricing/types.ts

export type BillingPeriod = 'monthly' | 'annual' | 'one_time';

export type ProductKey =
  | 'BUS_STARTER' | 'BUS_PRO' | 'BUS_ELITE'
  | 'SPORTS_STARTER' | 'SPORTS_PRO' | 'SPORTS_ELITE'
  | 'BUNDLE_ALL_ACCESS'
  | 'SPORTS_VIDEO_PACK' | 'SPORTS_PLAYBOOK_PACK'
  | 'starter' | 'star' | 'crusher';
