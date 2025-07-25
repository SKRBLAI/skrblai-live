import { trackConversion, trackUpgradePrompt } from './userJourney';

// Add to existing analytics system
type EmailEventType = 'upgrade_prompt' | 'agent_launch' | 'workflow_complete' | 'conversion';

export async function triggerEmailFromAnalytics(
  eventType: string,
  userId: string,
  userEmail: string,
  userRole: string,
  eventData: any
) {
  const emailTriggerMap: Record<EmailEventType, { triggerType: string; metadata: any }> = {
    'upgrade_prompt': {
      triggerType: 'upgrade_prompt',
      metadata: {
        agentName: eventData.agentName,
        upgradeTarget: eventData.targetRole,
        feature: eventData.feature
      }
    },
    'agent_launch': {
      triggerType: 'agent_first_use',
      metadata: {
        agentName: eventData.agentName,
        agentId: eventData.agentId
      }
    },
    'workflow_complete': {
      triggerType: 'workflow_complete',
      metadata: {
        workflowName: eventData.workflowName,
        agentName: eventData.agentName,
        resultSummary: eventData.resultSummary
      }
    },
    'conversion': {
      triggerType: 'upgrade_success',
      metadata: {
        fromRole: eventData.fromRole,
        toRole: eventData.toRole,
        revenue: eventData.revenue
      }
    }
  };

  const emailTrigger = emailTriggerMap[eventType as EmailEventType];
  if (!emailTrigger) return;

  // Trigger email automation
  try {
    const response = await fetch('/api/email/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        triggerType: emailTrigger.triggerType,
        userId,
        userEmail,
        userRole,
        metadata: emailTrigger.metadata
      })
    });

    if (!response.ok) {
      console.error('Failed to trigger email automation:', response.status);
    }
  } catch (error) {
    console.error('Email automation trigger error:', error);
  }
}

// Update existing tracking functions to include email triggers
export const trackAgentLaunchWithEmail = async (agentId: string, agentName: string, userId?: string, userEmail?: string, userRole?: string) => {
  // ... existing tracking logic ...
  
  if (userId && userRole && userEmail) {
    await triggerEmailFromAnalytics('agent_launch', userId, userEmail, userRole, {
      agentId,
      agentName
    });
  }
};