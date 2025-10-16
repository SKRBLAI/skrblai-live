# Storage Bucket Expectations & Requirements

**Generated**: 2025-10-16  
**Purpose**: Document all Supabase Storage bucket assumptions in code

---

## Executive Summary

**Total Buckets Referenced in Code**: 3  
**Public Buckets**: 1 (`public-manuscripts`)  
**Private/Auth-Required Buckets**: 2 (`files`, `manuscripts`)  

---

## Bucket Inventory

### 1. Bucket: `files`

**Referenced In**: `lib/supabase/helpers.ts`  
**Lines**: 30-42  
**Access Type**: Public (uses `.getPublicUrl()`)  
**Purpose**: Generic file storage  

#### Code Reference
```typescript
export const uploadFileToStorage = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('files')  // ← Expects bucket named 'files'
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('files')
    .getPublicUrl(data.path);  // ← Assumes bucket is public

  return { success: true, url: urlData.publicUrl };
};
```

#### Expected Configuration
- **Bucket Name**: `files`
- **Public Access**: Yes (needs `getPublicUrl` to work)
- **RLS Policies**: Recommended:
  - INSERT: authenticated users can upload
  - SELECT: public can read
- **Example Object Paths**: 
  - `user-uploads/123abc.pdf`
  - `documents/proposal-456.docx`

---

### 2. Bucket: `public-manuscripts`

**Referenced In**: `components/book-publishing/PublishingAssistantPanel.tsx`  
**Lines**: 70-79  
**Access Type**: Public (name suggests, uses `.getPublicUrl()`)  
**Purpose**: Book publishing manuscript storage  

#### Code Reference
```typescript
// Line 70-72: Upload manuscript
const { data, error } = await supabase.storage
  .from('public-manuscripts')  // ← Expects bucket named 'public-manuscripts'
  .upload(fileName, file);

if (error) throw error;

// Line 77-79: Get public URL
const { data: urlData } = supabase.storage
  .from('public-manuscripts')
  .getPublicUrl(fileName);  // ← Assumes bucket is public

setState(prev => ({
  ...prev,
  uploadedFileUrl: urlData.publicUrl
}));
```

#### Expected Configuration
- **Bucket Name**: `public-manuscripts`
- **Public Access**: Yes (`.getPublicUrl()` used)
- **RLS Policies**: Recommended:
  - INSERT: authenticated users can upload
  - SELECT: public can read
- **Example Object Paths**: 
  - `a1b2c3d4e5.pdf`
  - `f6g7h8i9j0.docx`
  - `k1l2m3n4o5.txt`

---

### 3. Bucket: `manuscripts`

**Referenced In**: `app/dashboard/book-publishing/page.tsx`  
**Lines**: 64-73  
**Access Type**: Public (uses `.getPublicUrl()`)  
**Purpose**: Dashboard manuscript storage (slightly different from `public-manuscripts`)  

#### Code Reference
```typescript
// Line 64-66: Upload to 'manuscripts' bucket
const { data, error } = await supabase.storage
  .from('manuscripts')  // ← Expects bucket named 'manuscripts'
  .upload(fileName, file);

if (error) throw error;

// Line 70-73: Get public URL
const { data: urlData } = supabase.storage
  .from('manuscripts')
  .getPublicUrl(fileName);  // ← Assumes bucket is public

setState(prev => ({
  ...prev,
  uploadedFileUrl: urlData.publicUrl
}));
```

#### Expected Configuration
- **Bucket Name**: `manuscripts`
- **Public Access**: Yes (`.getPublicUrl()` used)
- **RLS Policies**: Recommended:
  - INSERT: authenticated users can upload
  - SELECT: public (or authenticated, depending on security model)
- **Example Object Paths**: 
  - `random-id-123.pdf`
  - `random-id-456.docx`

---

## Bucket Creation Scripts

### Option 1: Supabase CLI

```bash
# 1. Create 'files' bucket (public, for general uploads)
supabase storage create files --public

# 2. Create 'public-manuscripts' bucket (public, for book publishing)
supabase storage create public-manuscripts --public

# 3. Create 'manuscripts' bucket (public, for dashboard uploads)
supabase storage create manuscripts --public
```

### Option 2: Supabase Dashboard

1. Navigate to **Storage** in left sidebar
2. Click **"New Bucket"**
3. For each bucket:
   - **Name**: `files`, `public-manuscripts`, `manuscripts`
   - **Public bucket**: ✅ Check "Public bucket"
   - **File size limit**: 50 MB (or as needed)
   - **Allowed MIME types**: Leave empty (allow all) or specify:
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `text/plain`
4. Click **"Save"**

### Option 3: SQL (via Dashboard or Migration)

```sql
-- Create buckets via SQL
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('files', 'files', true),
  ('public-manuscripts', 'public-manuscripts', true),
  ('manuscripts', 'manuscripts', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for 'files' bucket
CREATE POLICY "Authenticated users can upload to files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'files');

CREATE POLICY "Public can read files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'files');

-- Set up RLS policies for 'public-manuscripts' bucket
CREATE POLICY "Authenticated users can upload manuscripts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'public-manuscripts');

CREATE POLICY "Public can read manuscripts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public-manuscripts');

-- Set up RLS policies for 'manuscripts' bucket
CREATE POLICY "Authenticated users can upload to manuscripts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'manuscripts');

CREATE POLICY "Public can read from manuscripts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'manuscripts');
```

