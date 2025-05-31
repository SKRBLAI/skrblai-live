import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { type, to, templateData } = await req.json();

    // Use Resend API for actual email sending
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Percy <percy@skrblai.io>',
        to: to,
        subject: getEmailSubject(type, templateData),
        html: getEmailTemplate(type, templateData)
      })
    });

    if (!response.ok) {
      throw new Error(`Resend API failed: ${response.status}`);
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      messageId: result.id 
    });

  } catch (error) {
    console.error('Email send failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' }, 
      { status: 500 }
    );
  }
}

function getEmailSubject(type: string, data: any): string {
  switch (type) {
    case 'welcome':
      return '🎉 Welcome to the League of Digital Superheroes!';
    case 'upgrade-prompt':
      return `💎 Unlock ${data.agentName} Premium Features - Special Offer!`;
    case 'agent-follow-up':
      return `🎯 Great job with ${data.agentName}! Here's what to do next`;
    default:
      return 'Update from SKRBL AI';
  }
}

function getEmailTemplate(type: string, data: any): string {
  const templates = {
    'welcome': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1E90FF, #30D5C8); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SKRBL AI</h1>
          <p style="color: white; margin: 5px 0;">League of Digital Superheroes</p>
        </div>
        <div style="padding: 20px;">
          <h2>🎉 Welcome ${data.userName || 'there'}!</h2>
          <p>You've just joined the most advanced AI automation platform on the planet!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://skrblai.io/dashboard" style="background: #1E90FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              🚀 Start Your Journey
            </a>
          </div>
        </div>
      </div>
    `,
    'upgrade-prompt': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1E90FF, #30D5C8); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SKRBL AI Pro</h1>
        </div>
        <div style="padding: 20px;">
          <h2>💎 Ready to unlock ${data.agentName}?</h2>
          <p>Hi ${data.userName}, upgrade to ${data.targetRole} to unlock unlimited power!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://skrblai.io/pricing" style="background: #1E90FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              🎯 Upgrade Now
            </a>
          </div>
        </div>
      </div>
    `
  };
  
  return (templates as any)[type] || '<p>Update from SKRBL AI</p>';
} 