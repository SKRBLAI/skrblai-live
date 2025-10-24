# Post-Merge Checklist - Percy Phase 2 Setup

## 📍 Migration File Location

```
supabase/migrations/20251024_activity_feed_tables.sql
```

**File Size:** 7.9KB (194 lines)
**What it creates:** 3 tables + RLS policies + helper functions + Realtime publication

---

## ✅ Step-by-Step After Merge

### Step 1: Apply Database Migration

**Option A: Supabase Dashboard (Recommended)**
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy/paste contents of `supabase/migrations/20251024_activity_feed_tables.sql`
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. Verify success (should see "Success. No rows returned")

**Option B: Supabase CLI**
```bash
npx supabase db push --db-url "$DATABASE_URL"
```

### Step 2: Set Environment Variable

Add to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-api-03-your-key-here
```

### Step 3: Verify Tables Created

Run this in Supabase SQL Editor:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('agent_launches', 'n8n_executions', 'system_health_logs');
```

Should return 3 rows.

### Step 4: Test Activity Feed Endpoint

```bash
# Get your auth token from browser localStorage or cookie
# Then test SSE connection:

curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/activity/live-feed
```

Should see:
```
data: {"type":"connection","timestamp":"...","message":"Live activity feed connected"}
```

### Step 5: Test Streaming Chat

```bash
curl -N -X POST http://localhost:3000/api/percy/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Hello Percy!",
    "context": {"businessType": "ecommerce"}
  }'
```

Should see streaming response:
```
data: {"type":"text","content":"Hey"}
data: {"type":"text","content":" there"}
...
data: {"type":"done"}
```

### Step 6: Test Recommendations

```bash
curl -X POST http://localhost:3000/api/services/percy-recommend \
  -H "Content-Type: application/json" \
  -d '{
    "trigger": "revenue-stalling",
    "context": {
      "businessType": "ecommerce",
      "urgencyLevel": "high"
    },
    "requestType": "instant"
  }'
```

Should return JSON with recommendation object.

---

## 🔍 Troubleshooting

### Migration Fails
- Check if tables already exist: `SELECT * FROM agent_launches LIMIT 1;`
- If exists with different schema, drop and recreate: `DROP TABLE agent_launches CASCADE;`
- Then re-run migration

### Streaming Chat Returns 500
- Check `ANTHROPIC_API_KEY` is set correctly
- Verify key is valid: `echo $ANTHROPIC_API_KEY`
- Check API logs: Look for "[Percy Chat]" in server logs

### Activity Feed Not Connecting
- Verify Realtime is enabled in Supabase Dashboard → Settings → API
- Check RLS policies allow user access
- Check auth token is valid

### Recommendations Return Empty
- This is normal if trigger doesn't match any service
- Try different triggers: 'revenue-stalling', 'brand-confusion', 'manual-overwhelm'
- Check recommendation engine is working: Read `lib/percy/recommendationEngine.ts`

---

## 📦 What Gets Created by Migration

### Tables

**agent_launches**
- Tracks all agent executions
- Real-time updates via Supabase Realtime
- 13 columns including status, result, error_message

**n8n_executions**
- Tracks N8N workflow runs
- Links workflows to agents
- Supports chained workflows

**system_health_logs**
- Platform health monitoring
- Overall score and component statuses
- Critical issues tracking

### RLS Policies

- Users can only see their own launches
- Service role has full access
- Authenticated users can view system health

### Helper Functions

- `create_agent_launch()` - Quick launch creation
- `complete_agent_launch()` - Update launch status

### Realtime Publication

All 3 tables added to `supabase_realtime` publication for SSE streaming.

---

## 🚀 Quick Verification Checklist

After migration, verify:

- [ ] Tables exist in Supabase Dashboard → Table Editor
- [ ] Can query `agent_launches` without errors
- [ ] RLS policies are active (check "Policies" tab)
- [ ] Realtime is enabled for these tables
- [ ] `ANTHROPIC_API_KEY` environment variable is set
- [ ] Activity feed endpoint responds to curl
- [ ] Streaming chat endpoint responds to curl
- [ ] Recommendation endpoint returns results

---

## 📚 Reference Docs

After setup, read these for integration:

- **Full Integration Guide:** `docs/PERCY_PHASE2_INTEGRATION.md`
- **Activity Feed Setup:** `docs/ACTIVITY_FEED.md`
- **Windsurf Tasks:** `docs/WINDSURF_TASKS.md`

---

## 🆘 If Something Goes Wrong

1. Check server logs for error messages
2. Verify all 3 tables exist and have correct schema
3. Test each endpoint independently (activity feed, chat, recommendations)
4. Check auth token is valid and not expired
5. Verify environment variables are loaded (restart dev server)

---

## ✅ Success Indicators

You'll know it's working when:

✅ SSE endpoint streams connection event
✅ Launching an agent creates row in `agent_launches`
✅ Percy chat streams token-by-token responses
✅ Recommendations return with confidence scores
✅ No errors in server console

---

## Next Steps After Verification

1. Hand off UI tasks to Windsurf (see `docs/WINDSURF_TASKS.md`)
2. Integrate hooks into existing components
3. Add recommendation badges to Agent League
4. Build activity feed UI
5. Test in staging environment
6. Deploy to production

---

**Questions?** Check the docs or test with curl first to isolate issues.
