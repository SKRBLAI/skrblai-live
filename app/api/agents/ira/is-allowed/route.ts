import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isAllowedIRA } from "@/lib/auth/isAllowedIRA";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  const email = session?.user?.email ?? null;
  return NextResponse.json({ allowed: isAllowedIRA(email) });
}
