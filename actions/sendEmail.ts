// actions/sendEmail.ts
'use server';
import { sendWorkflowResultEmail } from '@/server/email/sendWorkflowResult';

export async function sendEmailAction(recipientEmail: string, agentId: string, agentResult: string) {
  return sendWorkflowResultEmail({ recipientEmail, agentId, agentResult });
}
