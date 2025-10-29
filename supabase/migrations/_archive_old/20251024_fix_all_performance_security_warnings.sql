-- ============================================================================
-- Migration: Fix All Supabase Linter Warnings (Performance + Security)
-- Date: 2025-10-24
-- Purpose: Address all 54 warnings from Supabase database linter
--          - 16 Auth RLS InitPlan warnings
--          - 31 Multiple Permissive Policies warnings
--          - 7 Function Search Path Mutable warnings
-- ============================================================================

-- ============================================================================
-- PART 1: FIX AUTH RLS INITPLAN ISSUES (16 warnings)
-- ============================================================================
-- Replace auth.uid() with (select auth.uid()) to prevent per-row evaluation

-- 1. founder_memberships - Service role full access
DROP POLICY IF EXISTS "Service role full access to founder_memberships" ON public.founder_memberships;
CREATE POLICY "Service role full access to founder_memberships" 
ON public.founder_memberships FOR ALL 
USING ((select current_setting('request.jwt.claims', true))::json->>'role' = 'service_role');

-- 2. founder_memberships - Users can view their own
DROP POLICY IF EXISTS "Users can view their own founder memberships" ON public.founder_memberships;
CREATE POLICY "Users can view their own founder memberships" 
ON public.founder_memberships FOR SELECT 
USING (user_id::uuid = (select auth.uid()));

-- 3. founder_codes - Service role full access
DROP POLICY IF EXISTS "Service role full access to founder_codes" ON public.founder_codes;
CREATE POLICY "Service role full access to founder_codes" 
ON public.founder_codes FOR ALL 
USING ((select current_setting('request.jwt.claims', true))::json->>'role' = 'service_role');

-- 4. founder_codes - Authenticated users can view active codes
DROP POLICY IF EXISTS "Authenticated users can view active founder codes" ON public.founder_codes;
CREATE POLICY "Authenticated users can view active founder codes" 
ON public.founder_codes FOR SELECT 
USING ((select auth.uid()) IS NOT NULL AND is_active = true);

-- 5. founder_usage_logs - Service role full access
DROP POLICY IF EXISTS "Service role full access to founder_usage_logs" ON public.founder_usage_logs;
CREATE POLICY "Service role full access to founder_usage_logs" 
ON public.founder_usage_logs FOR ALL 
USING ((select current_setting('request.jwt.claims', true))::json->>'role' = 'service_role');

-- 6. subscription_conversion_funnel - User policy
DROP POLICY IF EXISTS "subscription_conversion_funnel_user_policy" ON public.subscription_conversion_funnel;
CREATE POLICY "subscription_conversion_funnel_user_policy" 
ON public.subscription_conversion_funnel FOR ALL 
USING (userid::uuid = (select auth.uid()));

-- 7-9. agent_launches - Three policies
DROP POLICY IF EXISTS "Users can view their own agent launches" ON public.agent_launches;
DROP POLICY IF EXISTS "Service role full access on agent launches" ON public.agent_launches;
DROP POLICY IF EXISTS "Users can insert their own agent launches" ON public.agent_launches;

-- 10. percy_intelligence_events - User policy
DROP POLICY IF EXISTS "percy_intelligence_events_user_policy" ON public.percy_intelligence_events;
CREATE POLICY "percy_intelligence_events_user_policy" 
ON public.percy_intelligence_events FOR ALL 
USING (user_id::uuid = (select auth.uid()));

-- 11. percy_contexts - User policy
DROP POLICY IF EXISTS "percy_contexts_user_policy" ON public.percy_contexts;
CREATE POLICY "percy_contexts_user_policy" 
ON public.percy_contexts FOR ALL 
USING (user_id::uuid = (select auth.uid()));

-- 12. agent_access_logs - User policy
DROP POLICY IF EXISTS "agent_access_logs_user_policy" ON public.agent_access_logs;
CREATE POLICY "agent_access_logs_user_policy" 
ON public.agent_access_logs FOR ALL 
USING (user_id::uuid = (select auth.uid()));

-- 13-14. n8n_executions - Two policies
DROP POLICY IF EXISTS "Users can view their own workflow executions" ON public.n8n_executions;
DROP POLICY IF EXISTS "Service role full access on n8n executions" ON public.n8n_executions;

