"use client";
import React from "react";
import Spinner from "@/components/ui/Spinner";

type Provider = "google" | "linkedin" | "magic";

interface AuthProviderButtonProps {
  provider: Provider;
  loading?: boolean;
  onClick: () => void;
}

const PROVIDER_META: Record<Provider, { label: string; bg: string; text: string; hover: string; icon: React.ReactElement }> = {
  google: {
    label: "Continue with Google",
    bg: "bg-white",
    text: "text-gray-800",
    hover: "hover:bg-gray-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.6-5.6C34.8 6.5 29.7 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.3-.1-2.6-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C15 16 18.2 14 22 14c2.9 0 5.5 1.1 7.4 2.9l5.6-5.6C31.6 8.5 27.1 6 22 6 14.5 6 8 10.2 6.3 14.7z"/><path fill="#4CAF50" d="M22 44c5.2 0 9.8-2 13.2-5.3l-6-4.9C27.5 35.9 24.9 37 22 37c-5.3 0-9.7-3.4-11.3-8H4.1l-6.1 4.8C3.9 39.8 12 44 22 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3 5-5.4 6.5l6 4.9C39 35.2 44 30 44 24c0-1.3-.1-2.6-.4-3.5z"/>
      </svg>
    ),
  },
  linkedin: {
    label: "Continue with LinkedIn",
    bg: "bg-[#0077b5]",
    text: "text-white",
    hover: "hover:bg-[#00669c]",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" className="w-5 h-5 fill-current">
        <path d="M34,3v28c0,1.657-1.343,3-3,3H3C1.343,34,0,32.657,0,31V3C0,1.343,1.343,0,3,0h28C32.657,0,34,1.343,34,3z"/>
        <rect x="5" y="11" width="5" height="18" fill="#fff"/>
        <circle cx="7.5" cy="7.5" r="2.5" fill="#fff"/>
        <path d="M14 11h5v2.6c.7-1.3 2.4-2.6 5-2.6 5.3 0 6 3.5 6 8v10h-5v-9c0-2.1 0-4.9-3-4.9s-3.5 2.3-3.5 4.7v9.2h-5V11z" fill="#fff"/>
      </svg>
    ),
  },
  magic: {
    label: "Magic Link",
    bg: "bg-violet-600",
    text: "text-white",
    hover: "hover:bg-violet-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 2l1.546 4.764L18 8l-4.454 1.236L12 14l-1.546-4.764L6 8l4.454-1.236z"/>
      </svg>
    ),
  },
};

export default function AuthProviderButton({ provider, loading = false, onClick }: AuthProviderButtonProps) {
  const meta = PROVIDER_META[provider];
  return (
    <button
      type="button"
      onClick={loading ? undefined : onClick}
      disabled={loading}
      className={`w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md font-medium shadow transition-all duration-150 ${meta.bg} ${meta.text} ${meta.hover} ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {loading ? <Spinner size={20} className={meta.text} /> : meta.icon}
      <span className="text-sm sm:text-base">{meta.label}</span>
    </button>
  );
}
