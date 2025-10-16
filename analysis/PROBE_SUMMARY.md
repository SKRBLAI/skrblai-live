# System Probe Summary

**Generated**: 2025-10-16  
**Purpose**: Centralized documentation of all system health probe endpoints

---

## Available Probe Endpoints

### 1. Auth Probe

**Endpoint**: `GET /api/_probe/auth`  
**Purpose**: Verify Supabase Auth configuration and connectivity  
**Status**: ✅ Implemented  

**Response Format**:
```json
{
  "ok": boolean,
  "timestamp": "ISO-8601",
  "supabase": {
    "configured": boolean,
    "url": "string (redacted)",
    "anonKeyPresent": boolean,
    "serviceRoleKeyPresent": boolean
  },
  "auth": {
    "available": boolean,
    "canCreateClient": boolean
  }
}
```

**Usage**:
```bash
curl http://localhost:3000/api/_probe/auth
```

---

### 2. Supabase Probe

**Endpoint**: `GET /api/_probe/supabase`  
**Purpose**: Verify Supabase database connectivity and RLS policies  
**Status**: ✅ Implemented  

**Response Format**:
```json
{
  "ok": boolean,
  "timestamp": "ISO-8601",
  "supabase": {
    "configured": boolean,
    "url": "string (redacted)",
    "connectionTest": {
      "success": boolean,
      "responseTime": number
    }
  },
  "tables": {
    "profiles": { "accessible": boolean },
    "agent_analytics": { "accessible": boolean }
  }
}
```

**Usage**:
```bash
curl http://localhost:3000/api/_probe/supabase
```

---

### 3. Stripe Probe

**Endpoint**: `GET /api/_probe/stripe`  
**Purpose**: Verify Stripe integration and webhook configuration  
**Status**: ✅ Implemented  

**Response Format**:
```json
{
  "ok": boolean,
  "timestamp": "ISO-8601",
  "stripe": {
    "configured": boolean,
    "webhookSecretPresent": boolean,
    "publishableKeyPresent": boolean,
    "canInitialize": boolean
  },
  "environment": "test" | "live" | "unknown"
}
```

**Usage**:
```bash
curl http://localhost:3000/api/_probe/stripe
```

---

### 4. Storage Probe ⭐ NEW

**Endpoint**: `GET /api/_probe/storage`  
**Purpose**: Verify Supabase Storage bucket existence and accessibility  
**Status**: ✅ Implemented (2025-10-16)  

**Response Format**:
```json
{
  "ok": boolean,
  "timestamp": "ISO-8601",
  "buckets": {
    "files": {
      "exists": boolean,
      "public": boolean,
      "accessible": boolean,
      "purpose": "Generic file uploads",
      "usedIn": "lib/supabase/helpers.ts"
    },
    "public-manuscripts": {
      "exists": boolean,
      "public": boolean,
      "accessible": boolean,
      "purpose": "Book publishing (component)",
      "usedIn": "components/book-publishing/PublishingAssistantPanel.tsx"
    },
    "manuscripts": {
      "exists": boolean,
      "public": boolean,
      "accessible": boolean,
      "purpose": "Book publishing (dashboard)",
      "usedIn": "app/dashboard/book-publishing/page.tsx"
    }
  },
  "summary": {
    "total": 3,
    "present": number,
    "missing": number,
    "status": "OK" | "PARTIAL" | "MISSING" | "ERROR"
  },
  "instructions": {
    "cli": ["supabase storage create files --public"],
    "dashboard": ["Step-by-step instructions"],
    "sql": ["INSERT INTO storage.buckets ..."]
  }
}
```

**Usage**:
```bash
curl http://localhost:3000/api/_probe/storage
```