---

## URL Assumptions

All code uses `.getPublicUrl()`, which means:

1. **Buckets MUST be public** (checkbox enabled in Supabase Dashboard)
2. **URLs returned are like**: `https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>`
3. **No signed URLs used** (code doesn't call `.createSignedUrl()`)

If buckets are **not public**, `.getPublicUrl()` will still return a URL, but:
- Files will return **403 Forbidden** when accessed
- Need to create RLS policies to allow public SELECT

---

## Code Paths That Assume Buckets Exist

### Path 1: Generic File Upload

**User Flow**: Any component calling `uploadFileToStorage(file, path)`  
**Failure If Bucket Missing**: 
```
Supabase error: Bucket not found: files
User sees: "Error uploading file"
```

**Files That Call This**:
- `lib/supabase/helpers.ts` (utility function)
- Any component importing `uploadFileToStorage`

---

### Path 2: Book Publishing Panel

**User Flow**: Components page → "Publishing Assistant" → Drop file → Upload  
**Failure If Bucket Missing**: 
```
Supabase error: Bucket not found: public-manuscripts
User sees: Upload progress bar stops, error message
```

**Files That Call This**:
- `components/book-publishing/PublishingAssistantPanel.tsx`

---

### Path 3: Dashboard Book Publishing

**User Flow**: Dashboard → "Book Publishing" → Upload manuscript  
**Failure If Bucket Missing**: 
```
Supabase error: Bucket not found: manuscripts
User sees: Upload error toast
```

**Files That Call This**:
- `app/dashboard/book-publishing/page.tsx`

---

## Probe Strategy

### Probe Endpoint: `/api/_probe/storage`

**Purpose**: Check that all expected buckets exist and are accessible  

**Response Format**:
```json
{
  "ok": true,
  "timestamp": "2025-10-16T12:34:56.789Z",
  "buckets": {
    "files": {
      "exists": true,
      "public": true,
      "accessible": true
    },
    "public-manuscripts": {
      "exists": true,
      "public": true,
      "accessible": true
    },
    "manuscripts": {
      "exists": false,
      "public": null,
      "accessible": false,
      "error": "Bucket not found"
    }
  },
  "summary": {
    "total": 3,
    "present": 2,
    "missing": 1,
    "status": "PARTIAL"
  }
}
```

**Implementation**: See `app/api/_probe/storage/route.ts`

---

## Guardrails & Fallbacks

### Option 1: Graceful Degradation (Recommended)

```typescript
export const uploadFileToStorage = async (file: File, path: string) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase client unavailable' };
    }

    const { data, error } = await supabase.storage
      .from('files')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) {
      // Check if bucket doesn't exist
      if (error.message?.includes('Bucket not found')) {
        console.error('[Storage] Bucket "files" not found. Create it in Supabase Dashboard.');
        return { 
          success: false, 
          error: 'Storage not configured. Contact support.',
          code: 'BUCKET_MISSING'
        };
      }
      throw error;
    }

    // ... rest of code
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error };
  }
};
```

### Option 2: Startup Check (Aggressive)

```typescript
// In app startup or middleware
import { getServerSupabaseAdmin } from '@/lib/supabase';

export async function checkStorageBuckets() {
  const supabase = getServerSupabaseAdmin();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const requiredBuckets = ['files', 'public-manuscripts', 'manuscripts'];
  const missing: string[] = [];

  for (const bucket of requiredBuckets) {
    const { data, error } = await supabase.storage.getBucket(bucket);
    if (error || !data) {
      missing.push(bucket);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Missing storage buckets: ${missing.join(', ')}`);
    console.error('   Create them via Supabase Dashboard → Storage → New Bucket');
    return { ok: false, missing };
  }

  console.log('✅ All storage buckets present');
  return { ok: true };
}
```

---

## Checklist for Deployment

Before deploying to production:

- [ ] Create `files` bucket (public: true)
- [ ] Create `public-manuscripts` bucket (public: true)
- [ ] Create `manuscripts` bucket (public: true)
- [ ] Test file upload to each bucket
- [ ] Verify `.getPublicUrl()` returns accessible URLs
- [ ] Run `/api/_probe/storage` to confirm all buckets PRESENT
- [ ] Set up RLS policies (if needed beyond public access)
- [ ] Configure bucket size limits (default 50MB is fine)
- [ ] Optional: Set up bucket lifecycle policies (auto-delete old files)

---

## Consolidation Recommendation

**Observation**: Two buckets serve similar purposes:
- `public-manuscripts` (used by component)
- `manuscripts` (used by dashboard page)

**Recommendation**: Consider consolidating into one bucket:
- Name: `manuscripts` (shorter, clearer)
- Public: true
- Update `PublishingAssistantPanel.tsx` to use `manuscripts` instead of `public-manuscripts`

**Benefit**: 
- Simpler mental model
- One less bucket to manage
- Consistent file organization

---

**End of Storage Expectations**
