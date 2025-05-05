import { ReactNode } from 'react';

export const metadata = {
  title: "About SKRBL AI – Our Story & Vision",
  description: "Learn about SKRBL AI's mission to empower entrepreneurs and creators with AI-powered automation tools.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 