export interface EmailSequence {
  id: string;
  name: string;
  trigger: 'signup' | 'trial_start' | 'upgrade_prompt' | 'agent_first_use' | 'workflow_complete';
  userRole: 'client' | 'pro' | 'enterprise' | 'all';
  emails: EmailStep[];
  active: boolean;
}

export interface EmailStep {
  id: string;
  delayHours: number;
  template: string;
  subject: string;
  conditions?: {
    hasUsedAgent?: string;
    completedWorkflows?: number;
    lastActiveHours?: number;
  };
  abTest?: {
    variants: string[];
    splitRatio: number;
  };
}

export const EMAIL_SEQUENCES: EmailSequence[] = [
  {
    id: 'welcome-sequence',
    name: 'Welcome & Onboarding',
    trigger: 'signup',
    userRole: 'all',
    active: true,
    emails: [
      {
        id: 'welcome-1',
        delayHours: 0,
        template: 'welcome-immediate',
        subject: '🎉 Welcome to the League of Digital Superheroes!'
      },
      {
        id: 'welcome-2', 
        delayHours: 24,
        template: 'onboarding-day-1',
        subject: '⚡ Meet Percy: Your AI Concierge is Ready to Help',
        conditions: { hasUsedAgent: undefined } // Only if they haven't used an agent yet
      },
      {
        id: 'welcome-3',
        delayHours: 72,
        template: 'feature-discovery',
        subject: '🚀 Unlock Your Creative Superpowers with SKRBL AI'
      }
    ]
  },
  {
    id: 'upgrade-nurture',
    name: 'Premium Upgrade Nurture',
    trigger: 'upgrade_prompt',
    userRole: 'client',
    active: true,
    emails: [
      {
        id: 'upgrade-1',
        delayHours: 1,
        template: 'upgrade-benefits',
        subject: '💎 Unlock Premium Features - Limited Time Offer',
        abTest: {
          variants: ['urgent-tone', 'benefit-focused'],
          splitRatio: 0.5
        }
      },
      {
        id: 'upgrade-2',
        delayHours: 48,
        template: 'success-stories',
        subject: '🌟 See How Pro Users 10x Their Productivity'
      },
      {
        id: 'upgrade-3',
        delayHours: 168, // 1 week
        template: 'final-upgrade-push',
        subject: '⏰ Don\'t Miss Out: Your Premium Access Awaits'
      }
    ]
  },
  {
    id: 'agent-discovery',
    name: 'Agent Discovery & Usage',
    trigger: 'agent_first_use',
    userRole: 'all',
    active: true,
    emails: [
      {
        id: 'agent-follow-up',
        delayHours: 6,
        template: 'agent-next-steps',
        subject: '🎯 Great job! Here\'s what to do next with {AGENT_NAME}'
      },
      {
        id: 'related-agents',
        delayHours: 48,
        template: 'discover-more-agents',
        subject: '🔥 Discover More Agents That Work Perfectly with {AGENT_NAME}'
      }
    ]
  }
]; 