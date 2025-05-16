export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SupabaseTimestamp = string;

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
}

// UPDATED Proposal interface:
export interface Proposal {
  id: string;
  projectName: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: string;
  pdfUrl?: string;
  notes?: string;   // <-- now included and optional
}

export interface ScheduledPost {
  id?: string;
  platform: string;
  content: string;
  scheduledTime: string;
  status: 'pending' | 'posted' | 'failed';
  userId?: string;
}

export interface Database {
  public: {
    Tables: {
      agent_usage_stats: {
        Row: {
          agent_id: string;
          agent_name: string;
          agent_emoji: string;
          usage_count: number;
          updated_at: string;
        };
        Insert: {
          agent_id: string;
          agent_name: string;
          agent_emoji: string;
          usage_count?: number;
          updated_at?: string;
        };
        Update: {
          agent_id?: string;
          agent_name?: string;
          agent_emoji?: string;
          usage_count?: number;
          updated_at?: string;
        };
      };
      percy_feedback: {
        Row: {
          id: string;
          agent_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          message?: string;
          created_at?: string;
        };
      };
    };
  };
}
