'use client';

import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

/**
 * Wraps children with ClerkProvider only when NEXT_PUBLIC_FF_CLERK=1
 * Otherwise renders children directly (legacy Supabase auth)
 */
export function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  const clerkEnabled = process.env.NEXT_PUBLIC_FF_CLERK === '1';

  if (!clerkEnabled) {
    // Feature flag OFF: Use legacy Supabase auth
    return <>{children}</>;
  }

  // Feature flag ON: Use Clerk auth
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#2dd4bf', // teal-400
          colorBackground: '#0b1220',
          colorText: '#ffffff',
          colorTextSecondary: '#94a3b8',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
