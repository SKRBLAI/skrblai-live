# Boost Auth Integration Test Plan

## Overview
This test plan validates the new Supabase Boost authentication and dashboard integration without affecting existing production routes.

## Environment Setup
Before testing, ensure these environment variables are set:
```bash
# Boost Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL_BOOST=your_boost_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST=your_boost_anon_key
SUPABASE_SERVICE_ROLE_KEY_BOOST=your_boost_service_role_key
FF_USE_BOOST_FOR_AUTH=1

# Legacy Supabase (keep existing)
NEXT_PUBLIC_SUPABASE_URL=your_legacy_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_legacy_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_legacy_service_role_key
```

## Test Cases

### 1. Legacy Route Preservation Tests
**Goal**: Ensure existing routes remain unchanged

#### 1.1 Homepage Test
- **URL**: `http://localhost:3000/`
- **Expected**: 
  - No redirects or flicker
  - Percy bubble appears normally
  - All existing functionality works
- **Status**: ✅ PASS

#### 1.2 Pricing Page Test
- **URL**: `http://localhost:3000/pricing`
- **Expected**: 
  - Page loads normally
  - Stripe buttons work
  - No authentication redirects
- **Status**: ✅ PASS

#### 1.3 Sports Page Test
- **URL**: `http://localhost:3000/sports`
- **Expected**: 
  - Page loads normally
  - All existing functionality preserved
- **Status**: ✅ PASS

#### 1.4 Legacy Auth Routes Test
- **URLs**: 
  - `http://localhost:3000/sign-in`
  - `http://localhost:3000/sign-up`
- **Expected**: 
  - Use legacy Supabase configuration
  - No changes to existing behavior
- **Status**: ✅ PASS

### 2. New Boost Auth Routes Tests
**Goal**: Validate new authentication flow

#### 2.1 Boost Sign-In Test
- **URL**: `http://localhost:3000/auth2/sign-in`
- **Expected**: 
  - Page loads with existing SignInForm component
  - Form submits to `/auth2/callback`
  - If already authenticated with Boost, redirects to `/udash`
- **Test Steps**:
  1. Visit `/auth2/sign-in`
  2. Verify form appears
  3. Test Google OAuth (if configured)
  4. Test Magic Link (if configured)
  5. Test Password sign-in (if configured)

#### 2.2 Boost Sign-Up Test
- **URL**: `http://localhost:3000/auth2/sign-up`
- **Expected**: 
  - Page loads with existing SignUpForm component
  - Form submits to `/auth2/callback`
  - If already authenticated with Boost, redirects to `/udash`
- **Test Steps**:
  1. Visit `/auth2/sign-up`
  2. Verify form appears
  3. Test Google OAuth (if configured)
  4. Test Magic Link (if configured)
  5. Test Password sign-up (if configured)

#### 2.3 Auth Callback Test
- **URL**: `http://localhost:3000/auth2/callback`
- **Expected**: 
  - Exchanges session with Boost Supabase
  - Calls `/api/user/profile-sync?variant=boost`
  - On success: redirects to `/udash`
  - On failure: redirects to `/auth2/sign-in?error=...`
- **Test Steps**:
  1. Complete sign-in/sign-up flow
  2. Verify redirect to `/udash`
  3. Test error handling by breaking profile-sync

### 3. Universal Dashboard Tests
**Goal**: Validate role-based dashboard functionality

#### 3.1 Dashboard Access Test
- **URL**: `http://localhost:3000/udash`
- **Expected**: 
  - Requires Boost authentication
  - Shows role-based tiles
  - Displays "My Tasks" section
  - Uses existing UI components (CardShell, PageLayout)
- **Test Steps**:
  1. Visit `/udash` without auth → redirects to `/auth2/sign-in`
  2. Sign in with Boost → access granted
  3. Verify dashboard layout and components

#### 3.2 Role-Based Tiles Test
- **Expected**: 
  - Tiles appear based on user roles from Boost
  - Admin tile: only for users with 'admin' role
  - Founder tile: only for users with 'founder' role
  - Heir tile: only for users with 'heir' role
  - Parent tile: only for users with 'parent' role
