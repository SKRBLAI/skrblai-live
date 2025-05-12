// server/email/sendWorkflowResult.ts
'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendWorkflowResultEmail({
  recipientEmail,
  agentId,
  agentResult,
}: {
  recipientEmail: string;
  agentId: string;
  agentResult: string;
}) {
  return resend.emails.send({
    to: recipientEmail,
    from: 'noreply@skrblai.io',
    subject: `Workflow Results - Agent ${agentId}`,
    html: agentResult,
  });
}
