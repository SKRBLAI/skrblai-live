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
  mainHeadline: "Your Competition Just Became Extinct",
  subHeadline: "SKRBL AI doesn't just automate—it DOMINATES. 47,000+ businesses have already left their competition in the dust. Your turn starts now.",
  
  percySection: {
    title: "Meet Percy, Your Disruption Engine",
    description: "Percy has automated 1,847 businesses out of their competition this month alone. In 6 minutes, you'll know exactly how to dominate your industry. Your competitors aren't ready.",
    imageAlt: "Percy the Disruption Engine - Your competitive advantage unleashed"
  },
  
  onboarding: {
    promptPlaceholder: "What competitive advantage do you want to unlock first?",
    fileUploadText: "Upload business docs for instant domination strategy",
    ctaButtonText: "Crush My Competition",
    ctaButtonAlt: "Deploy AI to destroy competition"
  },
  
  messaging: {
    loadingText: "Percy is calculating your competitive advantage...",
    successText: "PERFECT! Your domination strategy is ready.",
    errorText: "Hold on—Percy is recalibrating for maximum impact."
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