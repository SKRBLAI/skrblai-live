import { NextResponse } from "next/server";
import { getServerSupabaseAnon } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const supabase = getServerSupabaseAnon();

    if (!supabase) {
      return NextResponse.redirect(new URL("/v2/auth/sign-in?error=supabase-not-configured", url.origin));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/v2/auth/sign-in?error=missing_code", url.origin));
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/v2/auth/sign-in?error=${encodeURIComponent(error.message)}`, url.origin));
    }

    return NextResponse.redirect(new URL("/v2/dashboard", url.origin));
  } catch (e: any) {
    return NextResponse.redirect("/v2/auth/sign-in?error=callback_exception" as any);
  }
}
