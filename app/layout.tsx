'use client';

import React from 'react';
import type { ReactNode } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { PercyProvider } from '@/contexts/PercyContext';

export const metadata = {
  title: 'SKRBL AI',
  description: 'Your AI-powered writing assistant',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PercyProvider>
          <PageLayout>
            {children}
          </PageLayout>
        </PercyProvider>
      </body>
    </html>
  );
}
