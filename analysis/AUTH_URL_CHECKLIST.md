# Auth URL Configuration Checklist

## Supabase Dashboard Settings

### 1. Site URL Configuration
- **Site URL:** `https://skrblai.io`
- **Additional Redirect URLs:**
  - `https://skrblai.io/auth/callback`
  - `http://localhost:3000/auth/callback` (for development)
  - `http://localhost:3000/dashboard` (for development)

### 2. Cookie Configuration
- **Cookie Domain:** `.skrblai.io` (note the leading dot)
- **SameSite:** `None` (required for cross-domain auth)
- **Secure:** `true` (required for HTTPS)
- **Implicit Flow:** `ON` (if relying on browser OAuth)

### 3. OAuth Provider Settings

#### Google OAuth
- **Authorized JavaScript origins:**
  - `https://skrblai.io`
  - `http://localhost:3000` (development)
- **Authorized redirect URIs:**
  - `https://auth.skrblai.io/auth/v1/callback` (if using custom auth domain)
  - `https://skrblai.io/auth/callback` (if using project URL)

### 4. Custom Auth Domain (Optional)
If using `auth.skrblai.io`:
- **Custom Auth Domain:** `auth.skrblai.io`
- **DNS CNAME:** Point `auth.skrblai.io` to your Supabase project
- **SSL Certificate:** Ensure valid SSL certificate

## Environment Variables Required

### Client-side (NEXT_PUBLIC_*)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://skrblai.io
```

### Server-side
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### OAuth (Optional)
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## Common Issues and Solutions

### 1. "Invalid redirect URL" Error
**Cause:** Redirect URL not configured in Supabase
**Fix:** Add the exact redirect URL to Supabase dashboard

### 2. "Cookie not set" Error
**Cause:** Cookie domain mismatch or SameSite issues
**Fix:** 
- Set cookie domain to `.skrblai.io`
- Ensure SameSite=None and Secure=true
- Check HTTPS is enabled

### 3. "OAuth provider error"
**Cause:** Google OAuth redirect URI mismatch
**Fix:** Update Google Console with correct redirect URI

### 4. "Custom auth domain not working"
**Cause:** DNS or SSL configuration issues
**Fix:**
- Verify DNS CNAME record
- Check SSL certificate validity
- Ensure custom domain is configured in Supabase

## Verification Steps

### 1. Test Basic Auth
```bash
curl -X GET https://skrblai.io/api/_probe/auth
```

### 2. Test Supabase Connection
```bash
curl -X GET https://skrblai.io/api/_probe/supabase
```

### 3. Test Profile Creation
```bash
curl -X POST https://skrblai.io/api/user/profile-sync
```

### 4. Check Cookie Settings
- Open browser dev tools
- Go to Application > Cookies
- Verify `sb-*` cookies are set with correct domain

## Development vs Production

### Development
- Use `http://localhost:3000` for all URLs
- Cookie domain can be `localhost`
- SameSite can be `Lax`

### Production
- Use `https://skrblai.io` for all URLs
- Cookie domain must be `.skrblai.io`
- SameSite must be `None`
- Secure must be `true`

## Troubleshooting Commands

### Check DNS Resolution
```bash
nslookup auth.skrblai.io
```

### Test SSL Certificate
```bash
openssl s_client -connect auth.skrblai.io:443 -servername auth.skrblai.io
```

### Verify Supabase Connection
```bash
curl -H "apikey: YOUR_ANON_KEY" https://your-project.supabase.co/rest/v1/
```