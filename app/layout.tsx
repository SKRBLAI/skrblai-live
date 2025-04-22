import React from 'react';
import type { ReactNode } from 'react';
import PageLayout from '@/components/layout/PageLayout';

export const metadata = {
  title: 'SKRBL AI',
  description: 'Your AI-powered writing assistant',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageLayout>
          {children}
        </PageLayout>
      </body>
    </html>
  );
}
