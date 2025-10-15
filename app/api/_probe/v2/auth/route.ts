import { NextResponse } from "next/server";
import { getServerSupabaseAnon } from "@/lib/supabase";

export async function GET() {
  try {
    const client = getServerSupabaseAnon();
    if (!client) return NextResponse.json({ hasSession: false, error: "supabase-not-configured" }, { status: 503 });
    const { data, error } = await client.auth.getUser();
    if (error) return NextResponse.json({ hasSession: false, error: error.message });
    return NextResponse.json({ hasSession: !!data?.user });
  } catch (e: any) {
    return NextResponse.json({ hasSession: false, error: e?.message || "auth-error" }, { status: 200 });
  }
}
