'use client';
import PercyProvider from '@/components/assistant/PercyProvider';
import PageLayout from '@/components/layout/PageLayout';
import PercyWidget from '@/components/percy/PercyWidget';

export default function HomePage() {
  return (
    <PercyProvider>
      <PageLayout>
        <PercyWidget />
      </PageLayout>
    </PercyProvider>
  );
}
