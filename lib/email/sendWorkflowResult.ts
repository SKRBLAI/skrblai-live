import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWorkflowResultEmail({
  recipientEmail,
  agentId,
  agentResult
}: {
  recipientEmail: string;
  agentId: string;
  agentResult: string;
}) {
  const email = await resend.emails.send({
    from: 'SKRBL AI <no-reply@skrblai.io>',
    to: recipientEmail,
    subject: `✅ Your ${agentId.toUpperCase()} agent completed!`,
    html: `<p><strong>${agentId.toUpperCase()}</strong> result:</p><pre>${agentResult}</pre><br/><p>Thanks for using SKRBL AI ✨</p>`
  });
  return email;
}
