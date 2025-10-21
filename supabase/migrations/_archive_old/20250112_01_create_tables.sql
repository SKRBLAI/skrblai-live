-- ============================================
-- SKRBL AI - Create Required Tables
-- Migration: 20250112_01_create_tables
-- Purpose: Create all required tables before applying RLS policies
-- Run this FIRST before the RLS policies migration
-- ============================================

-- ============================================
-- PART 1: USER_SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_settings (
  id BIGSERIAL PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  onboarding JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  trial_status TEXT DEFAULT 'active',
  trial_expires_at TIMESTAMPTZ,
  subscription_tier TEXT DEFAULT 'free',
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_userId ON user_settings(userId);

-- ============================================
-- PART 2: SYSTEM_LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS system_logs (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('error', 'warning', 'info')),
  message TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_type ON system_logs(type);

-- ============================================
-- PART 3: TAX_CALCULATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tax_calculations (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_invoice_id TEXT,
  calculation_type TEXT CHECK (calculation_type IN ('checkout', 'invoice', 'quote')),
  subtotal INTEGER NOT NULL, -- in cents
  tax_amount INTEGER NOT NULL, -- in cents
  total_amount INTEGER NOT NULL, -- in cents
  tax_jurisdiction TEXT,
  tax_rate DECIMAL(5,4), -- e.g., 0.0875 for 8.75%
  tax_breakdown JSONB DEFAULT '[]'::jsonb,
  customer_address JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_calculations_user_id ON tax_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_session_id ON tax_calculations(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_created_at ON tax_calculations(created_at DESC);

-- ============================================
-- PART 4: AGENT_PERMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS agent_permissions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  granted_by TEXT, -- admin user_id who granted permission
  UNIQUE(user_id, agent_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_permissions_user_id ON agent_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_permissions_agent_id ON agent_permissions(agent_id);

-- ============================================
-- PART 5: USER_ROLES TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS user_roles (
  id BIGSERIAL PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'superadmin', 'vip', 'founder')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by TEXT
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_roles_userId ON user_roles(userId);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- ============================================
-- PART 6: LEADS TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  company TEXT,
  source TEXT, -- e.g., 'homepage', 'pricing', 'contact'
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ============================================
-- PART 7: PROFILES TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  role TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================
-- PART 8: REVENUE_EVENTS TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS revenue_events (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL, -- e.g., 'subscription_created', 'payment_succeeded'
  amount INTEGER, -- in cents
  currency TEXT DEFAULT 'USD',
  stripe_event_id TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_revenue_events_user_id ON revenue_events(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_created_at ON revenue_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_events_event_type ON revenue_events(event_type);

-- ============================================
-- PART 9: SPORTS_INTAKE TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS sports_intake (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  sport TEXT,
  skill_level TEXT,
  goals TEXT,
  age_group TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sports_intake_user_id ON sports_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_sports_intake_email ON sports_intake(email);
CREATE INDEX IF NOT EXISTS idx_sports_intake_created_at ON sports_intake(created_at DESC);

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'user_settings',
    'system_logs',
    'tax_calculations',
    'agent_permissions',
    'user_roles',
    'leads',
    'profiles',
    'revenue_events',
    'sports_intake'
  );
  
  RAISE NOTICE '✅ Table Creation Complete!';
  RAISE NOTICE '📊 Tables Created/Verified: %', table_count;
  RAISE NOTICE '📈 Expected: 9 tables';
  
  IF table_count < 9 THEN
    RAISE WARNING '⚠️  Some tables may not have been created. Check logs above.';
  END IF;
END $$;

-- ============================================
-- NEXT STEP
-- ============================================
-- Now run: 20250112_02_fix_rls_policies_and_permissions.sql
-- ============================================
