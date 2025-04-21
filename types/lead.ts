import type { FirestoreTimestamp } from '@/utils/firebase';

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
  timestamp?: FirestoreTimestamp;
}
