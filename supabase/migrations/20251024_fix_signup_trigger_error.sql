-- ================================================
-- Fix "Database error saving new user" Issue
-- Date: 2025-10-24
-- Purpose: Remove or fix failing trigger on auth.users
-- ================================================

-- First, let's check if there's a trigger on auth.users
-- that might be failing when new users are created

-- Drop the trigger if it exists (it might be causing the error)
DROP TRIGGER IF EXISTS on_auth_user_created_grant_agents ON auth.users;

-- Check if the function exists and if it needs the agent_permissions table
-- If agent_permissions table doesn't exist or has issues, the trigger would fail
DO $$
BEGIN
  -- Check if grant_default_agent_permissions function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'grant_default_agent_permissions'
  ) THEN
    -- Drop the function as it may be outdated
    DROP FUNCTION IF EXISTS public.grant_default_agent_permissions() CASCADE;
    RAISE NOTICE 'Dropped grant_default_agent_permissions function';
  END IF;
END $$;

-- Create the agent_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agent_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Enable RLS on agent_permissions
ALTER TABLE public.agent_permissions ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for agent_permissions
DROP POLICY IF EXISTS "Users can view own agent permissions" ON public.agent_permissions;
CREATE POLICY "Users can view own agent permissions"
ON public.agent_permissions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create an improved function that handles errors gracefully
CREATE OR REPLACE FUNCTION public.grant_default_agent_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  BEGIN
    -- Grant access to default agents for new users
    INSERT INTO public.agent_permissions (user_id, agent_id, granted_at)
    VALUES 
      (NEW.id, 'percy', now()),
      (NEW.id, 'skillsmith', now())
    ON CONFLICT (user_id, agent_id) DO NOTHING;
    
    -- Also create a default profile and user_role
    INSERT INTO public.profiles (id, email, created_at)
    VALUES (NEW.id, NEW.email, now())
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email;
    
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (NEW.id, 'user', now())
    ON CONFLICT (user_id, role) DO NOTHING;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to grant default permissions for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger with the improved function
CREATE TRIGGER on_auth_user_created_grant_agents
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_default_agent_permissions();

-- Add comments for documentation
COMMENT ON FUNCTION public.grant_default_agent_permissions() IS 'Auto-grants default agent permissions and creates profile/role for new users. Errors are logged but do not fail user creation.';
-- Note: Cannot add comment on trigger for auth.users as it's owned by supabase_admin

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_agent_permissions_user_id ON public.agent_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_permissions_agent_id ON public.agent_permissions(agent_id);

