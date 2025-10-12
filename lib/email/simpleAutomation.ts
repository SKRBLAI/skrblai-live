import { getErrorMessage } from '../../utils/errorHandling';
import { EMAIL_SEQUENCES } from './sequences';

// REMOVED: Client-side should not have Supabase client at all
// This file should only be used server-side

// Much simpler approach - no direct Supabase client needed!
export class SimpleEmailAutomation {
  
  // Send immediate emails via API routes only
  async sendWelcomeEmail(userEmail: string, userName: string) {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'welcome',
          to: userEmail,
          templateData: { userName }
        })
      });
      
      const result = await response.json();
      return { success: result.success, messageId: result.messageId };
    } catch (error) {
      console.error('Welcome email failed:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Send immediate upgrade prompt email
  async sendUpgradePromptEmail(userEmail: string, userName: string, agentName: string, targetRole: string) {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'upgrade-prompt',
          to: userEmail,
          templateData: { userName, agentName, targetRole }
        })
      });
      
      const result = await response.json();
      return { success: result.success, messageId: result.messageId };
    } catch (error) {
      console.error('Upgrade email failed:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Queue delayed follow-up emails
  async scheduleAgentFollowUpEmail(userId: string, userEmail: string, agentName: string, delayHours: number = 6) {
    try {
      const response = await fetch('/api/email/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          userEmail,
          agentName,
          delayHours,
          type: 'agent-follow-up'
        })
      });

      const result = await response.json();
      return { success: result.success };
    } catch (error) {
      console.error('Failed to schedule follow-up email:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Queue delayed upgrade nurture sequence
  async scheduleUpgradeNurture(userId: string, userEmail: string, userName: string, agentName: string) {
    try {
      const response = await fetch('/api/email/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          userEmail,
          userName,
          agentName,
          type: 'upgrade-nurture'
        })
      });

      const result = await response.json();
      return { success: result.success, scheduled: result.scheduled };
    } catch (error) {
      console.error('Failed to schedule nurture sequence:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Add this method to the SimpleEmailAutomation class
  async triggerEmailSequence(sequenceId: string, payload: any) {
    try {
      const response = await fetch('/api/email/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sequenceId,
          ...payload
        })
      });

      const result = await response.json();
      return { success: result.success, workflowId: result.workflowId };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  }
}

export const emailAutomation = new SimpleEmailAutomation(); 