"use client";

import AuthForm from "@/components/v2/AuthForm";

export default function V2SignInPage() {
  return (
    <main className="min-h-[60vh] grid place-items-center bg-white">
      <div className="w-full max-w-md border border-gray-200 rounded-xl p-6 bg-white">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-2 text-gray-600 text-sm">
          We’ll email you a magic link. Ensure NEXT_PUBLIC_SITE_URL and Supabase envs are set.
        </p>
        <div className="mt-6">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
