import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, urls, source } = await req.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ ok: false, error: "NO_URLS" }, { status: 400 });
    }

    // Very light heuristic "quick wins" (instant feedback)
    const text = urls.join(" ").toLowerCase();
    const quickWins: string[] = [];
    
    if (!/https?:\/\//.test(text)) {
      quickWins.push("Add full https:// links so I can crawl instantly.");
    }
    
    if (!/instagram\.com|tiktok\.com|twitter\.com|x\.com|facebook\.com/.test(text)) {
      quickWins.push("Link at least 1 social profile for richer signals.");
    }
    
    if (!/about|contact|services|pricing/.test(text)) {
      quickWins.push("Include site sections (About/Contact/Services/Pricing) for deeper analysis.");
    }
    
    if (quickWins.length === 0) {
      quickWins.push("Nice—links look good. I'll run a deeper scan and send you a detailed plan.");
    }

    // Persist lead (best-effort; don't throw if not configured)
    try {
      const url = process.env.N8N_BUSINESS_SCAN_URL;
      if (url) {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "business_scan_started",
            email: email || null,
            urls,
            source: source || "home_hero",
            ua: req.headers.get("user-agent") || "",
            ts: Date.now(),
          }),
        });
      }
    } catch (e) {
      console.error("n8n_forward_failed", e);
    }

    return NextResponse.json({
      ok: true,
      quickWins,
      recommendedAgents: ["Percy (concierge)", "BrandAlexander", "Content Carltig", "Social Nino"],
      next: "/dashboard",
    });
  } catch (e) {
    console.error("scan_business_error", e);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
