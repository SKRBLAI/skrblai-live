// lib/entitlements.ts
// Entitlements mapping for unified pricing plans

import { ProductKey } from './pricing/types';

export interface PlanEntitlements {
  scans: number;           // Monthly scan limit (-1 = unlimited)
  seats: number;           // Team member limit (-1 = unlimited)
  projects: number;        // Project workspace limit (-1 = unlimited)
  unlockedAgents: string[]; // Agent IDs that are unlocked
  features: string[];      // Feature flags/capabilities
  support: 'community' | 'priority' | 'dedicated';
}

// Entitlements for unified 4-tier plans
export const PLAN_ENTITLEMENTS: Record<ProductKey, PlanEntitlements> = {
  // === UNIFIED 4-TIER PLANS ===
  ROOKIE: {
    scans: 5,
    seats: 1,
    projects: 1,
    unlockedAgents: ['percy', 'contentCreator', 'bizAgent'],
    features: ['basic_analytics', 'community_access'],
    support: 'community',
  },
  
  PRO: {
    scans: 25,
    seats: 3,
    projects: 5,
    unlockedAgents: [
      'percy', 'contentCreator', 'bizAgent', 'brandingAgent', 
      'analyticsAgent', 'socialBotAgent'
    ],
    features: ['advanced_analytics', 'priority_support', 'automation_basic'],
    support: 'priority',
  },
  
  ALL_STAR: {
    scans: 100,
    seats: 10,
    projects: -1, // unlimited
    unlockedAgents: [
      'percy', 'contentCreator', 'bizAgent', 'brandingAgent', 
      'analyticsAgent', 'socialBotAgent', 'videoContentAgent',
      'publishingAgent', 'proposalGeneratorAgent', 'skillSmithAgent',
      'adCreativeAgent', 'sitegenAgent', 'iraAgent'
    ],
    features: [
      'advanced_analytics', 'automation_advanced', 'custom_workflows',
      'api_access', 'white_label_basic'
    ],
    support: 'dedicated',
  },
  
  FRANCHISE: {
    scans: -1, // unlimited
    seats: -1, // unlimited
    projects: -1, // unlimited
    unlockedAgents: ['*'], // all agents
    features: [
      'advanced_analytics', 'automation_advanced', 'custom_workflows',
      'api_access', 'white_label_full', 'custom_integrations',
      'dedicated_success_manager'
    ],
    support: 'dedicated',
  },

  // === ADD-ONS (these modify base plan entitlements) ===
  ADDON_SCANS_10: {
    scans: 10, // adds to base plan
    seats: 0,
    projects: 0,
    unlockedAgents: [],
    features: [],
    support: 'community',
  },
  
  ADDON_MOE: {
    scans: 0,
    seats: 0,
    projects: 0,
    unlockedAgents: ['moeAgent'], // hypothetical MOE agent
    features: ['mental_performance', 'emotion_tracking'],
    support: 'community',
  },
  
  ADDON_NUTRITION: {
    scans: 0,
    seats: 0,
    projects: 0,
    unlockedAgents: ['nutritionAgent'],
    features: ['meal_planning', 'nutrition_tracking'],
    support: 'community',
  },
  
  ADDON_ADV_ANALYTICS: {
    scans: 0,
    seats: 0,
    projects: 0,
    unlockedAgents: [],
    features: ['advanced_reporting', 'performance_trends', 'custom_dashboards'],
    support: 'community',
  },
  
  ADDON_AUTOMATION: {
    scans: 0,
    seats: 0,
    projects: 0,
    unlockedAgents: [],
    features: ['workflow_builder', 'api_integrations', 'webhooks'],
    support: 'community',
  },
  
  ADDON_SEAT: {
    scans: 0,
    seats: 1, // adds one seat
    projects: 0,
    unlockedAgents: [],
    features: [],
    support: 'community',
  },

  // === LEGACY COMPATIBILITY ===
  BUS_STARTER: {
    scans: 10,
    seats: 2,
    projects: 3,
    unlockedAgents: ['percy', 'contentCreator', 'bizAgent'],
    features: ['basic_analytics'],
    support: 'community',
  },
  
  BUS_PRO: {
    scans: 50,
    seats: 5,
    projects: 10,
    unlockedAgents: [
      'percy', 'contentCreator', 'bizAgent', 'brandingAgent', 
      'analyticsAgent', 'socialBotAgent'
    ],
    features: ['advanced_analytics', 'automation_basic'],
    support: 'priority',
  },
  
  BUS_ELITE: {
    scans: 200,
    seats: 20,
    projects: -1,
    unlockedAgents: ['*'],
    features: ['advanced_analytics', 'automation_advanced', 'api_access'],
    support: 'dedicated',
  },
  
  SPORTS_STARTER: {
    scans: 5,
    seats: 1,
    projects: 1,
    unlockedAgents: ['percy', 'skillSmithAgent'],
    features: ['sports_analysis_basic'],
    support: 'community',
  },
  
  SPORTS_PRO: {
    scans: 15,
    seats: 1,
    projects: 3,
    unlockedAgents: ['percy', 'skillSmithAgent'],
    features: ['sports_analysis_basic', 'mental_health_basic'],
    support: 'priority',
  },
  
  SPORTS_ELITE: {
    scans: 50,
    seats: 3,
    projects: 10,
    unlockedAgents: ['percy', 'skillSmithAgent'],
    features: ['sports_analysis_advanced', 'mental_health_advanced', 'custom_plans'],
    support: 'dedicated',
  },
  
  BUNDLE_ALL_ACCESS: {
    scans: -1,
    seats: 5,
    projects: -1,
    unlockedAgents: ['*'],
    features: ['*'],
    support: 'dedicated',
  },
  
  SPORTS_VIDEO_PACK: {
    scans: 10,
    seats: 1,
    projects: 1,
    unlockedAgents: ['skillSmithAgent'],
    features: ['video_analysis'],
    support: 'community',
  },
  
  SPORTS_PLAYBOOK_PACK: {
    scans: 15,
    seats: 1,
    projects: 3,
    unlockedAgents: ['skillSmithAgent'],
    features: ['playbook_analysis', 'strategy_planning'],
    support: 'community',
  },
  
  starter: {
    scans: 5,
    seats: 1,
    projects: 1,
    unlockedAgents: ['percy'],
    features: ['basic_features'],
    support: 'community',
  },
  
  star: {
    scans: 25,
    seats: 3,
    projects: 5,
    unlockedAgents: ['percy', 'contentCreator', 'bizAgent'],
    features: ['advanced_features'],
    support: 'priority',
  },
  
  crusher: {
    scans: 100,
    seats: 10,
    projects: 20,
    unlockedAgents: ['*'],
    features: ['premium_features'],
    support: 'dedicated',
  },
};

