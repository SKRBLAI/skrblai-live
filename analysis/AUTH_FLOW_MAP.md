# Authentication Flow Map

## Pages/Components Involved

### Sign-up Flow
- **`app/(auth)/sign-up/page.tsx`**
  - Uses `getBrowserSupabase()` for client-side auth
  - Calls `supabase.auth.signUp()` with email/password
  - Redirects to `/auth/callback` on success
  - Handles email confirmation flow

### Sign-in Flow  
- **`app/(auth)/sign-in/page.tsx`**
  - Uses `getBrowserSupabase()` for client-side auth
  - Supports password, magic link, and Google OAuth
  - Redirects to `/auth/redirect` on success
  - Shows auth service status inline

### Auth Callback
- **`app/auth/callback/page.tsx`**
  - Server-side component using `getServerSupabaseAdmin()`
  - Handles OAuth code exchange with `exchangeCodeForSession()`
  - Gets user and role via `getUserAndRole()`
  - Redirects based on role or safe 'from' parameter

### Auth Redirect
- **`app/auth/redirect/page.tsx`**
  - Server-side component using `getOptionalServerSupabase()`
  - Gets user and role via `getUserAndRole()`
  - Routes to appropriate dashboard based on role

### Auth Context
- **`components/context/AuthContext.tsx`**
  - Client-side auth state management
  - Handles auth state changes via `onAuthStateChange`
  - Provides sign-in/sign-up/sign-out methods
  - Manages access levels and VIP status

## API Routes/Helpers Used

### Supabase Clients
- **`lib/supabase/client.ts`** - `getBrowserSupabase()`
  - Client-side Supabase client with anon key
  - Lazy initialization to prevent build-time crashes
  - Throws in production on missing env vars

- **`lib/supabase/server.ts`** - `getServerSupabaseAdmin()`, `getServerSupabaseAnon()`
  - Server-side clients with service role and anon key
  - Admin client bypasses RLS, anon client respects RLS
  - Lazy initialization with proper error handling

- **`lib/supabase/helpers.ts`** - Various helper functions
  - File upload, data saving, lead management
  - Uses `getSupabaseClient()` which tries browser first, falls back to server

### Auth Helpers
- **`lib/auth/roles.ts`** - `getUserAndRole()`, `routeForRole()`
  - Gets user from session and role from `user_roles` table
  - Maps roles to dashboard routes
  - Handles role priority: founder > heir > vip > parent > user

- **`lib/auth/getSession.ts`** - `getSession()`, `isAuthenticated()`
  - Server-side session helpers
  - Uses anon client to respect RLS

## Profile Creation Logic

### Expected Profile Insertion Points
1. **Auth Callback** (`app/auth/callback/page.tsx`)
   - No explicit profile creation found
   - Only handles auth code exchange and role-based routing

2. **Auth Context Sign-up** (`components/context/AuthContext.tsx`)
   - Calls `/api/auth/dashboard-signin` with mode 'signup'
   - This endpoint should handle profile creation

3. **Missing Profile Creation**
   - No direct profile insertion found in auth flow
   - No database triggers detected for automatic profile creation
   - This is likely the source of "Database error saving new user"

### Role/Limits Reading
- **`user_roles` table** - Primary role storage
  - Queried in `getUserAndRole()` via `supabase.from('user_roles').select('role').eq('userId', user.id)`
  - Used for dashboard routing and access control

- **Dashboard Access Check** (`components/context/AuthContext.tsx`)
  - Calls `/api/auth/dashboard-signin?checkAccess=true`
  - Sets access level, VIP status, and benefits

## Identified Issues

### 1. Missing Profile Creation
- No explicit profile creation in auth flow
- No database triggers for automatic profile creation
- Users may be authenticated but have no profile record

### 2. Inconsistent User ID References
- Some queries use `user_id` (UUID)
- Others use `userId` (text)
- This could cause RLS policy failures

### 3. No Server-side Profile Sync
- All profile operations appear to be client-side
- No server-side profile creation/upsert endpoint
- Could fail if client-side operations are blocked by RLS

### 4. Auth Service Dependencies
- Multiple components depend on Supabase being available
- Graceful degradation exists but may not be sufficient
- Build-time vs runtime env var issues possible

## Recommended Fixes

1. **Add Server-side Profile Sync**
   - Create `/api/user/profile-sync` endpoint
   - Use service role to bypass RLS for profile creation
   - Call from auth callback and sign-up success

2. **Standardize User ID References**
   - Ensure consistent use of `user_id` vs `userId`
   - Update RLS policies to match actual column names

3. **Add Profile Creation Triggers**
   - Database triggers for automatic profile creation
   - Fallback server-side profile sync

4. **Enhance Error Handling**
   - Better error messages for profile creation failures
   - Graceful degradation when profile creation fails