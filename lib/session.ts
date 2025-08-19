import { cookies } from "next/headers";

export async function getSessionInfo() {
  // Minimal stub; integrate with Supabase auth if present.
  const cookieStore = await cookies();
  const authed = !!cookieStore.get("sb-access-token") || !!cookieStore.get("auth-token");
  return { authed };
}
