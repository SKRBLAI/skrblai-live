import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT = 10;
const bucket = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of bucket.entries()) {
    if (now > value.resetAt) {
      bucket.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const cfConnectingIp = headersList.get('cf-connecting-ip'); // Cloudflare
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  if (realIp) {
    return realIp.trim();
  }
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  return 'unknown';
}

function checkRate(ip: string) {
  const now = Date.now();
  const rec = bucket.get(ip);
  
  if (!rec || now > rec.resetAt) {
    bucket.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true, remaining: RATE_LIMIT - 1, resetAt: now + RATE_WINDOW_MS };
  }
  
  if (rec.count >= RATE_LIMIT) {
    return { ok: false, remaining: 0, resetAt: rec.resetAt };
  }
  
  rec.count += 1;
  bucket.set(ip, rec);
  return { ok: true, remaining: RATE_LIMIT - rec.count, resetAt: rec.resetAt };
}

async function getUserSession(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.warn('Error getting user session:', error);
    return null;
  }
}

async function validateFileUrl(fileUrl: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const url = new URL(fileUrl);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Invalid URL protocol' };
    }
    
    // Check file extension
    const pathname = url.pathname.toLowerCase();
    const allowedExtensions = ['.mp4', '.mov', '.webm', '.avi'];
    const hasValidExtension = allowedExtensions.some(ext => pathname.endsWith(ext));
    
    if (!hasValidExtension) {
      return { valid: false, error: 'File must be a video (mp4, mov, webm, avi)' };
    }
    
    // Try HEAD request to check Content-Length and Content-Type
    try {
      const headResponse = await fetch(fileUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!headResponse.ok) {
        return { valid: false, error: 'File URL is not accessible' };
      }
      
      const contentLength = headResponse.headers.get('content-length');
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (size > maxSize) {
          return { valid: false, error: 'File size exceeds 100MB limit' };
        }
      }
      
      const contentType = headResponse.headers.get('content-type');
      if (contentType && !contentType.startsWith('video/')) {
        return { valid: false, error: 'File must be a video' };
      }
      
    } catch (fetchError) {
      console.warn('Could not validate file URL via HEAD request:', fetchError);
      // Don't fail validation if HEAD request fails - just warn
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export async function POST(req: NextRequest) {
  const ip = await getClientIp();
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || undefined;
  const rl = checkRate(ip);
  
  if (!rl.ok) {
    const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { 
        status: 429, 
        headers: { 
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rl.resetAt / 1000).toString()
        }
      }
    );
  }

  // Parse request body
  let payload: any;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' }, 
      { status: 400 }
    );
  }

  // Basic validation
  if (!payload || (!payload.input && !payload.fileUrl)) {
    return NextResponse.json(
      { error: 'Missing required field: input or fileUrl' }, 
      { status: 400 }
    );
  }

  // Validate file URL if provided
  if (payload.fileUrl) {
    const validation = await validateFileUrl(payload.fileUrl);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid file URL' },
        { status: 400 }
      );
    }
  }

  // Get user session (optional)
  const user = await getUserSession(req);
  
  // Prepare forwarded payload
  const forwardedBody = {
    kind: 'skillsmith_free_scan',
    meta: {
      ip: ip === 'unknown' ? undefined : ip.replace(/\d+$/, 'x'), // Light IP redaction
      guest: !user,
      user_id: user?.id || null,
      email: user?.email || null,
      source: payload.source || 'sports',
      user_agent: userAgent,
      timestamp: new Date().toISOString()
    },
    input: payload.input || null,
    fileUrl: payload.fileUrl || null,
    type: payload.type || 'free-scan'
  };

  // Check if webhook URL is configured
  const webhookUrl = process.env.N8N_WEBHOOK_FREE_SCAN;
  if (!webhookUrl) {
    console.error('N8N_WEBHOOK_FREE_SCAN environment variable not configured');
    return NextResponse.json(
      { error: 'Service temporarily unavailable' }, 
      { status: 503 }
    );
  }

  // Forward request to n8n
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SkillSmith-Proxy/1.0'
    };
    
    // Add authorization header if API key is configured
    if (process.env.N8N_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.N8N_API_KEY}`;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(forwardedBody),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    let responseData: any = {};
    try {
      responseData = await response.json();
    } catch (error) {
      // If n8n doesn't return JSON, create a simple response
      responseData = { ok: response.ok, status: response.status };
    }

    // Add rate limit headers to successful responses
    const responseHeaders: Record<string, string> = {
      'X-RateLimit-Limit': RATE_LIMIT.toString(),
      'X-RateLimit-Remaining': rl.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(rl.resetAt / 1000).toString()
    };

    return NextResponse.json(responseData, { 
      status: response.status,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Error forwarding request to n8n:', error);
    
    // Return appropriate error based on error type
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Unable to connect to analysis service' },
        { status: 503 }
      );
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}