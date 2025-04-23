export const branding = async (payload: any) => {
  await new Promise((res) => setTimeout(res, 1000)); // simulate delay
  return `Branding Kit Generated for ${payload.projectName}`;
};

export const content = async (payload: any) => {
  await new Promise((res) => setTimeout(res, 1200));
  return `Blog draft created on topic: ${payload.topic}`;
};

export const videoContent = async (payload: any) => {
  await new Promise((res) => setTimeout(res, 1000));
  return `Short-form video scripts generated for ${payload.niche}`;
};

// Add more agents here as needed...
