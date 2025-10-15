"use client";

import Link from "next/link";
import React from "react";

export default function Hero() {
  return (
    <section className="w-full bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Scan-first AI agents that get real work done
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          Always-on agents tuned for growth, content, and operations. No flags, no
          legacy — just a clean v2 flow.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/v2/pricing"
            className="inline-flex items-center rounded-md bg-black px-5 py-3 text-white hover:bg-gray-800"
          >
            View pricing
          </Link>
          <button
            className="inline-flex items-center rounded-md border border-gray-300 px-5 py-3 text-gray-700 hover:bg-white/50"
            title="Percy preview stub"
            onClick={() => {
              // noop: stub to be wired when Percy is ready
              console.log("Percy stub clicked");
            }}
          >
            Try Percy (stub)
          </button>
        </div>
      </div>
    </section>
  );
}
