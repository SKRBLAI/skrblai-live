import type { ReactNode } from 'react';
import PageLayout from '@/components/layout/PageLayout';

export default function ContactLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout>
      {children}
    </PageLayout>
  );
}
