import { ReactNode } from 'react';

export const metadata = {
  title: "SKRBL AI Publishing – AI Book Publishing Platform",
  description: "Transform your manuscript into a published book with AI-powered publishing tools.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PublishingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 