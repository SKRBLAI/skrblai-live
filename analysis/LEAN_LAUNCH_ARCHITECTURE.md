# Lean Launch Architecture

## Overview
This document defines the simplified, revenue-ready architecture for SKRBL AI on a single Supabase project. The focus is on a minimal, functional product that can generate revenue immediately while maintaining clean growth paths.

## Target Routes (Minimal Set)

### Public Routes
- `/` - Marketing landing page + Percy bubble
- `/pricing` - Stripe Payment Links only
- `/sports` - Sports service + Payment Links
- `/sign-in` - Google OAuth only
- `/sign-up` - Google OAuth only
- `/auth/callback` - OAuth callback handler
- `/thanks` - Payment success page
- `/cancel` - Payment cancellation page

### Protected Routes
- `/dashboard` - Universal dashboard (single page)
- `/admin` - Admin panel (founders only)

### Legacy Redirects (301)
- `/dashboard/*` → `/dashboard` (consolidate all dashboard routes)
- `/agents/*` → `/dashboard` (consolidate agent pages)
- `/founder/*` → `/dashboard` (consolidate founder pages)
- `/vip/*` → `/dashboard` (consolidate VIP pages)

## Authentication Architecture

### SSR-Only Auth (No Client-Side Flicker)
```typescript
// middleware.ts - Simplified
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Host canonicalization
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.hostname = "skrblai.io";
    return NextResponse.redirect(url, 308);
  }
  
  // Legacy route redirects
  if (path.startsWith('/dashboard/') && path !== '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard', request.url), 301);
  }
  
  return NextResponse.next();
}
```

### Server-Side Auth Components
```typescript
// lib/auth/server-auth.ts
export async function getServerUser() {
  const supabase = getServerSupabaseAnon();
  if (!supabase) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  
  return user;
}

export async function requireServerUser() {
  const user = await getServerUser();
  if (!user) {
    redirect('/sign-in');
  }
  return user;
}

export async function getUserRoles(userId: string) {
  const supabase = getServerSupabaseAnon();
  if (!supabase) return [];
  
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
    
  return data?.map(r => r.role) || [];
}
```

### Auth Flow
1. **Sign-in/Sign-up**: Server components redirect to Google OAuth
2. **Callback**: Server component handles OAuth callback, creates profile, redirects to dashboard
3. **Dashboard**: Server component checks auth, renders appropriate content based on role
4. **No Client-Side Auth**: Remove all `useEffect` auth checks and client-side redirects

## Dashboard Architecture

### Single Universal Dashboard
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const user = await requireServerUser();
  const roles = await getUserRoles(user.id);
  
  return (
    <DashboardLayout user={user} roles={roles}>
      <UniversalDashboardTiles roles={roles} />
    </DashboardLayout>
  );
}
```

### Universal Tiles System
```typescript
// components/dashboard/UniversalDashboardTiles.tsx
export function UniversalDashboardTiles({ roles }: { roles: string[] }) {
  const tiles = [
    {
      id: 'business-scan',
      title: 'Business Scan',
      description: 'AI-powered business analysis',
      icon: 'scan',
      available: true,
      action: '/api/scan'
    },
    {
      id: 'sports-clip',
      title: 'Sports Clip Analysis',
      description: 'Upload 30s video for analysis',
      icon: 'video',
      available: true,
      action: '/sports'
    },
    {
      id: 'percy-chat',
      title: 'Percy Chat',
      description: 'AI assistant for business questions',
      icon: 'chat',
      available: true,
      action: '/api/agents/percy'
    }
  ];
  
  // Role-based tile visibility
  const visibleTiles = tiles.filter(tile => {
    if (tile.id === 'business-scan' && !roles.includes('vip')) return false;
    if (tile.id === 'sports-clip' && !roles.includes('vip')) return false;
    return tile.available;
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {visibleTiles.map(tile => (
        <DashboardTile key={tile.id} {...tile} />
      ))}
    </div>
  );
}
```

### Code Redemption System
```typescript
// components/dashboard/CodeRedemption.tsx
export function CodeRedemption() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleRedeem = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/codes/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      if (response.ok) {
        const { role } = await response.json();
        // Refresh page to show new role
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Redeem Invite Code</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter invite code"
          className="flex-1 px-3 py-2 bg-slate-700 rounded"
        />
        <button
          onClick={handleRedeem}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          {loading ? 'Redeeming...' : 'Redeem'}
        </button>
      </div>
    </div>
  );
}
```

## Payment Architecture

### Stripe Payment Links Only
```typescript
// lib/stripe/payment-links.ts
export const PAYMENT_LINKS = {
  // Business plans
  'biz-starter': process.env.NEXT_PUBLIC_STRIPE_LINK_BIZ_STARTER,
  'biz-pro': process.env.NEXT_PUBLIC_STRIPE_LINK_BIZ_PRO,
  'biz-elite': process.env.NEXT_PUBLIC_STRIPE_LINK_BIZ_ELITE,
  
  // Sports plans
  'sports-starter': process.env.NEXT_PUBLIC_STRIPE_LINK_SPORTS_STARTER,
  'sports-pro': process.env.NEXT_PUBLIC_STRIPE_LINK_SPORTS_PRO,
  'sports-elite': process.env.NEXT_PUBLIC_STRIPE_LINK_SPORTS_ELITE,
} as const;

