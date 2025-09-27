'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UnifiedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

export default function UnifiedCodeModal({ isOpen, onClose, source = 'hero' }: UnifiedCodeModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!code.trim()) {
      setError('Enter a code');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/codes/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), source })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.message || 'We couldn’t verify this code.');
        return;
      }
      if (json.kind === 'stripe_coupon') {
        try { (window as any).toast?.success?.('Discount applied'); } catch {}
      }
      if (json.nextUrl) {
        router.push(json.nextUrl);
        onClose();
      }
    } catch (err: any) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 p-6">
        <h3 className="text-xl font-bold text-white mb-2">Have a code?</h3>
        <p className="text-sm text-gray-300 mb-4">Enter your founder, heir, VIP/promo, or discount code.</p>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {error && <div className="text-sm text-red-400">{error}</div>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold disabled:opacity-60">
              {loading ? 'Checking…' : 'Apply Code'}
            </button>
          </div>
        </form>
        <div className="mt-3 text-sm text-gray-400">
          No code? <a href="/pricing" className="text-cyan-400 hover:text-cyan-300">See plans</a> or <a href="/sports" className="text-cyan-400 hover:text-cyan-300">try Curiosity free</a>.
        </div>
      </div>
    </div>
  );
}

