import { NextRequest, NextResponse } from 'next/server';
import { businessSolutions } from '../../../../lib/config/services';

interface DemoPreviewResponse {
  serviceId: string;
  demoContent: {
    title: string;
    preview: string;
    duration: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    transcript?: string[];
    keyPoints: string[];
  };
  metadata: {
    timestamp: number;
    cached: boolean;
  };
}

// Demo content cache for performance
const demoCache = new Map<string, DemoPreviewResponse>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function generateDemoPreview(serviceId: string): DemoPreviewResponse | null {
  const service = businessSolutions.find(s => s.id === serviceId);
  
  if (!service) {
    return null;
  }

  // Enhanced demo content based on service
  const enhancedDemo = {
    title: service.demoContent.title,
    preview: service.demoContent.preview,
    duration: service.demoContent.duration,
    videoUrl: service.videoDemoUrl,
    thumbnailUrl: `/images/demos/${serviceId}-thumbnail.webp`,
    transcript: generateTranscript(service.id),
    keyPoints: generateKeyPoints(service)
  };

  return {
    serviceId,
    demoContent: enhancedDemo,
    metadata: {
      timestamp: Date.now(),
      cached: false
    }
  };
}

function generateTranscript(serviceId: string): string[] {
  const transcripts: Record<string, string[]> = {
    'revenue-stalling': [
      "Watch as our AI scans this business and identifies 3 hidden revenue streams...",
      "In just 30 seconds, we've found $47,000 in missed opportunities.",
      "Now the automation kicks in - setting up the campaigns automatically.",
      "Result: 127% revenue increase in 14 days. This is the power of SKRBL AI."
    ],
    'brand-confusion': [
      "This brand was completely invisible. Let's fix that...",
      "Our AI analyzes the market position and competitors instantly.",
      "Watch the brand transformation happen in real-time.",
      "From confused to compelling in minutes. This is brand mastery."
    ],
    'manual-overwhelm': [
      "8 hours of daily busywork. Let's automate all of it...",
      "Our workflow engine maps every repetitive task.",
      "Now watch the magic - everything runs automatically.",
      "Result: 234% productivity increase. Time to focus on growth."
    ],
    'content-drought': [
      "No content ideas? Let's generate 30 days worth in 3 minutes...",
      "Our content engine analyzes your brand and audience.",
      "Watch unlimited, engaging content being created instantly.",
      "Never run out of content again. This is content mastery."
    ],
    'authority-absence': [
      "From unknown to industry expert in 30 days. Here's how...",
      "Our thought leadership strategy launches across all channels.",
      "Watch the authority-building content being published automatically.",
      "Result: Industry recognition and expert status achieved."
    ],
    'sales-chaos': [
      "Leads falling through cracks? Let's fix your sales machine...",
      "Our automation captures, nurtures, and converts every lead.",
      "Watch the chaos transform into a predictable revenue system.",
      "Result: 198% sales increase. No more lost opportunities."
    ]
  };

  return transcripts[serviceId] || [
    "Experience the power of AI automation...",
    "Watch your business transform in real-time...",
    "This is the future of business operations."
  ];
}

function generateKeyPoints(service: any): string[] {
  return [
    `${service.metrics.successRate}% success rate with real businesses`,
    `Average ${service.metrics.avgIncrease} improvement in ${service.metrics.timeToResults}`,
    `${service.agents.length} specialized AI agents working together`,
    `Live results from ${service.liveActivity.users} active users`,
    'Complete automation - no technical skills required'
  ];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const serviceId = searchParams.get('serviceId');
  const includeVideo = searchParams.get('includeVideo') === 'true';

  if (!serviceId) {
    return NextResponse.json(
      { error: 'serviceId parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Check cache first
    const cacheKey = `${serviceId}-${includeVideo}`;
    const cached = demoCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.metadata.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        ...cached,
        metadata: { ...cached.metadata, cached: true }
      });
    }

    // Generate fresh content
    const demoPreview = generateDemoPreview(serviceId);
    
    if (!demoPreview) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Remove video URL if not requested (for performance)
    if (!includeVideo) {
      delete demoPreview.demoContent.videoUrl;
    }

    // Cache the result
    demoCache.set(cacheKey, demoPreview);

    return NextResponse.json(demoPreview, {
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('[API] Demo preview error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate demo preview' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceIds, includeVideo = false } = body;

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json(
        { error: 'serviceIds array is required' },
        { status: 400 }
      );
    }

    if (serviceIds.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 services per request' },
        { status: 400 }
      );
    }

    const demos = serviceIds
      .map(serviceId => generateDemoPreview(serviceId))
      .filter(demo => demo !== null);

    // Remove video URLs if not requested
    if (!includeVideo) {
      demos.forEach(demo => {
        if (demo) delete demo.demoContent.videoUrl;
      });
    }

    return NextResponse.json({
      demos,
      count: demos.length,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[API] Bulk demo preview error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate demo previews' },
      { status: 500 }
    );
  }
}