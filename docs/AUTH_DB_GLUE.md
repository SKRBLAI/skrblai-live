# Auth & Database Glue Documentation

## Overview
This document explains how Clerk authentication integrates with Supabase database, including session token management and server-side user profile synchronization.

---

## 1. Architecture Overview

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Sign in with Clerk
       ▼
┌─────────────┐
│    Clerk    │
│   (Auth)    │
└──────┬──────┘
       │
       │ 2. Get session JWT
       ▼
┌─────────────┐
│  Next.js    │
│   Server    │
└──────┬──────┘
       │
       │ 3. Forward JWT to Supabase
       ▼
┌─────────────┐
│  Supabase   │
│ (Database)  │
└─────────────┘
```

**Key Components**:
- **Clerk**: Manages user authentication, sessions, and JWTs
- **Supabase**: Stores user profiles, application data with RLS policies
- **Next.js Server**: Bridges Clerk sessions with Supabase queries

---

## 2. Client-Side: Obtaining Session Token

### Using Clerk's `useAuth` Hook

```typescript
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

function useSupabaseClient() {
  const { getToken } = useAuth();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST!;

  // Create Supabase client with Clerk JWT
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: async () => {
        const token = await getToken({ template: 'supabase' });
        return token ? { Authorization: `Bearer ${token}` } : {};
      }
    }
  });

  return supabase;
}

