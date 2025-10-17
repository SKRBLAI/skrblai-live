# RLS Policies Comparison

## Original Suggested Policies vs Minimal Implementation

### What We Kept
1. **profiles table policies** - Essential for user profile access
2. **user_roles table policies** - Required for role-based access control
3. **Basic CRUD operations** - SELECT, INSERT, UPDATE for profiles
4. **Owner-based access** - Users can only access their own data

### What We Changed

#### 1. Column References
**Original:** `id = auth.uid()`
**Minimal:** `user_id = auth.uid()`

**Reason:** The profiles table uses `user_id` as the foreign key to `auth.users(id)`, not `id` as the primary key.

#### 2. Table Scope
**Original:** Included `subscriptions`, `payment_events`, `skillsmith_orders`
**Minimal:** Only `profiles` and `user_roles`

**Reason:** Focus on core auth tables first. Payment and subscription tables can be added later if needed.

#### 3. Policy Names
**Original:** `profiles_read_own`, `profiles_update_own`
**Minimal:** `profiles_select_owner`, `profiles_update_owner`

**Reason:** More descriptive names that match Supabase conventions.

#### 4. Idempotent Creation
**Original:** Direct `CREATE POLICY` statements
**Minimal:** `DO $$ BEGIN IF NOT EXISTS` blocks

**Reason:** Makes the SQL safe to run multiple times without errors.

### What We Added

#### 1. User Roles Table
- **Policy:** `user_roles_select_owner`
- **Purpose:** Allow users to read their own role assignments
- **Note:** No INSERT/UPDATE policies - roles are managed server-side

#### 2. Performance Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
```

#### 3. Policy Verification
```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'user_roles')
ORDER BY tablename, policyname;
```

#### 4. Policy Comments
- Added descriptive comments for each policy
- Helps with documentation and maintenance

### Security Considerations

#### 1. Principle of Least Privilege
- Users can only access their own data
- No cross-user data access
- Server-side operations use service role

#### 2. RLS Enforcement
- All policies use `auth.uid()` for user identification
- Policies are applied to `authenticated` users only
- Anonymous users have no access

#### 3. Server-side Bypass
- Admin operations use service role key
- Bypasses RLS for legitimate server operations
- Profile creation happens server-side

### Migration Notes

#### 1. Existing Data
- Policies are applied to existing data
- No data migration required
- Existing users will have access to their data

#### 2. Application Changes
- Client-side profile creation may need to be moved to server-side
- Use `/api/user/profile-sync` for profile creation
- Test thoroughly in development

#### 3. Rollback Plan
- Policies can be dropped if needed
- `DROP POLICY IF EXISTS` statements included
- No data loss risk

### Next Steps

1. **Test the policies** in development
2. **Run the SQL** in Supabase SQL Editor
3. **Verify access** using the probe endpoints
4. **Add additional tables** as needed (subscriptions, payment_events, etc.)
5. **Monitor performance** and add indexes if needed