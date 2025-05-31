interface N8nWorkflow {
  id: string;
  name: string;
  webhookUrl: string;
  active: boolean;
}

interface EmailTriggerPayload {
  userId: string;
  userEmail: string;
  userRole: string;
  triggerType: string;
  sequenceId: string;
  templateData: Record<string, any>;
  metadata: {
    agentId?: string;
    workflowId?: string;
    upgradeTarget?: string;
    analyticsSource: string;
  };
}

export class N8nEmailAutomation {
  private workflows: N8nWorkflow[] = [
    {
      id: 'welcome-sequence',
      name: 'Welcome Email Sequence',
      webhookUrl: `${process.env.N8N_BASE_URL}/webhook/welcome-sequence`,
      active: true
    },
    {
      id: 'upgrade-nurture',
      name: 'Upgrade Nurture Campaign',
      webhookUrl: `${process.env.N8N_BASE_URL}/webhook/upgrade-nurture`,
      active: true
    }
  ];

  async triggerEmailSequence(sequenceId: string, payload: EmailTriggerPayload) {
    try {
      const workflow = this.workflows.find(w => w.id === sequenceId);
      if (!workflow || !workflow.active) {
        return { success: false, error: 'Workflow not found or inactive' };
      }

      const response = await fetch(workflow.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.N8N_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`N8n webhook failed: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, workflowId: result.workflowId || workflow.id };

    } catch (error) {
      console.error('N8n email automation failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private getEmailSubject(template: string): string {
    const subjects = {
      'payment-success': '🎉 Welcome to SKRBL AI Pro!',
      'workflow-complete': '✅ Your Automation is Complete!',
      'trial-ending': '⏰ Your SKRBL AI Trial Ends Soon',
      'password-reset': '🔐 Password Reset Request',
      'security-alert': '🛡️ Security Alert for Your Account'
    } as const;

    return (subjects as any)[template] || 'Update from SKRBL AI';
  }

  private async renderTemplate(template: string, data: Record<string, any>): Promise<string> {
    const templates: Record<string, string> = {
      'payment-success': `
        <h2>🎉 Welcome to SKRBL AI Pro!</h2>
        <p>Your payment has been processed successfully. You now have access to all premium features!</p>
        <a href="https://skrblai.io/dashboard" style="background: #1E90FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Access Your Dashboard</a>
      `,
      'workflow-complete': `
        <h2>🎯 Your ${data.agentName} workflow is complete!</h2>
        <p>Great news! Your automation has finished processing. Here are your results:</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <strong>Workflow:</strong> ${data.workflowName}<br>
          <strong>Status:</strong> ✅ Completed<br>
          <strong>Results:</strong> ${data.resultSummary}
        </div>
        <a href="${data.resultsUrl}" style="background: #30D5C8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Full Results</a>
      `
    };

    return templates[template] || '<p>Update from SKRBL AI</p>';
  }
}

export const emailAutomation = new N8nEmailAutomation(); 