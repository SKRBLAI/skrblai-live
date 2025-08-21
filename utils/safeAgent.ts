import type { Agent } from '@/types/agent';

export interface SafeAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  agentCategory?: string[];
  emoji?: string;
  usageCount?: number;
  lastRun?: string;
  performanceScore?: number;
  config?: {
    name?: string;
    description?: string;
    capabilities: string[];
    workflows?: string[];
  };
  capabilities: string[];
  route?: string | null;
  intent?: string | null;
  visible: boolean;
  premium?: boolean;
  icon?: string;
  unlocked?: boolean;
  imageSlug?: string;
  hasImage?: boolean;
  displayInOrbit?: boolean;
  orbit?: {
    radius?: number;
    speed?: number;
    angle?: number;
  };
  hoverSummary?: string;
  gender?: 'male' | 'female' | 'neutral';
  superheroName?: string;
  origin?: string;
  powers?: string[];
  weakness?: string;
  catchphrase?: string;
  nemesis?: string;
  backstory?: string;
  canConverse: boolean;
  recommendedHelpers: string[];
  handoffTriggers: string[];
  roleRequired?: string;
  premiumFeature?: string;
  upgradeRequired?: string | null;
  isLocked?: boolean;
}

export function toSafeAgent(agent: Agent): SafeAgent {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    category: agent.category,
    agentCategory: agent.agentCategory,
    emoji: agent.emoji,
    usageCount: agent.usageCount,
    lastRun: agent.lastRun,
    performanceScore: agent.performanceScore,
    config: agent.config ? {
      name: agent.config.name,
      description: agent.config.description,
      capabilities: agent.config.capabilities,
      workflows: agent.config.workflows
    } : undefined,
    capabilities: agent.capabilities,
    route: agent.route,
    intent: agent.intent,
    visible: agent.visible,
    premium: agent.premium,
    icon: agent.icon,
    unlocked: agent.unlocked,
    imageSlug: agent.imageSlug,
    hasImage: agent.hasImage,
    displayInOrbit: agent.displayInOrbit,
    orbit: agent.orbit,
    hoverSummary: agent.hoverSummary,
    gender: agent.gender,
    superheroName: agent.superheroName,
    origin: agent.origin,
    powers: agent.powers,
    weakness: agent.weakness,
    catchphrase: agent.catchphrase,
    nemesis: agent.nemesis,
    backstory: agent.backstory,
    canConverse: agent.canConverse,
    recommendedHelpers: agent.recommendedHelpers,
    handoffTriggers: agent.handoffTriggers,
    roleRequired: agent.roleRequired,
    premiumFeature: agent.premiumFeature,
    upgradeRequired: agent.upgradeRequired
  };
}
