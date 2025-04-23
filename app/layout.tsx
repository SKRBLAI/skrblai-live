import React from 'react';
import type { ReactNode } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import PercyProviderWrapper from '@/components/percy/ClientProviders';

export const metadata = {
  title: 'SKRBL AI',
  description: 'Your AI-powered writing assistant',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PercyProviderWrapper>
          <PageLayout>
            {children}
          </PageLayout>
        </PercyProviderWrapper>
      </body>
    </html>
  );
}
