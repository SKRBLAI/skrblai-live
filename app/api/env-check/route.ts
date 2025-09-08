import { NextRequest, NextResponse } from 'next/server';

/**
 * Environment Check API - Returns redacted environment variable status
 * Used for sanity-checking configuration in development and production
 */
export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      checks: {
        // Supabase Configuration
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL 
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...` 
            : 'MISSING',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
            ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` 
            : 'MISSING',
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY 
            ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...` 
            : 'MISSING'
        },
        
        // OpenAI Configuration
        openai: {
          apiKey: process.env.OPENAI_API_KEY 
            ? `${process.env.OPENAI_API_KEY.substring(0, 7)}...` 
            : 'MISSING',
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini (default)'
        },
        
        // Optional Services
        optional: {
          n8nWebhook: process.env.N8N_WEBHOOK_URL 
            ? `${process.env.N8N_WEBHOOK_URL.substring(0, 20)}...` 
            : 'NOT_SET',
          encryptionSecret: process.env.ENCRYPTION_SECRET 
            ? `${process.env.ENCRYPTION_SECRET.length} chars` 
            : 'MISSING'
        },
        
        // Stripe Configuration
        stripe: {
          priceRookie: process.env.NEXT_PUBLIC_STRIPE_PRICE_ROOKIE || 'NOT_SET',
          pricePro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'NOT_SET',
          priceAllstar: process.env.NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR || 'NOT_SET',
          priceYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'NOT_SET'
        }
      }
    };

    // Calculate health score
    const criticalVars = [
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.OPENAI_API_KEY,
      process.env.ENCRYPTION_SECRET
    ];

    const criticalCount = criticalVars.filter(v => v && v.length > 0).length;
    const healthScore = Math.round((criticalCount / criticalVars.length) * 100);

    const response = {
      ...envCheck,
      health: {
        score: healthScore,
        status: healthScore >= 100 ? 'HEALTHY' : healthScore >= 80 ? 'WARNING' : 'CRITICAL',
        criticalVarsConfigured: `${criticalCount}/${criticalVars.length}`
      }
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Environment check failed:', error);
    
    return NextResponse.json({
      error: 'Environment check failed',
      timestamp: new Date().toISOString(),
      health: {
        score: 0,
        status: 'ERROR'
      }
    }, { status: 500 });
  }
}