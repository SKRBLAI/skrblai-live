import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const admin = getServerSupabaseAdmin();
    if (!admin) return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });

    try {
      const { data, error } = await admin.rpc("select_now");
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
      return NextResponse.json({ ok: true, data });
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e?.message || "rpc-exception" }, { status: 200 });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "init-error" }, { status: 500 });
  }
}
