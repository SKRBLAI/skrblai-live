import { ReactNode } from 'react';

export const metadata = {
  title: "Sign In to SKRBL AI – Access Your AI Agents",
  description: "Sign in or create your SKRBL AI account to access AI-powered automation tools and agents.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 