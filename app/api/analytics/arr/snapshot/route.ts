import { NextResponse } from "next/server";
import { calculateARR } from "@/lib/analytics/arr";
import { getServerSupabaseAdmin } from "@/lib/supabase";

export async function POST() {
  try {
    const res = await calculateARR();
    if (!res.ok) return NextResponse.json(res, { status: 503 });

    const supabase = getServerSupabaseAdmin();
    if (!supabase) return NextResponse.json({ ok: false, reason: "supabase_unavailable" }, { status: 503 });

    const { data, error } = await supabase
      .from("arr_snapshots")
      .insert({
        sports_arr: res.sportsARR,
        business_arr: res.businessARR,
        total_arr: res.totalARR,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, reason: "insert_failed" }, { status: 500 });
    return NextResponse.json({ ok: true, snapshot: data });
  } catch {
    return NextResponse.json({ ok: false, reason: "internal_error" }, { status: 503 });
  }
}