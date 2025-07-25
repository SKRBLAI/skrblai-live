import { createClient } from '@supabase/supabase-js';
import { getErrorMessage } from '../../utils/errorHandling';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple cron job to process email queue
export async function processEmailQueue() {
  console.log('🔄 Processing email queue...');

  const { data: pendingEmails, error } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(50);

  if (error) {
    console.error('Failed to fetch pending emails:', error);
    return;
  }

  if (!pendingEmails || pendingEmails.length === 0) {
    console.log('✅ No pending emails to process');
    return;
  }

  console.log(`📧 Processing ${pendingEmails.length} emails...`);

  for (const email of pendingEmails) {
    try {
      // Send via Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Percy <percy@skrblai.io>',
          to: email.recipient_email,
          subject: email.subject,
          html: email.html_content
        })
      });

      if (!response.ok) {
        throw new Error(`Resend API failed: ${response.status}`);
      }

      const result = await response.json();

      // Mark as sent
      await supabase
        .from('email_queue')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', email.id);

      // Log for analytics
      await supabase
        .from('email_logs')
        .insert([{
          recipient_email: email.recipient_email,
          template: email.template,
          status: 'sent',
          provider_message_id: result.id,
          sent_at: new Date().toISOString()
        }]);

      console.log(`✅ Sent email to ${email.recipient_email}`);

    } catch (error) {
      console.error(`❌ Email send failed for ${email.recipient_email}:`, error);
      
      // Mark as failed
      await supabase
        .from('email_queue')
        .update({ 
          status: 'failed', 
          error_message: getErrorMessage(error)
        })
        .eq('id', email.id);
    }
  }

  console.log('🎉 Email queue processing complete!');
} 