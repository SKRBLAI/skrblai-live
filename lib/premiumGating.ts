export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  requiredRole: 'pro' | 'enterprise';
  category: 'automation' | 'agents' | 'usage' | 'integrations';
}

export const PREMIUM_FEATURES: Record<string, PremiumFeature> = {
  // Agent Automation Features
  'advanced-automation': {
    id: 'advanced-automation',
    name: 'Advanced Automation',
    description: 'Complex multi-step workflows and integrations',
    requiredRole: 'pro',
    category: 'automation'
  },
  'bulk-automation': {
    id: 'bulk-automation', 
    name: 'Bulk Processing',
    description: 'Process multiple items simultaneously',
    requiredRole: 'pro',
    category: 'automation'
  },
  'custom-webhooks': {
    id: 'custom-webhooks',
    name: 'Custom Webhooks',
    description: 'Connect to external services via webhooks',
    requiredRole: 'enterprise',
    category: 'integrations'
  },
  
  // Agent Access Features
  'premium-agents': {
    id: 'premium-agents',
    name: 'Premium Agents',
    description: 'Access to specialized high-value agents',
    requiredRole: 'pro',
    category: 'agents'
  },
  'custom-agents': {
    id: 'custom-agents',
    name: 'Custom Agent Creation',
    description: 'Build and deploy your own AI agents',
    requiredRole: 'enterprise',
    category: 'agents'
  },
  
  // Usage Limits
  'unlimited-usage': {
    id: 'unlimited-usage',
    name: 'Unlimited Usage',
    description: 'No limits on agent interactions or workflows',
    requiredRole: 'pro',
    category: 'usage'
  },
  'priority-processing': {
    id: 'priority-processing',
    name: 'Priority Processing',
    description: 'Your requests are processed first',
    requiredRole: 'enterprise',
    category: 'usage'
  }
};

export interface UserRole {
  role: 'client' | 'pro' | 'enterprise' | 'admin';
  features: string[];
  limits: {
    dailyAutomations: number;
    monthlyAgentCalls: number;
    customAgents: number;
  };
}

export const ROLE_PERMISSIONS: Record<string, UserRole> = {
  'client': {
    role: 'client',
    features: [],
    limits: {
      dailyAutomations: 5,
      monthlyAgentCalls: 100,
      customAgents: 0
    }
  },
  'pro': {
    role: 'pro', 
    features: ['advanced-automation', 'bulk-automation', 'premium-agents', 'unlimited-usage'],
    limits: {
      dailyAutomations: 50,
      monthlyAgentCalls: 1000,
      customAgents: 3
    }
  },
  'enterprise': {
    role: 'enterprise',
    features: ['advanced-automation', 'bulk-automation', 'premium-agents', 'unlimited-usage', 'custom-webhooks', 'custom-agents', 'priority-processing'],
    limits: {
      dailyAutomations: -1, // unlimited
      monthlyAgentCalls: -1, // unlimited  
      customAgents: -1 // unlimited
    }
  },
  'admin': {
    role: 'admin',
    features: Object.keys(PREMIUM_FEATURES),
    limits: {
      dailyAutomations: -1,
      monthlyAgentCalls: -1,
      customAgents: -1
    }
  }
};

export function checkPremiumAccess(userRole: string, featureId: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;
  
  return rolePermissions.features.includes(featureId);
}

export function getUserLimits(userRole: string): UserRole['limits'] {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions?.limits || ROLE_PERMISSIONS['client'].limits;
}

export function getAvailableFeatures(userRole: string): PremiumFeature[] {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return [];
  
  return rolePermissions.features.map(featureId => PREMIUM_FEATURES[featureId]).filter(Boolean);
}

export function getUpgradeRequiredFeatures(userRole: string): PremiumFeature[] {
  const allFeatures = Object.values(PREMIUM_FEATURES);
  const userFeatures = getAvailableFeatures(userRole);
  const userFeatureIds = new Set(userFeatures.map(f => f.id));
  
  return allFeatures.filter(feature => !userFeatureIds.has(feature.id));
}

export interface PremiumGatingResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: 'pro' | 'enterprise';
  feature?: PremiumFeature;
}

export function checkFeatureAccess(userRole: string, featureId: string): PremiumGatingResult {
  const feature = PREMIUM_FEATURES[featureId];
  if (!feature) {
    return { allowed: true }; // Feature doesn't exist in premium system
  }
  
  const hasAccess = checkPremiumAccess(userRole, featureId);
  if (hasAccess) {
    return { allowed: true, feature };
  }
  
  return {
    allowed: false,
    reason: `Access denied: ${feature.name} requires ${feature.requiredRole} subscription`,
    upgradeRequired: feature.requiredRole,
    feature
  };
} 