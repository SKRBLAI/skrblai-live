# Environment Variables Checklist

## Supabase Boost Configuration

### Required Variables
```bash
# Supabase Boost Project
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Site Configuration
```bash
# Site URL
NEXT_PUBLIC_SITE_URL=https://skrblai.io

# Debug Tools (server-only)
DEBUG_TOOLS=0
```

## Google OAuth Configuration

### Required Variables
```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Stripe Payment Links Configuration

### Required Variables
```bash
# Stripe Feature Flags
NEXT_PUBLIC_ENABLE_STRIPE=1
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=1

# Business Plan Payment Links
NEXT_PUBLIC_STRIPE_LINK_BIZ_STARTER=https://buy.stripe.com/your-link
NEXT_PUBLIC_STRIPE_LINK_BIZ_PRO=https://buy.stripe.com/your-link
NEXT_PUBLIC_STRIPE_LINK_BIZ_ELITE=https://buy.stripe.com/your-link

# Sports Plan Payment Links
NEXT_PUBLIC_STRIPE_LINK_SPORTS_STARTER=https://buy.stripe.com/your-link
NEXT_PUBLIC_STRIPE_LINK_SPORTS_PRO=https://buy.stripe.com/your-link
NEXT_PUBLIC_STRIPE_LINK_SPORTS_ELITE=https://buy.stripe.com/your-link
```

## Next.js Image Configuration

### Remote Patterns
```javascript
// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'skrblai.io',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
};
```

## Railway Deployment

### Environment Variables to Set
1. Copy all variables from above
2. Set in Railway dashboard
3. Verify with `/api/env-check` endpoint

### Verification Commands
```bash
# Check environment variables
curl https://skrblai.io/api/env-check

# Check feature flags
curl https://skrblai.io/api/_probe/flags

# Check Supabase connection
curl https://skrblai.io/api/_probe/supabase
```

## Security Notes

- All `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` is server-only
- `DEBUG_TOOLS` is server-only
- Never commit `.env` files to version control