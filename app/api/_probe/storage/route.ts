import { NextResponse } from 'next/server';
import { getServerSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Storage Bucket Probe
 * 
 * Checks existence and accessibility of expected Supabase Storage buckets.
 * Returns PRESENT/MISSING status for each bucket without exposing secrets.
 * 
 * GET /api/_probe/storage
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  
  try {
    const supabase = getServerSupabaseAdmin();
    
    if (!supabase) {
      return NextResponse.json({
        ok: false,
        timestamp,
        error: 'Supabase not configured',
        buckets: {},
        summary: {
          total: 0,
          present: 0,
          missing: 0,
          status: 'ERROR'
        }
      }, { status: 503 });
    }

    // Expected buckets based on code analysis
    const expectedBuckets = [
      {
        name: 'files',
        purpose: 'Generic file uploads',
        usedIn: 'lib/supabase/helpers.ts'
      },
      {
        name: 'public-manuscripts',
        purpose: 'Book publishing (component)',
        usedIn: 'components/book-publishing/PublishingAssistantPanel.tsx'
      },
      {
        name: 'manuscripts',
        purpose: 'Book publishing (dashboard)',
        usedIn: 'app/dashboard/book-publishing/page.tsx'
      }
    ];

    const results: Record<string, any> = {};
    let presentCount = 0;
    let missingCount = 0;

    // Check each bucket
    for (const bucket of expectedBuckets) {
      try {
        const { data, error } = await supabase.storage.getBucket(bucket.name);
        
        if (error || !data) {
          results[bucket.name] = {
            exists: false,
            public: null,
            accessible: false,
            error: error?.message || 'Bucket not found',
            purpose: bucket.purpose,
            usedIn: bucket.usedIn
          };
          missingCount++;
        } else {
          results[bucket.name] = {
            exists: true,
            public: data.public ?? false,
            accessible: true,
            purpose: bucket.purpose,
            usedIn: bucket.usedIn,
            id: data.id,
            name: data.name,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
          presentCount++;
        }
      } catch (checkError: any) {
        results[bucket.name] = {
          exists: false,
          public: null,
          accessible: false,
          error: checkError.message || 'Check failed',
          purpose: bucket.purpose,
          usedIn: bucket.usedIn
        };
        missingCount++;
      }
    }

    // Determine overall status
    let status: 'OK' | 'PARTIAL' | 'MISSING';
    if (presentCount === expectedBuckets.length) {
      status = 'OK';
    } else if (presentCount > 0) {
      status = 'PARTIAL';
    } else {
      status = 'MISSING';
    }

    // Compile creation instructions for missing buckets
    const missingBuckets = Object.entries(results)
      .filter(([_, info]) => !info.exists)
      .map(([name, _]) => name);

    const instructions = missingBuckets.length > 0 ? {
      cli: missingBuckets.map(name => `supabase storage create ${name} --public`),
      dashboard: [
        '1. Navigate to Storage in Supabase Dashboard',
        '2. Click "New Bucket"',
        `3. Create buckets: ${missingBuckets.join(', ')}`,
        '4. Enable "Public bucket" checkbox for each',
        '5. Set file size limit (e.g., 50MB)',
        '6. Save'
      ],
      sql: [
        '-- Run in SQL Editor:',
        ...missingBuckets.map(name => 
          `INSERT INTO storage.buckets (id, name, public) VALUES ('${name}', '${name}', true) ON CONFLICT (id) DO NOTHING;`
        )
      ]
    } : null;

    return NextResponse.json({
      ok: status === 'OK',
      timestamp,
      buckets: results,
      summary: {
        total: expectedBuckets.length,
        present: presentCount,
        missing: missingCount,
        status
      },
      ...(instructions && { instructions })
    }, { 
      status: status === 'OK' ? 200 : 206 // 206 Partial Content if some buckets missing
    });

  } catch (error: any) {
    console.error('[Storage Probe] Error:', error);
    
    return NextResponse.json({
      ok: false,
      timestamp,
      error: error.message || 'Probe failed',
      buckets: {},
      summary: {
        total: 0,
        present: 0,
        missing: 0,
        status: 'ERROR'
      }
    }, { status: 500 });
  }
}
