import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';

// Initialize Supabase client
interface PerformanceMetric {
  timestamp: string;
  userId?: string;
  sessionId: string;
  deviceInfo: {
    userAgent: string;
    isMobile: boolean;
    screenSize: string;
    deviceMemory?: number;
    connection?: string;
    hardwareConcurrency?: number;
    platform: string;
  };
  performanceData: {
    // Core Web Vitals
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    fcp?: number; // First Contentful Paint
    ttfb?: number; // Time to First Byte
    
    // Custom metrics
    pageLoadTime?: number;
    resourceLoadTime?: number;
    memoryUsage?: number;
    javaScriptErrors: any[];
    
    // Navigation timing
    navigationTiming?: any;
    resourceTiming?: any[];
  };
  errorLogs?: any[];
  crashData?: {
    errorMessage: string;
    stack: string;
    componentStack?: string;
    timestamp: string;
    url: string;
    userAgent: string;
  };
}

interface CrashReport {
  timestamp: string;
  userId?: string;
  sessionId: string;
  errorType: 'javascript' | 'unhandled-rejection' | 'react-error' | 'network' | 'performance';
  errorMessage: string;
  errorStack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  deviceInfo: any;
  breadcrumbs?: any[];
  customData?: any;
}

export async function POST(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const {
      type, // 'performance' | 'crash' | 'error' | 'vitals'
      data
    } = await req.json();

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, data' },
        { status: 400 }
      );
    }

    // Enrich with server-side metadata
    const enrichedData = {
      ...data,
      serverTimestamp: new Date().toISOString(),
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      origin: req.headers.get('origin') || 'unknown'
    };

    let result;

    switch (type) {
      case 'performance':
        result = await handlePerformanceMetric(enrichedData);
        break;
      case 'crash':
      case 'error':
        result = await handleCrashReport(enrichedData);
        break;
      case 'vitals':
        result = await handleWebVitals(enrichedData);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid monitoring type' },
          { status: 400 }
        );
    }

    // Log critical issues immediately
    if (type === 'crash' || (type === 'performance' && data.performanceData?.memoryUsage > 100)) {
      await logCriticalIssue(type, enrichedData);
    }

    console.log(`[Mobile Performance] Logged ${type} event: ${data.sessionId}`);

    return NextResponse.json({
      success: true,
      message: `${type} monitoring data logged`,
      data: {
        id: result.id,
        type,
        timestamp: enrichedData.serverTimestamp
      }
    });

  } catch (error: any) {
    console.error('[Mobile Performance] Error logging event:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to log monitoring data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const timeframe = searchParams.get('timeframe') || '24h';
    const format = searchParams.get('format') || 'json'; // 'json' | 'summary' | 'dashboard'

    // Calculate time range
    const timeRanges = {
      '1h': new Date(Date.now() - 1 * 60 * 60 * 1000),
      '24h': new Date(Date.now() - 24 * 60 * 60 * 1000),
      '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };

    const since = timeRanges[timeframe as keyof typeof timeRanges] || timeRanges['24h'];

    if (format === 'dashboard') {
      const dashboard = await generatePerformanceDashboard(since, { sessionId, userId, type });
      return NextResponse.json({
        success: true,
        dashboard,
        timeframe,
        timestamp: new Date().toISOString()
      });
    }

    if (format === 'summary') {
      const summary = await generatePerformanceSummary(since, { sessionId, userId, type });
      return NextResponse.json({
        success: true,
        summary,
        timeframe,
        timestamp: new Date().toISOString()
      });
    }

    // Default: return raw data
    let query = supabase
      .from('mobile_performance_logs')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    if (sessionId) query = query.eq('session_id', sessionId);
    if (userId) query = query.eq('user_id', userId);
    if (type) query = query.eq('event_type', type);

    const { data: logs, error } = await query;

    if (error) {
      console.error('[Mobile Performance] Failed to fetch logs:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch performance data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: logs || [],
      count: logs?.length || 0,
      timeframe,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Mobile Performance] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get performance data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper Functions

async function handlePerformanceMetric(data: any) {
  const { error, data: result } = await supabase
    .from('mobile_performance_logs')
    .insert({
      event_type: 'performance',
      session_id: data.sessionId,
      user_id: data.userId,
      device_info: JSON.stringify(data.deviceInfo),
      performance_data: JSON.stringify(data.performanceData),
      error_logs: JSON.stringify(data.errorLogs || []),
      server_timestamp: data.serverTimestamp,
      ip_address: data.ipAddress,
      origin: data.origin,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function handleCrashReport(data: any) {
  const { error, data: result } = await supabase
    .from('mobile_crash_reports')
    .insert({
      session_id: data.sessionId,
      user_id: data.userId,
      error_type: data.errorType || 'javascript',
      error_message: data.errorMessage,
      error_stack: data.errorStack,
      component_stack: data.componentStack,
      url: data.url,
      user_agent: data.userAgent,
      device_info: JSON.stringify(data.deviceInfo || {}),
      breadcrumbs: JSON.stringify(data.breadcrumbs || []),
      custom_data: JSON.stringify(data.customData || {}),
      server_timestamp: data.serverTimestamp,
      ip_address: data.ipAddress,
      origin: data.origin,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function handleWebVitals(data: any) {
  const { error, data: result } = await supabase
    .from('web_vitals_logs')
    .insert({
      session_id: data.sessionId,
      user_id: data.userId,
      metric_name: data.metricName, // 'LCP', 'FID', 'CLS', etc.
      metric_value: data.metricValue,
      metric_rating: data.metricRating, // 'good', 'needs-improvement', 'poor'
      page_url: data.pageUrl,
      device_info: JSON.stringify(data.deviceInfo || {}),
      server_timestamp: data.serverTimestamp,
      ip_address: data.ipAddress,
      origin: data.origin,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function logCriticalIssue(type: string, data: any) {
  try {
    await supabase
      .from('critical_issues')
      .insert({
        issue_type: type,
        severity: type === 'crash' ? 'critical' : 'high',
        description: type === 'crash' ? data.errorMessage : 'High memory usage detected',
        session_id: data.sessionId,
        user_id: data.userId,
        device_info: JSON.stringify(data.deviceInfo || {}),
        raw_data: JSON.stringify(data),
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('[Mobile Performance] Failed to log critical issue:', error);
  }
}

async function generatePerformanceDashboard(since: Date, filters: any) {
  // Get performance metrics summary
  const { data: performanceData } = await supabase
    .from('mobile_performance_logs')
    .select('performance_data, device_info, created_at')
    .gte('created_at', since.toISOString());

  // Get crash reports summary
  const { data: crashData } = await supabase
    .from('mobile_crash_reports')
    .select('error_type, device_info, created_at')
    .gte('created_at', since.toISOString());

  // Get web vitals summary
  const { data: vitalsData } = await supabase
    .from('web_vitals_logs')
    .select('metric_name, metric_value, metric_rating, created_at')
    .gte('created_at', since.toISOString());

  return {
    overview: {
      totalSessions: performanceData?.length || 0,
      totalCrashes: crashData?.length || 0,
      crashRate: crashData?.length && performanceData?.length 
        ? ((crashData.length / performanceData.length) * 100).toFixed(2) + '%'
        : '0%',
      avgLoadTime: calculateAverageLoadTime(performanceData || []),
      vitalsScore: calculateVitalsScore(vitalsData || [])
    },
    trends: {
      hourly: generateHourlyTrends(performanceData || [], crashData || []),
      daily: generateDailyTrends(performanceData || [], crashData || [])
    },
    devices: analyzeDevicePerformance(performanceData || [], crashData || []),
    issues: await getTopIssues(since)
  };
}

async function generatePerformanceSummary(since: Date, filters: any) {
  const { data: recentIssues } = await supabase
    .from('critical_issues')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: performanceStats } = await supabase
    .from('mobile_performance_logs')
    .select('performance_data, device_info')
    .gte('created_at', since.toISOString());

  return {
    criticalIssues: recentIssues?.length || 0,
    avgMemoryUsage: calculateAverageMemoryUsage(performanceStats || []),
    slowLoadTimes: countSlowLoadTimes(performanceStats || []),
    mobileDeviceRatio: calculateMobileRatio(performanceStats || []),
    topErrors: await getTopErrors(since),
    recommendations: generatePerformanceRecommendations(performanceStats || [], recentIssues || [])
  };
}

// Utility functions for calculations
function calculateAverageLoadTime(data: any[]): string {
  if (!data?.length) return '0ms';
  
  const loadTimes = data
    .map(d => {
      try {
        const perf = JSON.parse(d.performance_data);
        return perf.pageLoadTime;
      } catch {
        return null;
      }
    })
    .filter(t => t && t > 0);

  if (!loadTimes.length) return '0ms';
  
  const avg = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
  return Math.round(avg) + 'ms';
}

function calculateVitalsScore(vitalsData: any[]): string {
  if (!vitalsData?.length) return 'N/A';
  
  const goodCount = vitalsData.filter(v => v.metric_rating === 'good').length;
  const score = (goodCount / vitalsData.length) * 100;
  
  return Math.round(score) + '%';
}

function generateHourlyTrends(performanceData: any[], crashData: any[]) {
  // Implementation for hourly trend analysis
  return { performance: [], crashes: [] };
}

function generateDailyTrends(performanceData: any[], crashData: any[]) {
  // Implementation for daily trend analysis
  return { performance: [], crashes: [] };
}

function analyzeDevicePerformance(performanceData: any[], crashData: any[]) {
  // Implementation for device-specific performance analysis
  return { mobile: {}, desktop: {} };
}

async function getTopIssues(since: Date) {
  const { data } = await supabase
    .from('critical_issues')
    .select('issue_type, description, created_at')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  return data || [];
}

function calculateAverageMemoryUsage(data: any[]): string {
  if (!data?.length) return '0MB';
  
  const memoryUsages = data
    .map(d => {
      try {
        const perf = JSON.parse(d.performance_data);
        return perf.memoryUsage;
      } catch {
        return null;
      }
    })
    .filter(m => m && m > 0);

  if (!memoryUsages.length) return '0MB';
  
  const avg = memoryUsages.reduce((sum, mem) => sum + mem, 0) / memoryUsages.length;
  return Math.round(avg) + 'MB';
}

function countSlowLoadTimes(data: any[]): number {
  if (!data?.length) return 0;
  
  return data.filter(d => {
    try {
      const perf = JSON.parse(d.performance_data);
      return perf.pageLoadTime > 3000; // >3 seconds
    } catch {
      return false;
    }
  }).length;
}

function calculateMobileRatio(data: any[]): string {
  if (!data?.length) return '0%';
  
  const mobileCount = data.filter(d => {
    try {
      const device = JSON.parse(d.device_info);
      return device.isMobile;
    } catch {
      return false;
    }
  }).length;

  const ratio = (mobileCount / data.length) * 100;
  return Math.round(ratio) + '%';
}

async function getTopErrors(since: Date) {
  const { data } = await supabase
    .from('mobile_crash_reports')
    .select('error_message, error_type, created_at')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  return data || [];
}

function generatePerformanceRecommendations(performanceStats: any[], criticalIssues: any[]): string[] {
  const recommendations = [];
  
  if (criticalIssues?.length > 5) {
    recommendations.push('High crash rate detected - investigate error patterns');
  }
  
  const slowLoads = countSlowLoadTimes(performanceStats);
  if (slowLoads > performanceStats.length * 0.2) {
    recommendations.push('20%+ of page loads are slow - optimize images and code splitting');
  }
  
  const avgMemory = parseFloat(calculateAverageMemoryUsage(performanceStats));
  if (avgMemory > 50) {
    recommendations.push('High memory usage detected - check for memory leaks');
  }
  
  return recommendations.length ? recommendations : ['Performance looks good! 🚀'];
} 