**Success Response Example**:
```json
{
  "ok": true,
  "timestamp": "2025-10-16T14:30:00.000Z",
  "buckets": {
    "files": {
      "exists": true,
      "public": true,
      "accessible": true,
      "purpose": "Generic file uploads",
      "usedIn": "lib/supabase/helpers.ts",
      "id": "files",
      "name": "files",
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-01T10:00:00.000Z"
    },
    "public-manuscripts": {
      "exists": true,
      "public": true,
      "accessible": true,
      "purpose": "Book publishing (component)",
      "usedIn": "components/book-publishing/PublishingAssistantPanel.tsx",
      "id": "public-manuscripts",
      "name": "public-manuscripts",
      "createdAt": "2025-10-01T10:05:00.000Z",
      "updatedAt": "2025-10-01T10:05:00.000Z"
    },
    "manuscripts": {
      "exists": true,
      "public": true,
      "accessible": true,
      "purpose": "Book publishing (dashboard)",
      "usedIn": "app/dashboard/book-publishing/page.tsx",
      "id": "manuscripts",
      "name": "manuscripts",
      "createdAt": "2025-10-01T10:10:00.000Z",
      "updatedAt": "2025-10-01T10:10:00.000Z"
    }
  },
  "summary": {
    "total": 3,
    "present": 3,
    "missing": 0,
    "status": "OK"
  }
}
```

**Failure Response Example** (bucket missing):
```json
{
  "ok": false,
  "timestamp": "2025-10-16T14:30:00.000Z",
  "buckets": {
    "files": {
      "exists": true,
      "public": true,
      "accessible": true,
      "purpose": "Generic file uploads",
      "usedIn": "lib/supabase/helpers.ts"
    },
    "public-manuscripts": {
      "exists": false,
      "public": null,
      "accessible": false,
      "error": "Bucket not found",
      "purpose": "Book publishing (component)",
      "usedIn": "components/book-publishing/PublishingAssistantPanel.tsx"
    },
    "manuscripts": {
      "exists": false,
      "public": null,
      "accessible": false,
      "error": "Bucket not found",
      "purpose": "Book publishing (dashboard)",
      "usedIn": "app/dashboard/book-publishing/page.tsx"
    }
  },
  "summary": {
    "total": 3,
    "present": 1,
    "missing": 2,
    "status": "PARTIAL"
  },
  "instructions": {
    "cli": [
      "supabase storage create public-manuscripts --public",
      "supabase storage create manuscripts --public"
    ],
    "dashboard": [
      "1. Navigate to Storage in Supabase Dashboard",
      "2. Click \"New Bucket\"",
      "3. Create buckets: public-manuscripts, manuscripts",
      "4. Enable \"Public bucket\" checkbox for each",
      "5. Set file size limit (e.g., 50MB)",
      "6. Save"
    ],
    "sql": [
      "-- Run in SQL Editor:",
      "INSERT INTO storage.buckets (id, name, public) VALUES ('public-manuscripts', 'public-manuscripts', true) ON CONFLICT (id) DO NOTHING;",
      "INSERT INTO storage.buckets (id, name, public) VALUES ('manuscripts', 'manuscripts', true) ON CONFLICT (id) DO NOTHING;"
    ]
  }
}
```

---

## Env Probe

**Endpoint**: `GET /api/_probe/env`  
**Purpose**: Verify environment variable configuration (no secrets exposed)  
**Status**: ✅ Implemented  

**Response Format**:
```json
{
  "ok": boolean,
  "timestamp": "ISO-8601",
  "categories": {
    "supabase": { "configured": boolean, "missing": [] },
    "stripe": { "configured": boolean, "missing": [] },
    "n8n": { "configured": boolean, "missing": [] },
    "auth": { "configured": boolean, "missing": [] }
  }
}
```

**Usage**:
```bash
curl http://localhost:3000/api/_probe/env
```

---

## Probe Best Practices

### When to Use Probes

1. **Pre-Deployment Checklist**: Run all probes before deploying to production
2. **Incident Response**: Check probe endpoints when errors occur
3. **Onboarding**: New developers can verify their local setup
4. **CI/CD Integration**: Add probe checks to deployment pipelines

