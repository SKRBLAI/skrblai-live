-- Migration: Add Stripe subscription tables
-- Created: 2025-01-17
-- Purpose: Support Stripe payment integration and subscription management

-- Add Stripe fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS tax_country VARCHAR(2), -- ISO country code for tax purposes
ADD COLUMN IF NOT EXISTS tax_state VARCHAR(10), -- State/province for tax
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(255), -- Business tax ID if provided
ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT FALSE; -- Tax exemption status

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due, unpaid, etc.
  price_id VARCHAR(255) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  -- Tax-related fields
  tax_behavior VARCHAR(50) DEFAULT 'unspecified', -- inclusive, exclusive, unspecified
  default_tax_rates JSONB DEFAULT '[]', -- Array of tax rate IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_events table for audit trail
CREATE TABLE IF NOT EXISTS payment_events (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  amount INTEGER, -- in cents (subtotal)
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  -- Tax-specific fields
  tax_amount INTEGER DEFAULT 0, -- tax amount in cents
  total_amount INTEGER, -- total including tax
  tax_calculation JSONB DEFAULT '{}', -- detailed tax breakdown
  customer_location JSONB DEFAULT '{}', -- billing/shipping address used for tax
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id SERIAL PRIMARY KEY,
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_product_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'USD',
  interval VARCHAR(20) NOT NULL, -- month, year, etc.
  interval_count INTEGER DEFAULT 1,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  -- Tax configuration
  tax_behavior VARCHAR(50) DEFAULT 'unspecified', -- inclusive, exclusive, unspecified
  tax_code VARCHAR(50), -- Stripe tax code for the product
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax_calculations table for audit and reporting
CREATE TABLE IF NOT EXISTS tax_calculations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  calculation_type VARCHAR(50) NOT NULL, -- checkout, invoice, quote
  subtotal INTEGER NOT NULL, -- amount before tax in cents
  tax_amount INTEGER NOT NULL, -- tax amount in cents
  total_amount INTEGER NOT NULL, -- total including tax in cents
  currency VARCHAR(3) DEFAULT 'USD',
  tax_jurisdiction VARCHAR(100), -- e.g., "US-CA", "GB", "AU-NSW"
  tax_rate DECIMAL(5,4), -- effective tax rate (e.g., 0.0875 for 8.75%)
  tax_breakdown JSONB DEFAULT '{}', -- detailed breakdown by tax type
  customer_address JSONB DEFAULT '{}', -- address used for calculation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_events_user_id ON payment_events(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_type ON payment_events(event_type);
CREATE INDEX IF NOT EXISTS idx_profiles_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tax_country ON profiles(tax_country);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_user_id ON tax_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_jurisdiction ON tax_calculations(tax_jurisdiction);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_session ON tax_calculations(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_invoice ON tax_calculations(stripe_invoice_id);

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Payment events policies  
CREATE POLICY "Users can view their own payment events" ON payment_events
  FOR SELECT USING (auth.uid() = user_id);

-- Pricing plans policies (public read)
CREATE POLICY "Anyone can view active pricing plans" ON pricing_plans
  FOR SELECT USING (is_active = true);

-- Tax calculations policies
CREATE POLICY "Users can view their own tax calculations" ON tax_calculations
  FOR SELECT USING (auth.uid() = user_id);

-- Insert sample pricing plans (you'll need to update these with your actual Stripe price IDs)
INSERT INTO pricing_plans (stripe_price_id, stripe_product_id, name, description, amount, interval, features) VALUES
('price_starter_monthly', 'prod_starter', 'Starter Plan', 'Perfect for individuals getting started', 1900, 'month', '["5 AI Agents", "Basic Support", "Standard Features"]'),
('price_pro_monthly', 'prod_pro', 'Pro Plan', 'For professionals and small teams', 4900, 'month', '["Unlimited AI Agents", "Priority Support", "Advanced Features", "API Access"]'),
('price_enterprise_monthly', 'prod_enterprise', 'Enterprise Plan', 'For large organizations', 9900, 'month', '["Unlimited Everything", "White-label Option", "Custom Integrations", "Dedicated Support"]')
ON CONFLICT (stripe_price_id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE subscriptions IS 'Tracks active Stripe subscriptions for users';
COMMENT ON TABLE payment_events IS 'Audit trail for all payment-related events';
COMMENT ON TABLE pricing_plans IS 'Master table of available subscription plans';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN profiles.subscription_status IS 'Current subscription status (active, inactive, past_due, etc.)'; 