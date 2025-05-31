import type { SupabaseTimestamp } from './supabase';

export interface Lead {
  name: string;
  email: string;
  selectedPlan: string;
  intent: string;
  freeTrial?: boolean;
  businessGoal?: string;
  createdAt?: string;
  userId?: string;
  userPrompt?: string;
  userLink?: string;
  userFileUrl?: string;
  userFileName?: string;
  timestamp?: SupabaseTimestamp;
  businessName?: string;
  brandVision?: string;
}