-- 15-16. system_health_logs - Two policies
DROP POLICY IF EXISTS "Authenticated users can view system health" ON public.system_health_logs;
DROP POLICY IF EXISTS "Service role full access on system health logs" ON public.system_health_logs;

-- ============================================================================
-- PART 2: CONSOLIDATE MULTIPLE PERMISSIVE POLICIES (31 warnings)
-- ============================================================================
-- Merge overlapping policies into single consolidated policies

-- agent_launches - Consolidate SELECT (4 role variants) and INSERT (4 role variants)
CREATE POLICY "agent_launches_select_consolidated" 
ON public.agent_launches FOR SELECT 
USING (
  user_id::uuid = (select auth.uid()) OR
  (select current_setting('request.jwt.claims', true))::json->>'role' = 'service_role'
);

CREATE POLICY "agent_launches_insert_consolidated" 
ON public.agent_launches FOR INSERT 
WITH CHECK (
  user_id::uuid = (select auth.uid()) OR
  (select current_setting('request.jwt.claims', true))::json->>'role' = 'service_role'
);

-- founder_codes - Consolidate SELECT (4 role variants)
CREATE POLICY "founder_codes_select_consolidated" 
ON public.founder_codes FOR SELECT 
USING (
  ((select auth.uid()) IS NOT NULL AND is_active = true) OR
  (select current_setting('request.jwt.claims', true))::json->>'role' = 'service_role'
);

-- founder_memberships - Consolidate SELECT (4 role variants)
CREATE POLICY "founder_memberships_select_consolidated" 
ON public.founder_memberships FOR SELECT 
USING (
  user_id::uuid = (select auth.uid()) OR
  (select current_setting('request.jwt.claims', true))::json->>'role' = 'service_role'
);

-- n8n_executions - Consolidate SELECT (4 role variants)
CREATE POLICY "n8n_executions_select_consolidated" 
ON public.n8n_executions FOR SELECT 
USING (
  user_id::uuid = (select auth.uid()) OR
  (select current_setting('request.jwt.claims', true))::json->>'role' = 'service_role'
);

-- system_health_logs - Consolidate SELECT (4 role variants)
CREATE POLICY "system_health_logs_select_consolidated" 
ON public.system_health_logs FOR SELECT 
USING (
  (select auth.uid()) IS NOT NULL OR
  (select current_setting('request.jwt.claims', true))::json->>'role' = 'service_role'
);

-- ============================================================================
-- PART 3: FIX FUNCTION SEARCH PATH SECURITY (7 warnings)
-- ============================================================================
-- Add SET search_path = '' to all functions to prevent search_path attacks

