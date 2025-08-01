import { NextRequest, NextResponse } from 'next/server';
import { LiveMetrics } from '../../../../lib/config/services';

// Simulated live data - in production, this would come from your analytics DB
let liveMetrics: LiveMetrics = {
  totalUsers: 187,
  urgentSpots: 12,
  activeSolutions: 6,
  businessesTransformed: 47213,
  revenueGenerated: '$12.4M',
  averageROI: '312%'
};

// Simulate realistic metric changes
function updateLiveMetrics(): LiveMetrics {
  const now = Date.now();
  const hoursSinceStart = Math.floor((now - 1640995200000) / (1000 * 60 * 60)); // Hours since Jan 1, 2022
  
  // Realistic growth patterns
  const baseGrowth = Math.floor(hoursSinceStart * 0.1);
  const randomVariation = Math.floor(Math.random() * 5);
  
  liveMetrics = {
    totalUsers: Math.max(150, liveMetrics.totalUsers + randomVariation - 2),
    urgentSpots: Math.max(3, Math.min(25, liveMetrics.urgentSpots + (Math.random() > 0.7 ? -1 : 0))),
    activeSolutions: 6,
    businessesTransformed: 47213 + baseGrowth + Math.floor(Math.random() * 3),
    revenueGenerated: `$${(12.4 + (baseGrowth * 0.01) + (Math.random() * 0.1)).toFixed(1)}M`,
    averageROI: `${Math.max(280, 312 + Math.floor(Math.random() * 20) - 10)}%`
  };
  
  return liveMetrics;
}

export async function GET(request: NextRequest) {
  try {
    // Update metrics with realistic changes
    const currentMetrics = updateLiveMetrics();
    
    // Add timestamp for client-side caching
    const response = {
      ...currentMetrics,
      timestamp: Date.now(),
      updateInterval: 5000, // How often client should refresh
      status: 'live'
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('[API] Live stats error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch live stats',
        fallback: liveMetrics,
        timestamp: Date.now(),
        status: 'fallback'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Track user interaction for FOMO updates
    if (body.event === 'service_view') {
      liveMetrics.totalUsers = Math.min(liveMetrics.totalUsers + 1, 999);
    }
    
    if (body.event === 'urgent_request') {
      liveMetrics.urgentSpots = Math.max(1, liveMetrics.urgentSpots - 1);
    }
    
    return NextResponse.json({ 
      success: true, 
      metrics: liveMetrics,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[API] Live stats update error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update stats' }, 
      { status: 500 }
    );
  }
}