### Security Considerations

- ✅ No secrets or API keys exposed in responses
- ✅ URLs are redacted (show only host)
- ✅ Keys shown as "present" boolean, not actual values
- ✅ Safe for public access (no auth required)
- ⚠️ Consider rate limiting in production

### Integration with CI/CD

```yaml
# .github/workflows/deploy.yml
- name: Verify System Health
  run: |
    curl -f http://localhost:3000/api/_probe/auth || exit 1
    curl -f http://localhost:3000/api/_probe/supabase || exit 1
    curl -f http://localhost:3000/api/_probe/stripe || exit 1
    curl -f http://localhost:3000/api/_probe/storage || exit 1
```

---

## Storage Probe Details

### Expected Buckets

| Bucket Name | Public? | Purpose | Used In |
|-------------|---------|---------|---------|
| `files` | ✅ Yes | Generic file uploads | `lib/supabase/helpers.ts` |
| `public-manuscripts` | ✅ Yes | Book publishing (component) | `components/book-publishing/PublishingAssistantPanel.tsx` |
| `manuscripts` | ✅ Yes | Book publishing (dashboard) | `app/dashboard/book-publishing/page.tsx` |

### Bucket Creation Commands

#### CLI (Recommended)
```bash
supabase storage create files --public
supabase storage create public-manuscripts --public
supabase storage create manuscripts --public
```

#### SQL (Alternative)
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('files', 'files', true),
  ('public-manuscripts', 'public-manuscripts', true),
  ('manuscripts', 'manuscripts', true)
ON CONFLICT (id) DO NOTHING;
```

#### Dashboard (Manual)
1. Navigate to **Storage** in Supabase Dashboard
2. Click **"New Bucket"**
3. For each bucket:
   - **Name**: Enter bucket name
   - **Public bucket**: ✅ Check this
   - **File size limit**: 50 MB (or as needed)
   - Click **"Save"**

### Troubleshooting

**Issue**: Bucket shows `exists: false`  
**Solution**: Create the bucket using one of the methods above

**Issue**: Bucket exists but `public: false`  
**Solution**: Edit bucket in Dashboard → Enable "Public bucket"

**Issue**: Upload fails with "Bucket not found"  
**Solution**: Run `/api/_probe/storage` to identify missing buckets, then create them

**Issue**: Upload succeeds but URL returns 403  
**Solution**: Check bucket RLS policies, ensure public SELECT is allowed

---

## Monitoring Dashboard

### Recommended Monitoring Setup

```typescript
// Example monitoring script
async function checkSystemHealth() {
  const probes = [
    '/api/_probe/auth',
    '/api/_probe/supabase',
    '/api/_probe/stripe',
    '/api/_probe/storage'
  ];

  const results = await Promise.all(
    probes.map(async (probe) => {
      const res = await fetch(`https://your-domain.com${probe}`);
      const data = await res.json();
      return { probe, ok: data.ok, status: res.status };
    })
  );

  const allHealthy = results.every(r => r.ok);
  
  if (!allHealthy) {
    // Alert: System health degraded
    console.error('Health check failures:', results.filter(r => !r.ok));
  }
  
  return { allHealthy, results };
}
```

---

## Summary

| Probe | Path | Status | Purpose |
|-------|------|--------|---------|
| Auth | `/api/_probe/auth` | ✅ | Verify Supabase Auth |
| Supabase | `/api/_probe/supabase` | ✅ | Test DB connectivity |
| Stripe | `/api/_probe/stripe` | ✅ | Check payment integration |
| Storage | `/api/_probe/storage` | ⭐ NEW | Verify storage buckets |
| Env | `/api/_probe/env` | ✅ | Check env vars |

---

**Last Updated**: 2025-10-16  
**Storage Probe Added**: 2025-10-16
