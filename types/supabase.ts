// Supabase type definitions to replace Firebase types

export type SupabaseTimestamp = string;

export interface Lead {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  service?: string;
  referral?: string;
  createdAt?: SupabaseTimestamp;
}

export interface ScheduledPost {
  platform: string;
  postDate: string;
  description: string;
  status: string;
  createdAt?: SupabaseTimestamp;
  updatedAt?: SupabaseTimestamp;
}

export interface Proposal {
  projectName: string;
  notes: string;
  budget: string;
  pdfUrl: string;
  createdAt?: SupabaseTimestamp;
  updatedAt?: SupabaseTimestamp;
}

export interface User {
  name: string;
  email: string;
  createdAt?: SupabaseTimestamp;
  updatedAt?: SupabaseTimestamp;
}

export interface AgentActivity {
  agentName: string;
  userId: string;
  action: string;
  status: 'success' | 'error';
  timestamp: string;
  details?: Record<string, any>;
  error?: string;
  created_at?: SupabaseTimestamp;
} 