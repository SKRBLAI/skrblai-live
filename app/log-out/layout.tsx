import type { ReactNode } from 'react';
import PageLayout from '@/components/layout/PageLayout';

export default function LogoutLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout>
      {children}
    </PageLayout>
  );
}
