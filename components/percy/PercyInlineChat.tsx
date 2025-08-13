"use client";
import Image from "next/image";
import { useState } from "react";

type PercyInlineChatProps = {
  title?: string;           // defaults to "Chat with Percy"
  subtitle?: string;        // defaults to "Upload files, ask questions, or get AI assistance."
  onSubmit?: (payload: { prompt: string; files: File[] }) => Promise<void> | void;
  className?: string;
};

export default function PercyInlineChat({
  title = "Chat with Percy",
  subtitle = "Upload files, ask questions, or get AI assistance.",
  onSubmit,
  className = "",
}: PercyInlineChatProps) {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await onSubmit?.({ prompt, files });
      setPrompt("");
      setFiles([]);
    } finally {
      setBusy(false);
    }
  }

  function handleFiles(next: FileList | null) {
    if (!next) return;
    setFiles(Array.from(next));
  }

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      {/* Header block with Percy avatar */}
      <div className="flex items-center gap-4 mb-4">
        <Image
          src="/images/agents-percy-nobg-skrblai.webp"
          alt="Percy"
          width={56}
          height={56}
          className="rounded-full ring-2 ring-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,.25)]"
          priority
        />
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-white/70">{subtitle}</p>
        </div>
      </div>

      {/* Glass panel */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-cyan-400/30 bg-white/5 backdrop-blur-xl shadow-[0_0_35px_rgba(34,211,238,.2)] p-4 space-y-4"
      >
        {/* Prompt input */}
        <label className="block">
          <span className="sr-only">Describe your request</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your request (optional)…"
            className="w-full min-h-[84px] resize-y rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-cyan-300/60"
          />
        </label>

        {/* File drop / picker */}
        <label
          className="block rounded-xl border border-cyan-300/30 bg-gradient-to-b from-white/5 to-white/0 p-4 text-center cursor-pointer hover:border-cyan-300/60 transition"
        >
          <input type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          <div className="text-sm">
            <div className="mb-2">🚀 Drop or browse files</div>
            {files.length > 0 && (
              <div className="text-xs text-white/70">{files.length} file(s) attached</div>
            )}
          </div>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={busy || (!prompt && files.length === 0)}
            className="btn-solid-grad disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send to Percy"}
          </button>
        </div>
      </form>
    </div>
  );
}