export function getPaymentLink(sku: string): string | null {
  return PAYMENT_LINKS[sku as keyof typeof PAYMENT_LINKS] || null;
}

export function hasPaymentLink(sku: string): boolean {
  return !!getPaymentLink(sku);
}
```

### Payment Button Component
```typescript
// components/payments/PaymentButton.tsx
export function PaymentButton({ sku, children, className }: PaymentButtonProps) {
  const paymentLink = getPaymentLink(sku);
  
  if (!paymentLink) {
    return (
      <button disabled className={className}>
        Coming Soon
      </button>
    );
  }
  
  return (
    <a
      href={paymentLink}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
```

### Webhook Handler (Future)
```typescript
// app/api/stripe/webhook/route.ts
export async function POST(request: Request) {
  // Future: Handle Stripe webhooks for payment confirmation
  // For now, Payment Links handle this automatically
  return NextResponse.json({ received: true });
}
```

## Percy Architecture

### Single Chat Bubble
```typescript
// components/percy/PercyBubble.tsx
export function PercyBubble() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
      >
        <PercyIcon className="w-8 h-8 text-white" />
      </button>
      
      {isOpen && (
        <PercyModal onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
```

### Percy Chat API
```typescript
// app/api/agents/percy/route.ts
export async function POST(request: Request) {
  const { message, context } = await request.json();
  
  // Stream response
  const stream = new ReadableStream({
    start(controller) {
      // Simple streaming response
      const response = `Percy: ${message}`;
      controller.enqueue(new TextEncoder().encode(response));
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
    },
  });
}
```

### Task CTAs
```typescript
// components/dashboard/TaskCTA.tsx
export function TaskCTA({ task, onComplete }: TaskCTAProps) {
  const handleTask = async () => {
    // Call n8n webhook (or no-op for now)
    try {
      await fetch('/api/n8n/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, userId: user.id })
      });
    } catch (error) {
      console.log('N8N webhook failed, continuing...');
    }
    
    onComplete();
  };
  
  return (
    <button
      onClick={handleTask}
      className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
    >
      {task.title}
    </button>
  );
}
```

## Feature Flags (Minimal Set)

### Environment Variables
```bash
# Core functionality
NEXT_PUBLIC_ENABLE_STRIPE=1
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=1

# Debug tools (server-only)
DEBUG_TOOLS=0

# Site configuration
NEXT_PUBLIC_SITE_URL=https://skrblai.io
```

### Flag Implementation
```typescript
// lib/config/flags.ts
export const FEATURE_FLAGS = {
  ENABLE_STRIPE: process.env.NEXT_PUBLIC_ENABLE_STRIPE === '1',
  FF_STRIPE_FALLBACK_LINKS: process.env.NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS === '1',
  DEBUG_TOOLS: process.env.DEBUG_TOOLS === '1',
} as const;
```

## Performance Optimizations

### Lazy Loading
```typescript
// Lazy load heavy components
const PercyModal = lazy(() => import('./PercyModal'));
const DashboardTiles = lazy(() => import('./DashboardTiles'));
```

### Image Optimization
```typescript
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

### Asset Pruning
- Remove unused CSS files
- Remove unused JavaScript bundles
- Optimize images (WebP format)
- Remove unused components

## Growth Paths (Behind Interfaces)

### Stripe Sessions (Future)
```typescript
// Future: Replace Payment Links with Sessions
export function createCheckoutSession(priceId: string) {
  // Implementation for future Stripe Sessions
}
```

### AgentKit Integration (Future)
```typescript
// Future: Replace simple Percy with AgentKit
export function createAgentKitClient() {
  // Implementation for future AgentKit integration
}
```

### N8N Workflows (Future)
```typescript
// Future: Full N8N integration
export function triggerN8NWorkflow(workflowId: string, data: any) {
  // Implementation for future N8N integration
}
```

## Error Handling

### Global Error Boundary
```typescript
// app/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

### API Error Handling
```typescript
// lib/api/error-handler.ts
export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return { error: error.message };
  }
  
  return { error: 'An unexpected error occurred' };
}
```

## Security Considerations

### CSRF Protection
- All forms use CSRF tokens
- API routes validate origin headers

### Rate Limiting
- Implement rate limiting on API routes
- Use Redis for distributed rate limiting

### Input Validation
- All inputs validated with Zod schemas
- SQL injection prevention with parameterized queries

## Monitoring & Analytics

### Revenue Tracking
```typescript
// lib/analytics/revenue.ts
export function trackRevenueEvent(event: RevenueEvent) {
  // Track revenue events for analytics
  fetch('/api/analytics/revenue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
}
```

### User Analytics
```typescript
// lib/analytics/user.ts
export function trackUserEvent(event: UserEvent) {
  // Track user events for analytics
  fetch('/api/analytics/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
}
```

This architecture provides a clean, revenue-ready foundation that can be built upon incrementally while maintaining simplicity and performance.