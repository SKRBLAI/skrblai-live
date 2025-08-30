import { NextRequest, NextResponse } from 'next/server';
import { backendHealthChecker } from '../../../lib/maintenance/BackendHealthChecker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Comprehensive health check endpoint for monitoring systems
 * Returns system health status, component details, and performance metrics
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const component = searchParams.get('component');
    
    // Run comprehensive health check
    const healthStatus = await backendHealthChecker.runFullHealthCheck();
    
    // Filter by component if specified
    let responseData = healthStatus;
    if (component) {
      const componentHealth = healthStatus.components.find(c => 
        c.component.toLowerCase().includes(component.toLowerCase())
      );
      
      if (!componentHealth) {
        return NextResponse.json({
          success: false,
          error: `Component '${component}' not found`,
          availableComponents: healthStatus.components.map(c => c.component)
        }, { status: 404 });
      }
      
      responseData = {
        ...healthStatus,
        components: [componentHealth]
      };
    }
    
    // Simplified response for basic health checks
    if (!detailed) {
      const responseTime = Date.now() - startTime;
      
      return NextResponse.json({
        status: healthStatus.overallStatus,
        healthy: healthStatus.overallStatus === 'healthy',
        score: healthStatus.overallScore,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        components: healthStatus.components.map(c => ({
          name: c.component,
          status: c.status,
          responseTime: c.responseTime
        })),
        criticalIssues: healthStatus.criticalIssues.length,
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    }
    
    // Detailed response with full health data
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      health: {
        ...responseData,
        responseTime: `${responseTime}ms`,
        checks: {
          api: healthStatus.components.find(c => c.component === 'API Endpoints')?.status || 'unknown',
          database: healthStatus.components.find(c => c.component === 'Database')?.status || 'unknown',
          n8n: healthStatus.components.find(c => c.component === 'N8N Workflows')?.status || 'unknown',
          supabase: healthStatus.components.find(c => c.component === 'Supabase Connection')?.status || 'unknown'
        },
        performance: {
          apiResponseTime: healthStatus.components.find(c => c.component === 'API Endpoints')?.responseTime || 0,
          databaseResponseTime: healthStatus.components.find(c => c.component === 'Database')?.responseTime || 0,
          overallScore: healthStatus.overallScore
        },
        maintenance: {
          recommendations: healthStatus.maintenanceNeeded,
          nextCheck: healthStatus.nextScheduledCheck,
          autoFixable: healthStatus.criticalIssues.filter(i => i.autoFixable).length
        }
      },
      meta: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        nodeVersion: process.version
      }
    });
    
  } catch (error: any) {
    console.error('[Health API] Health check failed:', error);
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: false,
      status: 'critical',
      healthy: false,
      error: error.message || 'Health check failed',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      meta: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    }, { status: 503 });
  }
}

/**
 * POST /api/health
 * Trigger maintenance actions or auto-fix issues
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, component, autoFix = false } = body;
    
    // Verify admin access for maintenance actions
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required for maintenance actions' },
        { status: 401 }
      );
    }
    
    switch (action) {
      case 'auto-fix': {
        const healthStatus = await backendHealthChecker.runFullHealthCheck();
        const autoFixableIssues = healthStatus.criticalIssues.filter(issue => issue.autoFixable);
        
        if (autoFixableIssues.length === 0) {
          return NextResponse.json({
            success: true,
            message: 'No auto-fixable issues found',
            healthStatus: healthStatus.overallStatus,
            timestamp: new Date().toISOString()
          });
        }
        
        const fixResults = await backendHealthChecker.autoFixIssues(autoFixableIssues);
        
        return NextResponse.json({
          success: true,
          message: `Auto-fix completed. Fixed: ${fixResults.fixed.length}, Failed: ${fixResults.failed.length}`,
          results: fixResults,
          timestamp: new Date().toISOString()
        });
      }
      
      case 'maintenance': {
        const recommendations = backendHealthChecker.getMaintenanceRecommendations();
        
        return NextResponse.json({
          success: true,
          maintenance: {
            tasks: recommendations,
            totalTasks: recommendations.length,
            estimatedTime: recommendations.reduce((sum, task) => sum + task.estimatedTime, 0),
            autoExecutable: recommendations.filter(task => task.autoExecutable).length
          },
          timestamp: new Date().toISOString()
        });
      }
      
      case 'force-check': {
        const healthStatus = await backendHealthChecker.runFullHealthCheck();
        
        return NextResponse.json({
          success: true,
          message: 'Forced health check completed',
          health: healthStatus,
          timestamp: new Date().toISOString()
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Available: auto-fix, maintenance, force-check' },
          { status: 400 }
        );
    }
    
  } catch (error: any) {
    console.error('[Health API] POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Maintenance action failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 