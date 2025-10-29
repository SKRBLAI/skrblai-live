-- ============================================================================
-- SKRBL AI Boost Schema - Clean, Revenue-Ready Baseline
-- Generated: 2025-10-24
-- Purpose: Complete schema for Supabase Boost migration
-- ============================================================================

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- 1. PROFILES - Core user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'vip', 'founder', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER_ROLES - Role-based access control
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'vip', 'founder', 'admin')),
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INVITE_CODES - Simplified invite system
CREATE TABLE IF NOT EXISTS public.invite_codes (
  code TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('vip', 'founder')),
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REVENUE_EVENTS - Payment tracking
CREATE TABLE IF NOT EXISTS public.revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('payment_link_click', 'payment_success', 'payment_failed')),
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  product_sku TEXT,
  stripe_session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APP_EVENTS - Simplified analytics
CREATE TABLE IF NOT EXISTS public.app_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  page_path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SPORTS_INTAKE - Sports-specific data
CREATE TABLE IF NOT EXISTS public.sports_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT,
  analysis_result JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Revenue events indexes
CREATE INDEX IF NOT EXISTS idx_revenue_events_user_id ON public.revenue_events(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_created_at ON public.revenue_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_events_event_type ON public.revenue_events(event_type);

-- App events indexes
CREATE INDEX IF NOT EXISTS idx_app_events_user_id ON public.app_events(user_id);
CREATE INDEX IF NOT EXISTS idx_app_events_created_at ON public.app_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_event_type ON public.app_events(event_type);

-- Sports intake indexes
CREATE INDEX IF NOT EXISTS idx_sports_intake_user_id ON public.sports_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_sports_intake_status ON public.sports_intake(status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_intake ENABLE ROW LEVEL SECURITY;

-- Helper function for idempotent policy creation
CREATE OR REPLACE FUNCTION public.ensure_policy(
  p_name TEXT,
  p_table REGCLASS,
  p_cmd TEXT,
  p_using TEXT,
  p_with_check TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = split_part(p_table::text, '.', 2) 
    AND policyname = p_name
  ) THEN
    IF p_with_check IS NOT NULL THEN
      EXECUTE format(
        'CREATE POLICY %I ON %s FOR %s USING (%s) WITH CHECK (%s)',
        p_name, p_table, p_cmd, p_using, p_with_check
      );
    ELSE
      EXECUTE format(
        'CREATE POLICY %I ON %s FOR %s USING (%s)',
        p_name, p_table, p_cmd, p_using
      );
    END IF;
  END IF;
END; $$;

-- Profiles policies
SELECT public.ensure_policy(
  'profiles_owner_read',
  'public.profiles',
  'SELECT',
  'id = auth.uid()'
);

SELECT public.ensure_policy(
  'profiles_owner_update',
  'public.profiles',
  'UPDATE',
  'id = auth.uid()',
  'id = auth.uid()'
);

SELECT public.ensure_policy(
  'profiles_owner_insert',
  'public.profiles',
  'INSERT',
  'true',
  'id = auth.uid()'
);

-- User roles policies
SELECT public.ensure_policy(
  'user_roles_owner_read',
  'public.user_roles',
  'SELECT',
  'user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN (''admin'', ''founder''))'
);

SELECT public.ensure_policy(
  'user_roles_service_full',
  'public.user_roles',
  'ALL',
  'current_setting(''request.jwt.claims'', true)::json->>''role'' = ''service_role'''
);

-- Invite codes policies
SELECT public.ensure_policy(
  'invite_codes_read',
  'public.invite_codes',
  'SELECT',
  'auth.uid() IS NOT NULL'
);

SELECT public.ensure_policy(
  'invite_codes_service_full',
  'public.invite_codes',
  'ALL',
  'current_setting(''request.jwt.claims'', true)::json->>''role'' = ''service_role'''
);

-- Revenue events policies
SELECT public.ensure_policy(
  'revenue_events_owner_read',
  'public.revenue_events',
  'SELECT',
  'user_id = auth.uid() OR current_setting(''request.jwt.claims'', true)::json->>''role'' = ''service_role'''
);

SELECT public.ensure_policy(
  'revenue_events_service_insert',
  'public.revenue_events',
  'INSERT',
  'current_setting(''request.jwt.claims'', true)::json->>''role'' = ''service_role'''
);

-- App events policies
SELECT public.ensure_policy(
  'app_events_owner_read',
  'public.app_events',
  'SELECT',
  'user_id = auth.uid() OR current_setting(''request.jwt.claims'', true)::json->>''role'' = ''service_role'''
);

SELECT public.ensure_policy(
  'app_events_authenticated_insert',
  'public.app_events',
  'INSERT',
  'auth.uid() IS NOT NULL',
  'user_id = auth.uid()'
);

-- Sports intake policies
SELECT public.ensure_policy(
  'sports_intake_owner_all',
  'public.sports_intake',
  'ALL',
  'user_id = auth.uid()'
);

SELECT public.ensure_policy(
  'sports_intake_service_full',
  'public.sports_intake',
  'ALL',
  'current_setting(''request.jwt.claims'', true)::json->>''role'' = ''service_role'''
);

-- ============================================================================
-- STORAGE BUCKETS AND POLICIES
-- ============================================================================

-- Create buckets (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('public', 'public', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('private', 'private', false, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']),
  ('avatars', 'avatars', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Public bucket policies
CREATE POLICY "Public bucket read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'public');

-- Private bucket policies
CREATE POLICY "Private bucket owner access" ON storage.objects
  FOR ALL USING (bucket_id = 'private' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars bucket policies
CREATE POLICY "Avatars bucket owner access" ON storage.objects
  FOR ALL USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars bucket public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has role
CREATE OR REPLACE FUNCTION public.user_has_role(p_role TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = p_role
  );
END; $$;

-- Function to grant role by invite code
CREATE OR REPLACE FUNCTION public.redeem_invite_code(p_code TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_code_record RECORD;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  SELECT * INTO v_code_record
  FROM public.invite_codes
  WHERE code = p_code
  AND (expires_at IS NULL OR expires_at > NOW())
  AND used_count < max_uses;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;
  
  -- Grant role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, v_code_record.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update usage count
  UPDATE public.invite_codes
  SET used_count = used_count + 1
  WHERE code = p_code;
  
  RETURN v_code_record.role;
END; $$;

-- Function to track revenue events
CREATE OR REPLACE FUNCTION public.track_revenue_event(
  p_event_type TEXT,
  p_amount_cents INTEGER DEFAULT NULL,
  p_currency TEXT DEFAULT 'usd',
  p_product_sku TEXT DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.revenue_events (
    user_id,
    event_type,
    amount_cents,
    currency,
    product_sku,
    stripe_session_id,
    metadata
  ) VALUES (
    auth.uid(),
    p_event_type,
    p_amount_cents,
    p_currency,
    p_product_sku,
    p_stripe_session_id,
    p_metadata
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END; $$;

-- Function to track app events
CREATE OR REPLACE FUNCTION public.track_app_event(
  p_event_type TEXT,
  p_page_path TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.app_events (
    user_id,
    event_type,
    page_path,
    metadata
  ) VALUES (
    auth.uid(),
    p_event_type,
    p_page_path,
    p_metadata
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END; $$;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Founder invite codes
INSERT INTO public.invite_codes (code, role, max_uses, created_by) VALUES
  ('diggin_420', 'founder', 1, NULL),
  ('bmore_finest_365', 'founder', 1, NULL),
  ('gold_glove_92', 'founder', 1, NULL),
  ('aod_aoi_619', 'founder', 1, NULL),
  ('mstr_jay_2003', 'founder', 1, NULL),
  ('mstr_skrbl_3', 'founder', 1, NULL)
ON CONFLICT (code) DO NOTHING;

-- VIP invite codes
INSERT INTO public.invite_codes (code, role, max_uses, expires_at) VALUES
  ('vip_launch_2025', 'vip', 100, NOW() + INTERVAL '30 days'),
  ('early_access_2025', 'vip', 50, NOW() + INTERVAL '14 days')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.invite_codes TO authenticated;
GRANT SELECT ON public.revenue_events TO authenticated;
GRANT SELECT, INSERT ON public.app_events TO authenticated;
GRANT ALL ON public.sports_intake TO authenticated;

-- Grant permissions to service role
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.invite_codes TO service_role;
GRANT ALL ON public.revenue_events TO service_role;
GRANT ALL ON public.app_events TO service_role;
GRANT ALL ON public.sports_intake TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.user_has_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_invite_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_revenue_event(TEXT, INTEGER, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_app_event(TEXT, TEXT, JSONB) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'Core user profile data';
COMMENT ON TABLE public.user_roles IS 'Role-based access control';
COMMENT ON TABLE public.invite_codes IS 'Invite code system for role granting';
COMMENT ON TABLE public.revenue_events IS 'Payment and revenue tracking';
COMMENT ON TABLE public.app_events IS 'User behavior analytics';
COMMENT ON TABLE public.sports_intake IS 'Sports video analysis data';

COMMENT ON FUNCTION public.user_has_role(TEXT) IS 'Check if current user has specified role';
COMMENT ON FUNCTION public.redeem_invite_code(TEXT) IS 'Redeem invite code and grant role';
COMMENT ON FUNCTION public.track_revenue_event(TEXT, INTEGER, TEXT, TEXT, TEXT, JSONB) IS 'Track revenue events';
COMMENT ON FUNCTION public.track_app_event(TEXT, TEXT, JSONB) IS 'Track user app events';

-- ============================================================================
-- VALIDATION
-- ============================================================================

-- Verify tables were created
DO $$
DECLARE
  v_table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'user_roles', 'invite_codes', 'revenue_events', 'app_events', 'sports_intake');
  
  IF v_table_count = 6 THEN
    RAISE NOTICE '✅ All tables created successfully';
  ELSE
    RAISE WARNING '⚠️  Expected 6 tables, found %', v_table_count;
  END IF;
END; $$;

-- Verify RLS is enabled
DO $$
DECLARE
  v_rls_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_rls_count
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
  AND c.relname IN ('profiles', 'user_roles', 'invite_codes', 'revenue_events', 'app_events', 'sports_intake')
  AND c.relrowsecurity = true;
  
  IF v_rls_count = 6 THEN
    RAISE NOTICE '✅ RLS enabled on all tables';
  ELSE
    RAISE WARNING '⚠️  Expected 6 tables with RLS, found %', v_rls_count;
  END IF;
END; $$;

-- Verify storage buckets
DO $$
DECLARE
  v_bucket_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_bucket_count
  FROM storage.buckets
  WHERE id IN ('public', 'private', 'avatars');
  
  IF v_bucket_count = 3 THEN
    RAISE NOTICE '✅ All storage buckets created';
  ELSE
    RAISE WARNING '⚠️  Expected 3 buckets, found %', v_bucket_count;
  END IF;
END; $$;

SELECT '✅ SKRBL AI Boost Schema migration completed successfully' AS status;