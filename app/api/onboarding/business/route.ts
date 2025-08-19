import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface BusinessOnboardingPayload {
  email?: string;
  urls?: string[];
  goals: string[];
  industry?: string;
  teamSize?: string;
  revenueBand?: string;
  channels: string[];
  source: "home_business_wizard";
  ua?: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: BusinessOnboardingPayload = await req.json();
    
    // Add user agent for analytics
    payload.ua = req.headers.get("user-agent") || "";
    
    console.log("[Business Onboarding] Received payload:", {
      goals: payload.goals?.length,
      channels: payload.channels?.length,
      industry: payload.industry,
      source: payload.source
    });

    // Best-effort N8N webhook forward (don't fail UX if down)
    try {
      const n8nUrl = process.env.N8N_BUSINESS_ONBOARDING_URL;
      if (n8nUrl) {
        console.log("[Business Onboarding] Forwarding to N8N...");
        
        const n8nPayload = {
          event: "business_onboarding_completed",
          timestamp: Date.now(),
          ...payload
        };

        const response = await fetch(n8nUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "User-Agent": "SKRBL-AI-Business-Onboarding/1.0"
          },
          body: JSON.stringify(n8nPayload),
          // Don't wait too long for N8N
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          console.log("[Business Onboarding] N8N webhook successful");
        } else {
          console.warn("[Business Onboarding] N8N webhook failed:", response.status);
        }
      } else {
        console.log("[Business Onboarding] N8N URL not configured, skipping webhook");
      }
    } catch (error) {
      console.warn("[Business Onboarding] N8N webhook error (non-blocking):", error);
      // Don't throw - this is best-effort
    }

    // Optional Supabase storage (best-effort, don't add new dependencies)
    try {
      // Only attempt if we have existing Supabase setup
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseKey) {
        console.log("[Business Onboarding] Storing in Supabase...");
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { error } = await supabase
          .from("business_leads")
          .insert({
            email: payload.email,
            urls: payload.urls,
            goals: payload.goals,
            industry: payload.industry,
            team_size: payload.teamSize,
            revenue_band: payload.revenueBand,
            channels: payload.channels,
            source: payload.source,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.warn("[Business Onboarding] Supabase insert failed:", error);
        } else {
          console.log("[Business Onboarding] Supabase storage successful");
        }
      } else {
        console.log("[Business Onboarding] Supabase not configured, skipping storage");
      }
    } catch (error) {
      console.warn("[Business Onboarding] Supabase storage error (non-blocking):", error);
      // Don't throw - this is optional
    }

    // Always return success to maintain UX
    return NextResponse.json({
      ok: true,
      message: "Business onboarding data received successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[Business Onboarding] Request processing error:", error);
    
    // Even on error, try to maintain UX
    return NextResponse.json({
      ok: false,
      error: "Internal server error",
      message: "We received your information but encountered a processing issue. Your onboarding will continue normally."
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    service: "business-onboarding",
    status: "healthy",
    timestamp: new Date().toISOString(),
    n8n_configured: !!process.env.N8N_BUSINESS_ONBOARDING_URL,
    supabase_configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  });
}
