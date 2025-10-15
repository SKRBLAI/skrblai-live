"use client";

import React from "react";
import { getBrowserSupabase } from "@/lib/supabase";

export default function AuthForm() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);

  const supabase = getBrowserSupabase();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      setStatus("error");
      setError("Supabase not configured. Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY.");
      return;
    }
    if (!siteUrl) {
      setStatus("error");
      setError("NEXT_PUBLIC_SITE_URL is required.");
      return;
    }
    setStatus("loading");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${siteUrl}/v2/auth/callback`,
        },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Failed to send magic link");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="you@example.com"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending…" : "Send magic link"}
      </button>
      {status === "sent" && (
        <p className="text-sm text-green-700">Check your email for the sign-in link.</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
