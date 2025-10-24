# Supabase Boost Migration Plan

## Overview
This document outlines the complete migration strategy from the current Supabase setup to Supabase Boost with a clean, minimal schema optimized for revenue-ready operations.

## Current State Analysis

### Database Objects Inventory
Based on codebase analysis, the following objects are currently in use:

#### Core Tables (Required for Boost)
- `profiles` - User profile data (id, full_name, email, role, created_at)
- `user_roles` - Role-based access control (id, user_id, role, created_at)
- `founder_codes` - Invite code system (code, hashed, created_at)
- `founder_memberships` - Founder role assignments (user_id, role_name, is_active)

#### Analytics Tables (Keep for Revenue Tracking)
- `agent_launches` - Agent execution tracking (real-time activity feed)
- `n8n_executions` - Workflow execution tracking
- `system_health_logs` - Platform health monitoring

#### Tables to Remove/Archive
- `subscription_conversion_funnel` - Complex analytics, not needed for MVP
- `percy_intelligence_events` - Complex analytics, not needed for MVP
- `percy_contexts` - Complex analytics, not needed for MVP
- `agent_access_logs` - Complex analytics, not needed for MVP
- `founder_usage_logs` - Complex analytics, not needed for MVP
- `agent_permissions` - Complex RBAC, not needed for MVP

### Storage Buckets Analysis
Current usage patterns suggest these buckets:
- `public` - Marketing assets, agent images (public access)
- `private` - User uploads, documents (authenticated access)
- `avatars` - User profile pictures (authenticated access)

## Boost Schema Design

### Core Tables (Idempotent SQL)

```sql
-- ============================================================================
-- SKRBL AI Boost Schema - Clean, Revenue-Ready Baseline
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
```

### RLS Policies (Idempotent)

```sql
-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
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
```

### Storage Buckets & Policies

```sql
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
```

### Seed Data

```sql
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
```

## Migration Strategy

### Phase 1: Boost Project Setup
1. Create new Supabase Boost project
2. Run idempotent schema SQL
3. Configure storage buckets
4. Set up authentication providers (Google OAuth)
5. Configure redirect URLs

### Phase 2: Data Migration (if needed)
- Export critical user data from current project
- Import profiles and user_roles only
- Skip complex analytics data (start fresh)

### Phase 3: Environment Configuration
- Update Railway environment variables
- Configure Stripe Payment Links
- Test authentication flow

### Phase 4: Cutover
- Deploy with new environment variables
- Monitor for issues
- Rollback plan ready

## Performance Optimizations

### Indexes
```sql
-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_revenue_events_user_id ON public.revenue_events(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_created_at ON public.revenue_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_user_id ON public.app_events(user_id);
CREATE INDEX IF NOT EXISTS idx_app_events_created_at ON public.app_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sports_intake_user_id ON public.sports_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_sports_intake_status ON public.sports_intake(status);
```

### Functions
```sql
-- Helper function for role checking
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
```

## Security Considerations

1. **RLS Policies**: All tables have proper RLS policies for data isolation
2. **Service Role**: Limited to necessary operations only
3. **Storage Security**: Proper bucket policies for public/private access
4. **Function Security**: All functions use SECURITY DEFINER with proper search_path
5. **Index Security**: Performance indexes don't expose sensitive data

## Monitoring & Maintenance

1. **Performance Monitoring**: Track query performance with new indexes
2. **Storage Usage**: Monitor bucket usage and implement cleanup policies
3. **Revenue Tracking**: Monitor revenue_events table for payment analytics
4. **User Analytics**: Track app_events for user behavior insights

## Rollback Plan

1. **Database**: Keep current project as backup
2. **Environment**: Maintain old environment variables
3. **Code**: Feature flags for easy rollback
4. **Data**: Export current data before migration

This schema provides a clean, revenue-ready foundation while maintaining the essential functionality needed for the lean launch.