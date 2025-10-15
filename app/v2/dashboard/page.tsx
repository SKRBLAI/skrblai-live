import Link from "next/link";
import { getServerSupabaseAnon } from "@/lib/supabase";

export default async function V2DashboardPage() {
  const supabase = getServerSupabaseAnon();

  if (!supabase) {
    return (
      <main className="min-h-[50vh] grid place-items-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Auth not configured</h1>
          <p className="mt-2 text-gray-600">Missing Supabase env. Configure and retry.</p>
          <Link href="/v2/auth/sign-in" className="mt-4 inline-block underline">
            Go to sign-in
          </Link>
        </div>
      </main>
    );
  }

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    return (
      <main className="min-h-[50vh] grid place-items-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Please sign in</h1>
          <Link href="/v2/auth/sign-in" className="mt-4 inline-block underline">
            Go to sign-in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[50vh] bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold">Welcome, {user.email}</h1>
        <p className="mt-2 text-gray-600">This is your clean v2 dashboard.</p>
      </div>
    </main>
  );
}
