/**
 * FILE DEPRECATED: This file is no longer used with the Supabase auth-helpers implementation.
 * Use createClientComponentClient from @supabase/auth-helpers-nextjs instead.
 * Kept for reference only. It can be safely removed in a future cleanup.
 */

/*
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
*/

// Import the recommended way to create a client
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Export a function that uses the new pattern
export const supabase = createClientComponentClient<Database>();
