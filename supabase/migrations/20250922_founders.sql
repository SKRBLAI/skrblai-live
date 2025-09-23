-- Founder Codes System Migration
-- Created for SKRBL AI secure founder code redemption and role-based access
-- DO NOT store raw codes - only bcrypt hashes

-- founder_codes: Stores hashed codes and scope
CREATE TABLE IF NOT EXISTS public.founder_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,              -- e.g., "BrandAlexander", "SocialNino", "ContentCarltig", "Jaelin", "Creator"
  role text NOT NULL CHECK (role IN ('creator','founder','heir')),
  agent_likeness text NOT NULL,     -- e.g., 'BrandAlexander','SocialNino','ContentCarltig','Percy','SkillSmith'
  code_hash text NOT NULL,          -- bcrypt hash of provided code
  max_redemptions int NOT NULL DEFAULT 1,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- founder_memberships: Who redeemed what + role assigned + status
CREATE TABLE IF NOT EXISTS public.founder_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,            -- references auth.users.id
  founder_code_id uuid NOT NULL REFERENCES public.founder_codes(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('creator','founder','heir')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','suspended')),
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, founder_code_id)
);

-- founder_usage_logs: Fine-grained audit of founder/heir/creator usage
CREATE TABLE IF NOT EXISTS public.founder_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,             -- founder/heir/creator user id
  action text NOT NULL,              -- e.g., 'access.dashboard', 'launch.agent', 'percy.scan', 'purchase.override'
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful views for Creator-only dashboards
CREATE OR REPLACE VIEW public.v_founder_overview AS
SELECT
  fc.id as founder_code_id,
  fc.label,
  fc.role,
  fc.agent_likeness,
  fc.is_active,
  fc.expires_at,
  COUNT(fm.id) as redemptions,
  fc.max_redemptions
FROM public.founder_codes fc
LEFT JOIN public.founder_memberships fm ON fm.founder_code_id = fc.id AND fm.status='active'
GROUP BY fc.id;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_founder_codes_label ON public.founder_codes(label);
CREATE INDEX IF NOT EXISTS idx_founder_codes_role ON public.founder_codes(role);
CREATE INDEX IF NOT EXISTS idx_founder_codes_active ON public.founder_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_founder_codes_expires ON public.founder_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_founder_memberships_user_id ON public.founder_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_founder_memberships_role ON public.founder_memberships(role);
CREATE INDEX IF NOT EXISTS idx_founder_memberships_status ON public.founder_memberships(status);

CREATE INDEX IF NOT EXISTS idx_founder_usage_logs_user_id ON public.founder_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_founder_usage_logs_action ON public.founder_usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_founder_usage_logs_created_at ON public.founder_usage_logs(created_at);

-- RLS (Row Level Security) – enable and lock down tables
ALTER TABLE public.founder_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policies for founder_codes
-- Only service role can insert/update founder_codes (seed + admin API)
CREATE POLICY "Service role full access to founder_codes" ON public.founder_codes
  FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can only read active, non-expired codes (for validation)
CREATE POLICY "Authenticated users can view active founder codes" ON public.founder_codes
  FOR SELECT USING (
    auth.role() = 'authenticated' 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Policies for founder_memberships
-- Service role has full access
CREATE POLICY "Service role full access to founder_memberships" ON public.founder_memberships
  FOR ALL USING (auth.role() = 'service_role');

-- Users can read their own membership records
CREATE POLICY "Users can view their own founder memberships" ON public.founder_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Policies for founder_usage_logs
-- Only service role can read/write usage logs (for Creator dashboards)
CREATE POLICY "Service role full access to founder_usage_logs" ON public.founder_usage_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON public.founder_codes TO authenticated;
GRANT SELECT ON public.founder_memberships TO authenticated;
GRANT SELECT ON public.v_founder_overview TO service_role;

GRANT ALL ON public.founder_codes TO service_role;
GRANT ALL ON public.founder_memberships TO service_role;
GRANT ALL ON public.founder_usage_logs TO service_role;

-- Comments for documentation
COMMENT ON TABLE public.founder_codes IS 'Stores hashed founder codes with role assignments and redemption limits';
COMMENT ON TABLE public.founder_memberships IS 'Tracks which users have redeemed founder codes and their assigned roles';
COMMENT ON TABLE public.founder_usage_logs IS 'Audit log of all founder/heir/creator actions for oversight';
COMMENT ON VIEW public.v_founder_overview IS 'Creator dashboard view showing founder code usage statistics';

-- Function to get user founder roles (used by API endpoints)
CREATE OR REPLACE FUNCTION get_user_founder_roles(user_uuid uuid)
RETURNS TABLE (
  role text,
  status text,
  redeemed_at timestamptz,
  code_label text,
  agent_likeness text
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fm.role,
    fm.status,
    fm.redeemed_at,
    fc.label as code_label,
    fc.agent_likeness
  FROM public.founder_memberships fm
  JOIN public.founder_codes fc ON fc.id = fm.founder_code_id
  WHERE fm.user_id = user_uuid
  AND fm.status = 'active'
  ORDER BY 
    CASE fm.role 
      WHEN 'creator' THEN 1
      WHEN 'heir' THEN 2  
      WHEN 'founder' THEN 3
      ELSE 4
    END;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_founder_roles(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_founder_roles(uuid) TO service_role;