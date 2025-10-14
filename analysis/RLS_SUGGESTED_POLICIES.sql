-- Suggested RLS policies for common tables encountered in webhook/checkout flows.
-- Review and adapt to your schema. Do not execute blindly.

-- profiles: allow users to read their own profile
CREATE POLICY profiles_read_own
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- profiles: allow users to update their own profile
CREATE POLICY profiles_update_own
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- subscriptions: allow users to read their own subscriptions
CREATE POLICY subscriptions_read_own
ON subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- payment_events: allow users to read their own payment events
CREATE POLICY payment_events_read_own
ON payment_events FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- skillsmith_orders: allow users to read their own orders if email matches
-- (Adjust this to your actual foreign keys; consider a secure join instead.)
CREATE POLICY skillsmith_orders_read_own
ON skillsmith_orders FOR SELECT
TO authenticated
USING (customer_email = auth.jwt() ->> 'email');