// Usage in component
function MyComponent() {
  const supabase = useSupabaseClient();
  
  async function fetchData() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();
    
    if (error) console.error('Error fetching profile:', error);
    return data;
  }
  
  // ...
}
```

**Important Notes**:
- Use Clerk's `supabase` JWT template (configured in Clerk Dashboard)
- Token is automatically refreshed by Clerk
- RLS policies in Supabase validate the JWT

---

## 3. Server-Side: User Profile Upsert

### API Route Example (`app/api/profile/sync/route.ts`)

```typescript
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Get Clerk session
    const { userId, sessionClaims } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Create Supabase admin client (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST!,
      process.env.SUPABASE_SERVICE_ROLE_KEY_BOOST!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 3. Extract user data from Clerk
    const email = sessionClaims?.email as string;
    const displayName = sessionClaims?.name as string || 
                        sessionClaims?.firstName as string || 
                        'Anonymous';

    // 4. Upsert profile to Supabase
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          clerk_user_id: userId,
          email: email,
          display_name: displayName,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'clerk_user_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json(
        { error: 'Failed to sync profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: data });

  } catch (error) {
    console.error('Profile sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 4. Clerk JWT Template Configuration

### In Clerk Dashboard

1. Navigate to **JWT Templates** → **Create Template**
2. Name: `supabase`
3. Token Lifetime: `60` seconds (adjust as needed)
4. **Claims**:

```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "name": "{{user.first_name}} {{user.last_name}}",
  "role": "authenticated",
  "aud": "authenticated",
  "iss": "https://your-clerk-domain.clerk.accounts.dev"
}
```

5. **Signing Key**: Use Clerk's default signing key
6. Save template

### Supabase Configuration

In Supabase Dashboard → Authentication → Providers → Custom:

1. Enable **Custom JWT Provider**
2. **JWT Secret**: Add Clerk's public JWK endpoint
   - Format: `https://[your-clerk-domain].clerk.accounts.dev/.well-known/jwks.json`
3. **Expected JWT Claims**:
   - `aud`: `authenticated`
   - `iss`: `https://your-clerk-domain.clerk.accounts.dev`

---

## 5. Row Level Security (RLS) Policies

### Profiles Table RLS Example

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'sub' = clerk_user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'sub' = clerk_user_id)
WITH CHECK (auth.jwt() ->> 'sub' = clerk_user_id);

-- Policy: Service role can do anything (admin access)
CREATE POLICY "Service role has full access"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Policy Breakdown**:
- `auth.jwt()`: Extracts JWT claims from request
- `'sub'`: Clerk user ID from JWT
- `clerk_user_id`: Column in profiles table matching Clerk ID
- `service_role`: Supabase service role key (bypasses RLS)

---

## 6. Common Patterns

### Pattern 1: Client-Side Query with Auth

```typescript
// Client component
'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function UserProfile() {
  const { getToken, isSignedIn } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      if (!isSignedIn) return;

      const token = await getToken({ template: 'supabase' });
      
      const res = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      setProfile(data);
    }

    loadProfile();
  }, [isSignedIn, getToken]);

  return <div>{profile?.display_name}</div>;
}
```

### Pattern 2: Server-Side Query in API Route

```typescript
// app/api/profile/route.ts
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST!,
    process.env.SUPABASE_SERVICE_ROLE_KEY_BOOST!
  );

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  return Response.json(data);
}
```

### Pattern 3: Webhook-Based Profile Sync

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  const headerPayload = headers();
  const svixHeaders = {
    'svix-id': headerPayload.get('svix-id')!,
    'svix-timestamp': headerPayload.get('svix-timestamp')!,
    'svix-signature': headerPayload.get('svix-signature')!,
  };

  const payload = await req.json();
  const wh = new Webhook(WEBHOOK_SECRET);
  
  let evt;
  try {
    evt = wh.verify(JSON.stringify(payload), svixHeaders);
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { id, type, data } = evt;

  if (type === 'user.created' || type === 'user.updated') {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST!,
      process.env.SUPABASE_SERVICE_ROLE_KEY_BOOST!
    );

    await supabase.from('profiles').upsert({
      clerk_user_id: data.id,
      email: data.email_addresses[0]?.email_address,
      display_name: `${data.first_name} ${data.last_name}`.trim(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'clerk_user_id'
    });
  }

  return Response.json({ received: true });
}
```

---

## 7. Environment Variables Reference

### Required Variables

```bash
# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx  # Optional, for webhooks

# Supabase (Boost)
NEXT_PUBLIC_SUPABASE_URL_BOOST=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY_BOOST=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 8. Security Best Practices

1. **Never expose service role key to client**:
   - Use server-side API routes for admin operations
   - Client should only use anon key with RLS policies

2. **Validate JWTs properly**:
   - Configure Supabase to validate Clerk JWTs
   - Use Clerk's official JWK endpoint

3. **Use RLS policies**:
   - Always enable RLS on tables with user data
   - Test policies thoroughly in Supabase SQL editor

4. **Minimize token lifetime**:
   - Keep JWT lifetime short (60-300 seconds)
   - Clerk handles auto-refresh

5. **Audit database access**:
   - Log all profile upserts and critical operations
   - Monitor Supabase logs for suspicious activity

---

## 9. Troubleshooting

### Issue: "JWT expired" errors

**Solution**: Ensure Clerk is configured to auto-refresh tokens:
```typescript
// In useSupabaseClient hook
const token = await getToken({ template: 'supabase' });
// Token is automatically refreshed by Clerk
```

### Issue: RLS policy denies access

**Solution**: Check JWT claims match RLS policy:
```sql
-- Debug: View current JWT claims
SELECT auth.jwt();

-- Ensure clerk_user_id matches
SELECT clerk_user_id FROM profiles WHERE clerk_user_id = (auth.jwt() ->> 'sub');
```

### Issue: User profile not syncing

**Solution**: Implement webhook-based sync (Pattern 3) or call sync API on sign-in:
```typescript
// After Clerk sign-in
await fetch('/api/profile/sync', { method: 'POST' });
```

---

## 10. Additional Resources

- **Clerk Documentation**: https://clerk.com/docs
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Clerk + Supabase Integration**: https://clerk.com/docs/integrations/databases/supabase
- **JWT Debugging**: https://jwt.io

---

## Notes

- This is a **reference document** with code snippets only
- Do **NOT** implement these patterns without proper testing
- Always test in staging before production deployment
- Keep environment variables secure and never commit to version control
