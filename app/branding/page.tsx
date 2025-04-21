'use client';

import { PercyProvider } from '@/contexts/PercyContext';
import BrandingPage from '@/components/branding/BrandingPage';

export default function BrandingPageWrapper() {
  return (
    <PercyProvider>
      <BrandingPage />
    </PercyProvider>
  );
}
