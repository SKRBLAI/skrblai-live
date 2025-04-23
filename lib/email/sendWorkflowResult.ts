import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWorkflowResultEmail({
  email,
  agentId,
  result
}: {
  email: string;
  agentId: string;
  result: string;
}) {
  await resend.emails.send({
    from: 'SKRBL AI <no-reply@skrblai.io>',
    to: email,
    subject: `✅ Your ${agentId.toUpperCase()} agent completed!`,
    html: `<p><strong>${agentId.toUpperCase()}</strong> result:</p><pre>${result}</pre><br/><p>Thanks for using SKRBL AI ✨</p>`
  });
}
