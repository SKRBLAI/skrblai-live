// Centralized Hero Section Configuration
// This file contains all copy, messaging, and onboarding configuration for easy updates

export interface HeroConfig {
  mainHeadline: string;
  subHeadline: string;
  percySection: {
    title: string;
    description: string;
    imageAlt: string;
  };
  onboarding: {
    promptPlaceholder: string;
    fileUploadText: string;
    ctaButtonText: string;
    ctaButtonAlt: string;
  };
  messaging: {
    loadingText: string;
    successText: string;
    errorText: string;
  };
}

export const heroConfig: HeroConfig = {
  mainHeadline: "Welcome to SKRBL AI",
  subHeadline: "Your gateway to intelligent automation. Discover our suite of AI agents ready to transform your digital experience.",
  
  percySection: {
    title: "Meet Percy, Your AI Concierge",
    description: "Let Percy guide you to the perfect AI solution for your business. Upload files, describe your goals, or explore our features.",
    imageAlt: "Percy the AI Concierge - Your personal AI assistant"
  },
  
  onboarding: {
    promptPlaceholder: "Tell me about your business goals or challenges...",
    fileUploadText: "Upload files or documents",
    ctaButtonText: "Explore Features",
    ctaButtonAlt: "Start exploring SKRBL AI features"
  },
  
  messaging: {
    loadingText: "Percy is thinking...",
    successText: "Great! Let me help you get started.",
    errorText: "Something went wrong. Please try again."
  }
};

// Onboarding flow configuration
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: 'prompt' | 'file' | 'features' | 'chat';
  route?: string;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'prompt',
    title: 'Describe Your Goals',
    description: 'Tell Percy about your business challenges or objectives',
    action: 'prompt'
  },
  {
    id: 'upload',
    title: 'Upload Files',
    description: 'Share documents, images, or data for AI analysis',
    action: 'file'
  },
  {
    id: 'explore',
    title: 'Explore Features',
    description: 'Browse our AI agent marketplace and capabilities',
    action: 'features',
    route: '/services/agents'
  }
];

// Percy personality and response templates
export const percyPersonality = {
  greeting: "Hello! I'm Percy, your AI business concierge. 👋",
  helpText: "I'm here to help you find the perfect AI solution for your unique needs.",
  confidence: "Don't worry - there are no wrong answers here.",
  expertise: "I work with businesses of all sizes to implement AI solutions that deliver real results."
};

export default heroConfig; 