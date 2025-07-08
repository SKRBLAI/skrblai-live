/**
 * Stub workflow implementations for agents.
 * These simulate n8n workflows locally for development/testing.
 * Production environment should replace these with real webhook invocations.
 */

export const branding = async (payload: any) => {
  await new Promise(res => setTimeout(res, 1000));
  return `Branding Kit Generated for ${payload.projectName || 'project'}`;
};

export const content = async (payload: any) => {
  await new Promise(res => setTimeout(res, 1200));
  return `Blog draft created on topic: ${payload.topic || 'untitled'}`;
};

export const videoContent = async (payload: any) => {
  await new Promise(res => setTimeout(res, 1000));
  return `Short-form video scripts generated for ${payload.niche || 'general niche'}`;
};

// Add more agent workflow stubs as needed to support local development 