// Helper function to get entitlements for a plan
export function getPlanEntitlements(planKey: ProductKey): PlanEntitlements | null {
  return PLAN_ENTITLEMENTS[planKey] || null;
}

// Helper function to combine base plan with add-ons
export function calculateTotalEntitlements(
  basePlan: ProductKey, 
  addons: ProductKey[] = []
): PlanEntitlements | null {
  const base = getPlanEntitlements(basePlan);
  if (!base) return null;

  // Start with base plan entitlements
  const total: PlanEntitlements = {
    ...base,
    unlockedAgents: [...base.unlockedAgents],
    features: [...base.features],
  };

  // Add entitlements from add-ons
  for (const addon of addons) {
    const addonEntitlements = getPlanEntitlements(addon);
    if (!addonEntitlements) continue;

    // Add scans (if not unlimited)
    if (total.scans !== -1 && addonEntitlements.scans > 0) {
      total.scans += addonEntitlements.scans;
    }

    // Add seats (if not unlimited)
    if (total.seats !== -1 && addonEntitlements.seats > 0) {
      total.seats += addonEntitlements.seats;
    }

    // Merge agents and features
    total.unlockedAgents.push(...addonEntitlements.unlockedAgents);
    total.features.push(...addonEntitlements.features);
  }

  // Deduplicate arrays
  total.unlockedAgents = [...new Set(total.unlockedAgents)];
  total.features = [...new Set(total.features)];

  return total;
}