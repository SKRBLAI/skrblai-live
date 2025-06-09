-- Marketing Consent Migration
-- This migration adds tables and functions for managing user marketing consent preferences

-- Create marketing consent table
CREATE TABLE IF NOT EXISTS marketing_consent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    withdrawal_date TIMESTAMP WITH TIME ZONE,
    source VARCHAR(100) DEFAULT 'signup', -- 'signup', 'profile_update', 'landing_page', etc.
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user
    UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_consent_email ON marketing_consent(email);
CREATE INDEX IF NOT EXISTS idx_marketing_consent_user_id ON marketing_consent(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_consent_consent_given ON marketing_consent(consent_given);
CREATE INDEX IF NOT EXISTS idx_marketing_consent_source ON marketing_consent(source);

-- Create function to update marketing consent
CREATE OR REPLACE FUNCTION update_marketing_consent(
    p_user_id UUID,
    p_email VARCHAR(255),
    p_consent_given BOOLEAN,
    p_source VARCHAR(100) DEFAULT 'profile_update',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Insert or update consent record
    INSERT INTO marketing_consent (
        user_id, 
        email, 
        consent_given, 
        consent_date,
        withdrawal_date,
        source, 
        ip_address, 
        user_agent
    ) VALUES (
        p_user_id, 
        p_email, 
        p_consent_given,
        CASE WHEN p_consent_given THEN NOW() ELSE NULL END,
        CASE WHEN NOT p_consent_given THEN NOW() ELSE NULL END,
        p_source, 
        p_ip_address, 
        p_user_agent
    )
    ON CONFLICT (user_id) DO UPDATE SET
        consent_given = p_consent_given,
        consent_date = CASE 
            WHEN p_consent_given AND NOT marketing_consent.consent_given THEN NOW() 
            WHEN p_consent_given THEN marketing_consent.consent_date
            ELSE NULL 
        END,
        withdrawal_date = CASE 
            WHEN NOT p_consent_given AND marketing_consent.consent_given THEN NOW() 
            ELSE marketing_consent.withdrawal_date 
        END,
        source = p_source,
        ip_address = COALESCE(p_ip_address, marketing_consent.ip_address),
        user_agent = COALESCE(p_user_agent, marketing_consent.user_agent),
        updated_at = NOW();

    -- Return success result
    SELECT json_build_object(
        'success', true,
        'consent_given', p_consent_given,
        'updated_at', NOW()
    ) INTO result;

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get marketing consent status
CREATE OR REPLACE FUNCTION get_marketing_consent(
    p_user_id UUID
) RETURNS JSON AS $$
DECLARE
    consent_record marketing_consent%ROWTYPE;
    result JSON;
BEGIN
    -- Get consent record
    SELECT * INTO consent_record 
    FROM marketing_consent 
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', true,
            'consent_given', false,
            'has_record', false
        );
    END IF;

    -- Return consent details
    SELECT json_build_object(
        'success', true,
        'consent_given', consent_record.consent_given,
        'has_record', true,
        'consent_date', consent_record.consent_date,
        'withdrawal_date', consent_record.withdrawal_date,
        'source', consent_record.source,
        'created_at', consent_record.created_at,
        'updated_at', consent_record.updated_at
    ) INTO result;

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS (Row Level Security) policies
ALTER TABLE marketing_consent ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and modify their own consent records
CREATE POLICY "Users can manage their own marketing consent" ON marketing_consent
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Service role can access all records (for admin operations)
CREATE POLICY "Service role can access all marketing consent" ON marketing_consent
    FOR ALL TO service_role USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON marketing_consent TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_marketing_consent TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_marketing_consent TO authenticated, anon;

-- Grant service role full access
GRANT ALL ON marketing_consent TO service_role;
GRANT EXECUTE ON FUNCTION update_marketing_consent TO service_role;
GRANT EXECUTE ON FUNCTION get_marketing_consent TO service_role; 