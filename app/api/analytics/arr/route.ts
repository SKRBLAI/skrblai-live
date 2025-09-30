import { NextResponse } from "next/server";
import { calculateARR } from "@/lib/analytics/arr";

export async function GET() {
  try {
    const res = await calculateARR();
    const status = res.ok ? 200 : 503;
    return NextResponse.json(res, { status });
  } catch {
    return NextResponse.json({ ok: false, reason: "internal_error" }, { status: 503 });
  }
}