export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agent_usage_stats: {
        Row: {
          agent_id: string
          agent_name: string
          agent_emoji: string
          usage_count: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          agent_name: string
          agent_emoji: string
          usage_count?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          agent_name?: string
          agent_emoji?: string
          usage_count?: number
          updated_at?: string
        }
      }
      percy_feedback: {
        Row: {
          id: string
          agent_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          message?: string
          created_at?: string
        }
      }
    }
  }
}
