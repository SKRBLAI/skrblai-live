'use client';
import { useEffect, useState } from 'react';
import { getFlagRegistry, __devSetFlags } from '@/lib/config/featureFlags';

interface PlatformDiag {
  ok?: boolean;
  status?: any;
  flags?: any;
}

export function usePlatformDiag() {
  const [data, setData] = useState<PlatformDiag | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    // Prefer window global if present
    const win: any = typeof window !== 'undefined' ? (window as any) : undefined;
    const globalDiag = win?.__PLATFORM_DIAG__;
    if (globalDiag) {
      setData(globalDiag);
      if (globalDiag?.status) {
        __devSetFlags({
          FF_BOOST: Boolean(globalDiag.status?.boost && globalDiag.status?.boost !== 'error'),
          FF_CLERK: Boolean(globalDiag.status?.clerk && globalDiag.status?.clerk !== 'error'),
          FF_N8N_NOOP: Boolean(globalDiag.status?.n8n === 'noop'),
        });
      }
    }

    // Fallback to server endpoint if available
    fetch('/ops/diag')
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (json) {
          setData(json);
          if (json?.clerk || json?.boost || json?.n8n) {
            __devSetFlags({
              FF_BOOST: json.boost !== 'error',
              FF_CLERK: json.clerk !== 'error',
              FF_N8N_NOOP: json.n8n === 'noop',
            });
          }
        }
      })
      .catch(() => void 0);
  }, []);

  const registry = getFlagRegistry();
  return { diag: data, registry } as const;
}