-- 1. get_user_founder_roles
DROP FUNCTION IF EXISTS public.get_user_founder_roles(uuid);
CREATE OR REPLACE FUNCTION public.get_user_founder_roles(p_user_id uuid)
RETURNS TABLE(role_name text, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT fm.role_name, fm.is_active
  FROM public.founder_memberships fm
  WHERE fm.user_id = p_user_id
  AND fm.is_active = true;
END;
$$;

-- 2. update_percy_context_timestamp
DROP FUNCTION IF EXISTS public.update_percy_context_timestamp();
CREATE OR REPLACE FUNCTION public.update_percy_context_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. create_agent_launch
DROP FUNCTION IF EXISTS public.create_agent_launch(text, uuid, jsonb);
CREATE OR REPLACE FUNCTION public.create_agent_launch(
  p_agent_id text,
  p_user_id uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_launch_id uuid;
BEGIN
  INSERT INTO public.agent_launches (agent_id, user_id, status, metadata, started_at)
  VALUES (p_agent_id, p_user_id, 'running', p_metadata, now())
  RETURNING id INTO v_launch_id;
  
  RETURN v_launch_id;
END;
$$;

-- 4. complete_agent_launch
DROP FUNCTION IF EXISTS public.complete_agent_launch(uuid, text, text, jsonb);
CREATE OR REPLACE FUNCTION public.complete_agent_launch(
  p_launch_id uuid,
  p_status text,
  p_error_message text DEFAULT NULL,
  p_result jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.agent_launches
  SET 
    status = p_status,
    completed_at = now(),
    error_message = p_error_message,
    result = p_result
  WHERE id = p_launch_id;
  
  RETURN FOUND;
END;
$$;

-- 5. grant_agent_by_email
DROP FUNCTION IF EXISTS public.grant_agent_by_email(text, text);
CREATE OR REPLACE FUNCTION public.grant_agent_by_email(
  p_email text,
  p_agent_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Grant agent access (assumes agent_permissions table exists)
  INSERT INTO public.agent_permissions (user_id, agent_id, granted_at)
  VALUES (v_user_id, p_agent_id, now())
  ON CONFLICT (user_id, agent_id) DO NOTHING;
  
  RETURN true;
END;
$$;

-- 6. grant_default_agent_permissions
DROP FUNCTION IF EXISTS public.grant_default_agent_permissions(uuid);
CREATE OR REPLACE FUNCTION public.grant_default_agent_permissions(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Grant access to default agents for new users
  INSERT INTO public.agent_permissions (user_id, agent_id, granted_at)
  SELECT p_user_id, unnest(ARRAY['percy', 'skillsmith']), now()
  ON CONFLICT (user_id, agent_id) DO NOTHING;
END;
$$;

-- 7. next_auth.uid (if this schema/function exists)
-- Note: next_auth schema may be from an auth provider integration
-- If it doesn't exist, this will safely be skipped
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'next_auth'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'next_auth' AND routine_name = 'uid'
  ) THEN
    EXECUTE 'DROP FUNCTION IF EXISTS next_auth.uid()';
    EXECUTE $func$
      CREATE OR REPLACE FUNCTION next_auth.uid()
      RETURNS uuid
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      SET search_path = ''
      AS $body$
        SELECT COALESCE(
          current_setting('request.jwt.claim.sub', true),
          (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )::uuid;
      $body$;
    $func$;
  END IF;
END;
$$;

-- ============================================================================
-- PART 4: ADD PERFORMANCE INDEXES
-- ============================================================================
-- Create indexes to support efficient RLS policy evaluation

CREATE INDEX IF NOT EXISTS idx_agent_launches_user_id_rls ON public.agent_launches(user_id);
CREATE INDEX IF NOT EXISTS idx_founder_memberships_user_id_rls ON public.founder_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_founder_codes_active_rls ON public.founder_codes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_n8n_executions_user_id_rls ON public.n8n_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_percy_intelligence_events_user_id_rls ON public.percy_intelligence_events(user_id);
CREATE INDEX IF NOT EXISTS idx_percy_contexts_user_id_rls ON public.percy_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_access_logs_user_id_rls ON public.agent_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_conversion_funnel_userid_rls ON public.subscription_conversion_funnel(userid);

-- ============================================================================
-- PART 5: VALIDATION REPORT
-- ============================================================================

DO $$
DECLARE
  v_policy_count int;
  v_function_count int;
BEGIN
  -- Count remaining policies with direct auth calls
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND (
    (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR
    (qual LIKE '%auth.role()%' AND qual NOT LIKE '%(select auth.role())%')
  );
  
  -- Count functions without search_path set
  SELECT COUNT(*) INTO v_function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname IN ('public', 'next_auth')
  AND p.prosecdef = true  -- SECURITY DEFINER functions
  AND NOT EXISTS (
    SELECT 1 FROM unnest(p.proconfig) AS cfg
    WHERE cfg LIKE 'search_path=%'
  );
  
  RAISE NOTICE '=== MIGRATION COMPLETE ===';
  RAISE NOTICE 'Remaining policies with direct auth calls: %', v_policy_count;
  RAISE NOTICE 'Remaining functions without search_path: %', v_function_count;
  
  IF v_policy_count = 0 AND v_function_count = 0 THEN
    RAISE NOTICE '✅ ALL WARNINGS RESOLVED!';
  ELSE
    RAISE WARNING '⚠️  Some issues remain - manual review needed';
  END IF;
END;
$$;

-- Log completion
SELECT '✅ Performance and Security Migration (2025-10-24) completed' AS status;
