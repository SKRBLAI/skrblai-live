export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  requiredRole: 'reserve' | 'starter' | 'star' | 'all_star';
  category: 'automation' | 'agents' | 'usage' | 'integrations';
}

export const PREMIUM_FEATURES: Record<string, PremiumFeature> = {
  // Agent Automation Features
  'basic-automation': {
    id: 'basic-automation',
    name: 'Basic Automation',
    description: 'Simple single-step workflows',
    requiredRole: 'reserve',
    category: 'automation'
  },
  'advanced-automation': {
    id: 'advanced-automation',
    name: 'Advanced Automation',
    description: 'Complex multi-step workflows and integrations',
    requiredRole: 'starter',
    category: 'automation'
  },
  'bulk-automation': {
    id: 'bulk-automation', 
    name: 'Bulk Processing',
    description: 'Process multiple items simultaneously',
    requiredRole: 'star',
    category: 'automation'
  },
  'custom-webhooks': {
    id: 'custom-webhooks',
    name: 'Custom Webhooks',
    description: 'Connect to external services via webhooks',
    requiredRole: 'all_star',
    category: 'integrations'
  },
  
  // Agent Access Features
  'basic-agents': {
    id: 'basic-agents',
    name: 'Basic Agents',
    description: 'Access to 3 core agents',
    requiredRole: 'reserve',
    category: 'agents'
  },
  'starter-agents': {
    id: 'starter-agents',
    name: 'Starter Agents',
    description: 'Access to 5 specialized agents',
    requiredRole: 'starter',
    category: 'agents'
  },
  'premium-agents': {
    id: 'premium-agents',
    name: 'Premium Agents',
    description: 'Access to 10+ high-value agents',
    requiredRole: 'star',
    category: 'agents'
  },
  'custom-agents': {
    id: 'custom-agents',
    name: 'Custom Agent Creation',
    description: 'Build and deploy your own AI agents',
    requiredRole: 'all_star',
    category: 'agents'
  },
  
  // Usage Limits
  'enhanced-usage': {
    id: 'enhanced-usage',
    name: 'Enhanced Usage',
    description: 'Higher limits on agent interactions',
    requiredRole: 'starter',
    category: 'usage'
  },
  'unlimited-usage': {
    id: 'unlimited-usage',
    name: 'Unlimited Usage',
    description: 'No limits on agent interactions or workflows',
    requiredRole: 'star',
    category: 'usage'
  },
  'priority-processing': {
    id: 'priority-processing',
    name: 'Priority Processing',
    description: 'Your requests are processed first',
    requiredRole: 'all_star',
    category: 'usage'
  }
};

export interface UserRole {
  role: 'client' | 'reserve' | 'starter' | 'star' | 'all_star' | 'admin';
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
      dailyAutomations: 3,
      monthlyAgentCalls: 50,
      customAgents: 0
    }
  },
  'reserve': {
    role: 'reserve',
    features: ['basic-automation', 'basic-agents'],
    limits: {
      dailyAutomations: 10,
      monthlyAgentCalls: 200,
      customAgents: 0
    }
  },
  'starter': {
    role: 'starter', 
    features: ['basic-automation', 'advanced-automation', 'basic-agents', 'starter-agents', 'enhanced-usage'],
    limits: {
      dailyAutomations: 25,
      monthlyAgentCalls: 500,
      customAgents: 1
    }
  },
  'star': {
    role: 'star',
    features: ['basic-automation', 'advanced-automation', 'bulk-automation', 'basic-agents', 'starter-agents', 'premium-agents', 'enhanced-usage', 'unlimited-usage'],
    limits: {
      dailyAutomations: 100,
      monthlyAgentCalls: 2000,
      customAgents: 5
    }
  },
  'all_star': {
    role: 'all_star',
    features: ['basic-automation', 'advanced-automation', 'bulk-automation', 'custom-webhooks', 'basic-agents', 'starter-agents', 'premium-agents', 'custom-agents', 'enhanced-usage', 'unlimited-usage', 'priority-processing'],
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
  upgradeRequired?: string;
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