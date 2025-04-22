import type { ReactNode } from 'react';
import PageLayout from '@/components/layout/PageLayout';

export default function ContentAutomationLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout>
      {children}
    </PageLayout>
  );
}
