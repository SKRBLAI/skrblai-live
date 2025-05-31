import { createClient } from '@supabase/supabase-js';
import { getErrorMessage } from '@/utils/errorHandling';
import { EMAIL_SEQUENCES } from '@/lib/email/sequences';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Much simpler approach - no n8n needed!
export class SimpleEmailAutomation {
  
  // Send immediate emails directly via Resend
  async sendWelcomeEmail(userEmail: string, userName: string) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Percy <percy@skrblai.io>',
          to: userEmail,
          subject: '🎉 Welcome to the League of Digital Superheroes!',
          html: this.getWelcomeTemplate(userName)
        })
      });
      
      const result = await response.json();
      
      // Log the email
      await this.logEmail(userEmail, 'welcome-immediate', 'sent', result.id);
      
      return { success: true, messageId: result.id };
    } catch (error) {
      console.error('Welcome email failed:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Send immediate upgrade prompt email
  async sendUpgradePromptEmail(userEmail: string, userName: string, agentName: string, targetRole: string) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Percy <percy@skrblai.io>',
          to: userEmail,
          subject: `💎 Unlock ${agentName} Premium Features - Special Offer!`,
          html: this.getUpgradeTemplate(userName, agentName, targetRole)
        })
      });
      
      const result = await response.json();
      await this.logEmail(userEmail, 'upgrade-prompt', 'sent', result.id);
      
      return { success: true, messageId: result.id };
    } catch (error) {
      console.error('Upgrade email failed:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Queue delayed follow-up emails
  async scheduleAgentFollowUpEmail(userId: string, userEmail: string, agentName: string, delayHours: number = 6) {
    const sendAt = new Date();
    sendAt.setHours(sendAt.getHours() + delayHours);
    
    try {
      const { error } = await supabase.from('email_queue').insert([{
        user_id: userId,
        recipient_email: userEmail,
        template: 'agent-follow-up',
        subject: `🎯 Great job with ${agentName}! Here's what to do next`,
        html_content: this.getAgentFollowUpTemplate(agentName),
        scheduled_for: sendAt.toISOString(),
        template_data: { agentName },
        status: 'pending'
      }]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Failed to schedule follow-up email:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Queue delayed upgrade nurture sequence
  async scheduleUpgradeNurture(userId: string, userEmail: string, userName: string, agentName: string) {
    const emails = [
      {
        delayHours: 24,
        template: 'upgrade-nurture-day1',
        subject: `🌟 See how Pro users are crushing it with ${agentName}`,
        content: this.getUpgradeNurtureTemplate(userName, agentName, 'day1')
      },
      {
        delayHours: 72,
        template: 'upgrade-nurture-day3',
        subject: `⏰ Last chance: Your ${agentName} premium trial expires soon`,
        content: this.getUpgradeNurtureTemplate(userName, agentName, 'day3')
      }
    ];

    try {
      const queueItems = emails.map(email => {
        const sendAt = new Date();
        sendAt.setHours(sendAt.getHours() + email.delayHours);
        
        return {
          user_id: userId,
          recipient_email: userEmail,
          template: email.template,
          subject: email.subject,
          html_content: email.content,
          scheduled_for: sendAt.toISOString(),
          template_data: { userName, agentName },
          status: 'pending'
        };
      });

      const { error } = await supabase.from('email_queue').insert(queueItems);
      if (error) throw error;
      
      return { success: true, scheduled: emails.length };
    } catch (error) {
      console.error('Failed to schedule nurture sequence:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Log email sends for analytics
  private async logEmail(recipientEmail: string, template: string, status: string, messageId?: string) {
    try {
      await supabase.from('email_logs').insert([{
        recipient_email: recipientEmail,
        template,
        status,
        provider_message_id: messageId,
        sent_at: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  // Email Templates
  private getWelcomeTemplate(userName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1E90FF, #30D5C8); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SKRBL AI</h1>
          <p style="color: white; margin: 5px 0;">League of Digital Superheroes</p>
        </div>
        <div style="padding: 20px;">
          <h2>🎉 Welcome ${userName}!</h2>
          <p>You've just joined the most advanced AI automation platform on the planet!</p>
          <p>Percy, your AI Concierge, is ready to help you unlock creative superpowers and automate your workflow.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://skrblai.io/dashboard" style="background: #1E90FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              🚀 Start Your Journey
            </a>
          </div>
          <p><strong>Here's what you can do right away:</strong></p>
          <ul style="padding-left: 20px;">
            <li>🎨 Create stunning content with our Content Creator Agent</li>
            <li>📈 Boost your social presence with Social Media Agent</li>
            <li>🎯 Generate compelling ads with Ad Creative Agent</li>
            <li>📊 Analyze your performance with Analytics Agent</li>
          </ul>
          <p style="margin-top: 30px;">Need help? Just reply to this email - Percy is always here to assist!</p>
        </div>
        <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This email was sent by Percy, your AI Concierge at SKRBL AI</p>
          <p><a href="https://skrblai.io" style="color: #666;">Visit SKRBL AI</a></p>
        </div>
      </div>
    `;
  }

  private getUpgradeTemplate(userName: string, agentName: string, targetRole: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1E90FF, #30D5C8); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SKRBL AI Pro</h1>
          <p style="color: white; margin: 5px 0;">Unlock Your Full Potential</p>
        </div>
        <div style="padding: 20px;">
          <h2>💎 Ready to unlock ${agentName}?</h2>
          <p>Hi ${userName}, we noticed you tried to use ${agentName} - excellent choice!</p>
          <p>You're just one click away from unlocking unlimited automation power:</p>
          
          <div style="background: linear-gradient(135deg, #f0f8ff, #e6f3ff); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1E90FF;">
            <h3 style="margin-top: 0;">🚀 ${targetRole.toUpperCase()} Features Include:</h3>
            <ul style="margin: 10px 0;">
              <li>✅ Unlimited ${agentName} usage</li>
              <li>✅ Advanced workflow automation</li>
              <li>✅ Priority processing (10x faster)</li>
              <li>✅ Premium templates & content</li>
              <li>✅ 24/7 expert support</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://skrblai.io/pricing?agent=${agentName}" style="background: linear-gradient(135deg, #1E90FF, #30D5C8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              🎯 Upgrade to ${targetRole} Now
            </a>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            ⏰ <strong>Limited time:</strong> Get your first month for 50% off!
          </p>
        </div>
      </div>
    `;
  }

  private getAgentFollowUpTemplate(agentName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1E90FF, #30D5C8); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SKRBL AI</h1>
          <p style="color: white; margin: 5px 0;">Agent Success Guide</p>
        </div>
        <div style="padding: 20px;">
          <h2>🎯 Awesome work with ${agentName}!</h2>
          <p>You've just experienced the power of AI automation. Here's how to get even more value:</p>
          
          <div style="background: #f0f8ff; padding: 15px; border-left: 4px solid #1E90FF; margin: 20px 0;">
            <h3>💡 Pro Tips for ${agentName}:</h3>
            <ul>
              <li>Try combining it with other agents for powerful workflows</li>
              <li>Save your favorite prompts for quick access</li>
              <li>Experiment with different input styles for varied results</li>
              <li>Check out our template library for inspiration</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://skrblai.io/dashboard/agents" style="background: #30D5C8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              🔄 Use ${agentName} Again
            </a>
            <a href="https://skrblai.io/agents" style="background: #1E90FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              🚀 Explore More Agents
            </a>
          </div>
        </div>
      </div>
    `;
  }

  private getUpgradeNurtureTemplate(userName: string, agentName: string, sequence: string): string {
    if (sequence === 'day1') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1E90FF, #30D5C8); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SKRBL AI Success Stories</h1>
          </div>
          <div style="padding: 20px;">
            <h2>🌟 See how Pro users are crushing it with ${agentName}</h2>
            <p>Hi ${userName}, here's what Pro users achieved this week:</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Sarah M., Marketing Director:</strong><br>
              "I generated 50 social media posts in 10 minutes with ${agentName}. My engagement increased 300%!"</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Mike R., Small Business Owner:</strong><br>
              "${agentName} helped me create a complete content calendar for 3 months. Saved me 40 hours of work!"</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://skrblai.io/pricing" style="background: #1E90FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                🚀 Join Them - Upgrade to Pro
              </a>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">⏰ Final Notice</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Don't miss out on ${agentName} premium features!</h2>
            <p>Hi ${userName}, this is your final reminder about upgrading your ${agentName} access.</p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>⚠️ What you're missing:</strong></p>
              <ul>
                <li>Unlimited ${agentName} generations</li>
                <li>Advanced customization options</li>
                <li>Priority processing (no waiting)</li>
                <li>Export to multiple formats</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://skrblai.io/pricing" style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                🔥 Upgrade Now - Limited Time
              </a>
            </div>
            
            <p style="text-align: center; font-size: 12px; color: #666;">
              This is the last email about this offer. We respect your inbox!
            </p>
          </div>
        </div>
      `;
    }
  }

  // Add this method to the SimpleEmailAutomation class
  async triggerEmailSequence(sequenceId: string, payload: any) {
    try {
      const sequence = EMAIL_SEQUENCES.find(s => s.id === sequenceId);
      if (!sequence || !sequence.emails.length) {
        return { success: false, error: 'Sequence not found' };
      }

      const firstEmail = sequence.emails[0];
      const sendAt = new Date();
      sendAt.setHours(sendAt.getHours() + (firstEmail.delayHours || 0));

      await supabase.from('email_queue').insert([{
        user_id: payload.userId,
        recipient_email: payload.userEmail,
        template: firstEmail.template,
        subject: firstEmail.subject,
        html_content: this.renderSequenceTemplate(firstEmail.template, payload.templateData),
        scheduled_for: sendAt.toISOString(),
        template_data: payload.templateData,
        status: 'pending'
      }]);

      return { success: true, workflowId: `simple-${sequenceId}-${Date.now()}` };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  private renderSequenceTemplate(template: string, data: any): string {
    switch (template) {
      case 'welcome-immediate':
        return this.getWelcomeTemplate(data.userName || 'there');
      case 'upgrade-benefits':
        return this.getUpgradeTemplate(data.userName || 'there', data.agentName || 'Agent', data.upgradeTarget || 'Pro');
      case 'agent-next-steps':
        return this.getAgentFollowUpTemplate(data.agentName || 'Agent');
      default:
        return `<p>Update from SKRBL AI</p>`;
    }
  }
}

export const emailAutomation = new SimpleEmailAutomation(); 