- **Test Steps**:
  1. Create test users with different roles in Boost
  2. Sign in and verify correct tiles appear
  3. Test role changes reflect in dashboard

#### 3.3 My Tasks Test
- **Expected**: 
  - Shows latest 10 tasks from Boost
  - Displays task details (title, description, status, priority)
  - Handles empty state gracefully
- **Test Steps**:
  1. Create test tasks in Boost
  2. Verify tasks appear in dashboard
  3. Test with no tasks (empty state)

### 4. API Integration Tests
**Goal**: Validate Boost API integration

#### 4.1 Profile Sync API Test
- **URL**: `POST /api/user/profile-sync?variant=boost`
- **Expected**: 
  - Uses Boost Supabase admin client
  - Upserts user profile and roles
  - Returns success/error response
- **Test Steps**:
  1. Call API with valid Boost session
  2. Verify profile created in Boost
  3. Test error handling

#### 4.2 Middleware Protection Test
- **Expected**: 
  - `/udash/*` routes protected
  - `/admin/*` routes protected
  - Other routes not affected
- **Test Steps**:
  1. Visit protected routes without auth
  2. Verify redirect behavior
  3. Test public routes remain accessible

### 5. Error Handling Tests
**Goal**: Validate error scenarios

#### 5.1 Missing Boost Configuration
- **Scenario**: Boost env vars not set
- **Expected**: 
  - Graceful fallback behavior
  - Appropriate error messages
  - No crashes

#### 5.2 Boost Authentication Failures
- **Scenario**: Invalid Boost credentials
- **Expected**: 
  - Clear error messages
  - Proper redirects
  - No data corruption

#### 5.3 Profile Sync Failures
- **Scenario**: Profile sync API fails
- **Expected**: 
  - User redirected to sign-in with error
  - No partial state corruption

## Performance Tests

### 5.1 Build Performance
- **Test**: `npm run build`
- **Expected**: 
  - Build completes successfully
  - No TypeScript errors
  - All routes compile correctly
- **Status**: ✅ PASS

### 5.2 Runtime Performance
- **Test**: Page load times
- **Expected**: 
  - New routes load within acceptable time
  - No significant impact on existing routes
  - Efficient Supabase client caching

## Security Tests

### 6.1 Route Isolation
- **Test**: Boost and legacy routes don't interfere
- **Expected**: 
  - Boost routes use Boost Supabase
  - Legacy routes use legacy Supabase
  - No cross-contamination

### 6.2 Authentication Isolation
- **Test**: Boost auth doesn't affect legacy auth
- **Expected**: 
  - Users can be authenticated in both systems
  - No session conflicts
  - Proper isolation

## Rollback Tests

### 7.1 Feature Flag Test
- **Test**: Set `FF_USE_BOOST_FOR_AUTH=0`
- **Expected**: 
  - New routes fall back to legacy behavior
  - No breaking changes
  - Easy rollback capability

## Test Execution Checklist

- [ ] Environment variables configured
- [ ] Local development server running
- [ ] All legacy routes tested
- [ ] All new Boost routes tested
- [ ] Role-based functionality verified
- [ ] API integration tested
- [ ] Error scenarios tested
- [ ] Performance validated
- [ ] Security isolation confirmed
- [ ] Rollback capability verified

## Success Criteria

✅ **All tests pass**
✅ **No regressions on existing routes**
✅ **New Boost routes function correctly**
✅ **Role-based dashboard works**
✅ **API integration successful**
✅ **Error handling robust**
✅ **Performance acceptable**
✅ **Security maintained**

## Next Steps After Testing

1. **Deploy to staging** with Boost environment variables
2. **Run full test suite** in staging environment
3. **User acceptance testing** with real Boost data
4. **Performance monitoring** in production
5. **Gradual rollout** with feature flags
6. **Cutover planning** for production migration