'use client';
import React from 'react';
import { siteVersion } from '@/lib/config/featureFlags';
import { usePlatformDiag } from '@/lib/diag/usePlatformDiag';

export default function NewLayout({ children }: { children: React.ReactNode }) {
  const dev = process.env.NODE_ENV !== 'production';
  const { diag } = usePlatformDiag();

  return (
    <>
      {dev && (
        <div style={{position:'fixed',left:8,bottom:8,padding:'6px 10px',border:'1px solid #333',borderRadius:8,background:'#0b0f1a',color:'#bdf',fontSize:12,zIndex:9999}}>
          <span>DEV • {siteVersion()}</span>
          {diag?.ok === false && <span style={{marginLeft:8,color:'#faa'}}>diag:n/a</span>}
        </div>
      )}
      {children}
    </>
  );
}
