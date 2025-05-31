import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { systemLog } from '@/utils/systemLog';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate limiting for analytics (more permissive than other APIs)
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 events per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    entry = { count: 1, reset: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip, entry);
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  if (checkRateLimit(ip)) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const event = await req.json();
    
    // Enrich with server-side metadata
    const enrichedEvent = {
      ...event,
      metadata: {
        ...event.metadata,
        ip,
        server_timestamp: new Date().toISOString()
      }
    };

    // Store in analytics table
    const { error } = await supabase
      .from('user_journey_events')
      .insert([enrichedEvent]);

    if (error) {
      await systemLog({ 
        type: 'error', 
        message: 'Failed to store analytics event', 
        meta: { error: error.message, event: enrichedEvent } 
      });
      return NextResponse.json({ success: false, error: 'Storage failed' }, { status: 500 });
    }

    // Optional: Send to external analytics services (Mixpanel, Amplitude, etc.)
    await Promise.allSettled([
      // sendToMixpanel(enrichedEvent),
      // sendToAmplitude(enrichedEvent),
      systemLog({ 
        type: 'info', 
        message: 'Analytics event recorded', 
        meta: { eventType: event.eventType, userId: event.userId, source: event.source } 
      })
    ]);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    await systemLog({ 
      type: 'error', 
      message: 'Analytics API error', 
      meta: { error: error.message, ip } 
    });
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

// Optional: GET endpoint for analytics dashboard
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin access
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Return analytics summary
    const { data: events, error } = await supabase
      .from('user_journey_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (error) {
      throw error;
    }

    // Calculate basic metrics
    const metrics = calculateAnalyticsMetrics(events || []);

    return NextResponse.json({ events, metrics });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateAnalyticsMetrics(events: any[]) {
  const totalEvents = events.length;
  const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
  const eventTypes = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEvents,
    uniqueUsers,
    eventTypes,
    topSources: calculateTopSources(events),
    conversionRate: calculateConversionRate(events)
  };
}

function calculateTopSources(events: any[]) {
  return events.reduce((acc, event) => {
    acc[event.source] = (acc[event.source] || 0) + 1;
    return acc;
  }, {});
}

function calculateConversionRate(events: any[]) {
  const pageViews = events.filter(e => e.eventType === 'page_view').length;
  const conversions = events.filter(e => e.eventType === 'conversion').length;
  return pageViews > 0 ? (conversions / pageViews) * 100 : 0;
} 