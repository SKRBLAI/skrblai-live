-- Migration: Add Clerk ID support to profiles table
-- Purpose: Enable dual auth (Clerk + Supabase) with clerk_id as foreign key
-- Safe: Idempotent, non-destructive, preserves existing data

-- Add clerk_id column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'clerk_id'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN clerk_id text UNIQUE;
    
    RAISE NOTICE 'Added clerk_id column to profiles table';
  ELSE
    RAISE NOTICE 'clerk_id column already exists in profiles table';
  END IF;
END $$;

-- Create index on clerk_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id 
ON public.profiles(clerk_id) 
WHERE clerk_id IS NOT NULL;

-- Add deleted_at column if not exists (for soft deletes)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN deleted_at timestamptz;
    
    RAISE NOTICE 'Added deleted_at column to profiles table';
  ELSE
    RAISE NOTICE 'deleted_at column already exists in profiles table';
  END IF;
END $$;

-- Create index on deleted_at for filtering active users
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at 
ON public.profiles(deleted_at) 
WHERE deleted_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.clerk_id IS 'Clerk user ID for dual auth support (when NEXT_PUBLIC_FF_CLERK=1)';
COMMENT ON COLUMN public.profiles.deleted_at IS 'Soft delete timestamp (set by Clerk webhook on user.deleted event)';

-- Grant necessary permissions (idempotent)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO service_role;

RAISE NOTICE 'Migration 20251028_add_clerk_id_to_profiles completed successfully';
