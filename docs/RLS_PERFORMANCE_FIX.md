# RLS Performance Fix Documentation

This document describes the solution for the Supabase database linter warnings related to Row Level Security (RLS) performance issues.

## Issues Addressed

### 1. Auth RLS Initialization Plan Warnings

**Problem**: RLS policies using `auth.uid()`, `auth.role()`, or `auth.jwt()` directly were being re-evaluated for each row, causing poor performance at scale.

**Affected Tables**:
- `profiles` (policies: "read own profile", "update own profile")
- `user_roles` (policy: "read own role")
- `agent_permissions` (policy: "read own agent permissions")
- `sports_intake` (policy: "owner read intake")
- `parent_profiles` (policies: "read own parent profile", "upsert own parent profile")
- `app_sessions` (policy: "select_own_sessions")
- `app_events` (policy: "select_own_events")
- `founder_codes` (policy: "service_role_all")

**Solution**: Wrapped auth functions with SELECT subqueries:
```sql
-- Before (inefficient)
auth.uid() = user_id

-- After (optimized)
(select auth.uid()) = user_id
```

### 2. Multiple Permissive Policies Warnings

**Problem**: Multiple permissive RLS policies for the same role and action were causing performance overhead as each policy must be executed for every relevant query.

**Affected Tables**:
- `founder_memberships`
- `founder_usage_logs`

**Solution**: Consolidated multiple policies into single policies using OR conditions:
```sql
-- Before (multiple policies)
CREATE POLICY "own_membership_select" ON founder_memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service_role_membership_all" ON founder_memberships FOR ALL USING (auth.role() = 'service_role');

-- After (consolidated)
CREATE POLICY "founder_memberships_select" ON founder_memberships
  FOR SELECT USING (
    (select auth.uid()) = user_id OR 
    (select auth.jwt() ->> 'role') = 'service_role'
  );
```

## How to Apply the Fix

### Step 1: Run the Migration

Apply the migration file to your Supabase database:

```bash
# If using Supabase CLI
supabase migration up

# Or run the SQL file directly in your database
psql -f supabase/migrations/20250927_fix_rls_performance_issues.sql
```

### Step 2: Verify the Fix

Run the test script to verify all policies are optimized:

```bash
psql -f scripts/test-rls-policies.sql
```

### Step 3: Check for Warnings

The verification script will show:
- Any remaining non-optimized policies
- Multiple permissive policies that still exist
- Summary of optimization status

## Expected Results

After applying the fix, you should see:

1. **Zero "Auth RLS Initialization Plan" warnings** in Supabase database linter
2. **Zero "Multiple Permissive Policies" warnings** for the affected tables
3. **Improved query performance** for tables with RLS policies
4. **Maintained security** - all existing access controls remain intact

## Performance Impact

### Before Optimization
- `auth.uid()` evaluated for each row in result set
- Multiple policies executed separately for same role/action
- Poor performance with large datasets

### After Optimization
- `auth.uid()` evaluated once per query and cached
- Single consolidated policy per role/action combination
- Significantly better performance at scale

## Monitoring

To monitor for future RLS performance issues:

1. **Regular Linter Checks**: Run Supabase database linter regularly
2. **Query Performance**: Monitor slow query logs for RLS-related performance issues
3. **Policy Audits**: Review new policies to ensure they follow optimization patterns

## Best Practices for New Policies

When creating new RLS policies:

1. **Always wrap auth functions**:
   ```sql
   -- Good
   (select auth.uid()) = user_id
   
   -- Bad
   auth.uid() = user_id
   ```

2. **Consolidate multiple conditions**:
   ```sql
   -- Good
   CREATE POLICY "table_select" ON table FOR SELECT USING (
     condition1 OR condition2 OR condition3
   );
   
   -- Bad
   CREATE POLICY "table_select_1" ON table FOR SELECT USING (condition1);
   CREATE POLICY "table_select_2" ON table FOR SELECT USING (condition2);
   CREATE POLICY "table_select_3" ON table FOR SELECT USING (condition3);
   ```

3. **Use specific policy names** that describe their purpose
4. **Test performance** with realistic data volumes

## Migration Safety

This migration is designed to be safe:

- Uses `DO $$ BEGIN ... END $$` blocks for error handling
- Drops and recreates policies atomically
- Maintains existing security semantics
- Includes rollback-friendly structure

## Rollback Plan

If issues arise, you can rollback by:

1. Reverting to previous migration state
2. Manually recreating the original policies
3. Using database backups if necessary

## Files Created

- `supabase/migrations/20250927_fix_rls_performance_issues.sql` - Main migration
- `scripts/test-rls-policies.sql` - Verification and testing script
- `docs/RLS_PERFORMANCE_FIX.md` - This documentation

## Support

If you encounter issues with this migration:

1. Check the verification script output
2. Review Supabase logs for policy errors
3. Test with a small dataset first
4. Contact your database administrator if needed

