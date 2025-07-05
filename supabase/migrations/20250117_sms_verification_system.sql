-- SMS Verification System Tables
-- Created to support VIP SMS onboarding and verification

-- Table for storing SMS verification codes
CREATE TABLE IF NOT EXISTS sms_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    vip_tier TEXT NOT NULL DEFAULT 'gold',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Table for storing verified VIP phone numbers
CREATE TABLE IF NOT EXISTS vip_phone_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    vip_tier TEXT NOT NULL DEFAULT 'gold',
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_verifications_phone ON sms_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_code ON sms_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_expires ON sms_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_vip_phone_numbers_phone ON vip_phone_numbers(phone_number);

-- Row Level Security (RLS)
ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_phone_numbers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sms_verifications (allow service role full access)
CREATE POLICY "Service role can manage SMS verifications" ON sms_verifications
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for vip_phone_numbers (allow service role full access)
CREATE POLICY "Service role can manage VIP phone numbers" ON vip_phone_numbers
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_sms_verifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM sms_verifications 
    WHERE expires_at < NOW() 
    AND verified = FALSE;
END;
$$;

-- Create a function to check if phone number is VIP verified
CREATE OR REPLACE FUNCTION is_vip_phone_verified(phone TEXT)
RETURNS TABLE(verified BOOLEAN, vip_tier TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT v.verified, v.vip_tier
    FROM vip_phone_numbers v
    WHERE v.phone_number = phone
    LIMIT 1;
END;
$$; 