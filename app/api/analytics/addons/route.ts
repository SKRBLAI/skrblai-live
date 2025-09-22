import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { withLogging } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleAddOnAnalytics(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';
    
    // Convert range to days
    const days = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[range] || 7;

    const supabase = createServerSupabaseClient();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get add-on related events
    const { data: events, error } = await supabase
      .from('user_journey_events')
      .select('*')
      .in('event_type', [
        'addOn.purchased',
        'addOn.viewed',
        'pricing.checkout.started'
      ])
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (error) {
      console.error('Add-on analytics error:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch add-on data' },
        { status: 500 }
      );
    }

    const eventsData = events || [];

    // Calculate metrics
    const purchasedEvents = eventsData.filter(e => e.event_type === 'addOn.purchased');
    const viewedEvents = eventsData.filter(e => e.event_type === 'addOn.viewed');
    const checkoutEvents = eventsData.filter(e => 
      e.event_type === 'pricing.checkout.started' && 
      e.metadata?.addons && 
      e.metadata.addons.length > 0
    );

    // Business vs Sports breakdown
    const business_addons = purchasedEvents
      .filter(e => e.vertical === 'business')
      .reduce((acc, event) => {
        const sku = event.metadata?.sku || 'unknown';
        acc[sku] = (acc[sku] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const sports_addons = purchasedEvents
      .filter(e => e.vertical === 'sports')
      .reduce((acc, event) => {
        const sku = event.metadata?.sku || 'unknown';
        acc[sku] = (acc[sku] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Calculate total revenue
    const total_revenue = purchasedEvents.reduce((total, event) => {
      return total + (event.metadata?.price || 0);
    }, 0);

    // Promo usage
    const promo_usage = purchasedEvents.filter(e => e.metadata?.promo_active === true).length;
    const promo_percentage = purchasedEvents.length > 0 ? (promo_usage / purchasedEvents.length) * 100 : 0;

    // Conversion funnel: Views → Checkouts → Purchases
    const total_views = viewedEvents.length;
    const total_checkouts = checkoutEvents.length;
    const total_purchases = purchasedEvents.length;

    const view_to_checkout_rate = total_views > 0 ? (total_checkouts / total_views) * 100 : 0;
    const checkout_to_purchase_rate = total_checkouts > 0 ? (total_purchases / total_checkouts) * 100 : 0;
    const overall_conversion_rate = total_views > 0 ? (total_purchases / total_views) * 100 : 0;

    // Daily breakdown
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = eventsData.filter(e => e.timestamp.startsWith(dateStr));
      const dayPurchases = dayEvents.filter(e => e.event_type === 'addOn.purchased');
      const dayRevenue = dayPurchases.reduce((sum, e) => sum + (e.metadata?.price || 0), 0);
      
      dailyData.push({
        date: dateStr,
        views: dayEvents.filter(e => e.event_type === 'addOn.viewed').length,
        checkouts: dayEvents.filter(e => e.event_type === 'pricing.checkout.started').length,
        purchases: dayPurchases.length,
        revenue: dayRevenue,
        business_purchases: dayPurchases.filter(e => e.vertical === 'business').length,
        sports_purchases: dayPurchases.filter(e => e.vertical === 'sports').length
      });
    }

    // Most popular add-ons
    const popularAddOns = purchasedEvents.reduce((acc, event) => {
      const sku = event.metadata?.sku || 'unknown';
      const vertical = event.vertical || 'unknown';
      const key = `${vertical}_${sku}`;
      
      if (!acc[key]) {
        acc[key] = {
          sku,
          vertical,
          purchases: 0,
          revenue: 0
        };
      }
      
      acc[key].purchases++;
      acc[key].revenue += event.metadata?.price || 0;
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by purchases
    const topAddOns = Object.values(popularAddOns)
      .sort((a: any, b: any) => b.purchases - a.purchases)
      .slice(0, 10);

    return NextResponse.json({
      ok: true,
      business_addons,
      sports_addons,
      total_revenue,
      promo_usage,
      promo_percentage,
      funnel: {
        total_views,
        total_checkouts,
        total_purchases,
        view_to_checkout_rate,
        checkout_to_purchase_rate,
        overall_conversion_rate
      },
      dailyData,
      topAddOns
    });

  } catch (error: any) {
    console.error('Add-on analytics error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withLogging(handleAddOnAnalytics);