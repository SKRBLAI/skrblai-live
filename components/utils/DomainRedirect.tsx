'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function DomainRedirect({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Check if we're on a vercel.app domain and not already on the primary domain
      if (hostname.includes('vercel.app') && !hostname.includes('skrblai.io')) {
        // Get the current URL and replace the hostname with the primary domain
        const primaryDomain = 'skrblai.io';
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : '';
        const search = window.location.search;
        const hash = window.location.hash;
        
        // Construct the new URL with the primary domain
        const newUrl = `${protocol}//${primaryDomain}${port}${pathname}${search}${hash}`;
        
        // Redirect to the primary domain
        window.location.href = newUrl;
      }
    }
  }, [pathname]);

  return <>{children}</>;
}
