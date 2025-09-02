// lib/pricing/types.ts

export type BillingPeriod = 'monthly' | 'annual' | 'one_time';

export type ProductKey =
  // Unified 4-tier plans (shared by Business + Sports)
  | 'ROOKIE' | 'PRO' | 'ALL_STAR' | 'FRANCHISE'
  // Add-ons (recurring)
  | 'ADDON_SCANS_10' | 'ADDON_MOE' | 'ADDON_NUTRITION' 
  | 'ADDON_ADV_ANALYTICS' | 'ADDON_AUTOMATION' | 'ADDON_SEAT'
  // Legacy keys (for backward compatibility)
  | 'BUS_STARTER' | 'BUS_PRO' | 'BUS_ELITE'
  | 'SPORTS_STARTER' | 'SPORTS_PRO' | 'SPORTS_ELITE'
  | 'BUNDLE_ALL_ACCESS'
  | 'SPORTS_VIDEO_PACK' | 'SPORTS_PLAYBOOK_PACK'
  | 'starter' | 'star' | 'crusher';
