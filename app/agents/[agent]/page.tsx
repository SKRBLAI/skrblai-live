import { redirect } from 'next/navigation';
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ agent: string }> }): Promise<Metadata> {
  const agentId = (await params).agent;
  return {
    alternates: {
      canonical: `https://skrblai.io/agents/${agentId}`,
    },
  };
}

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ agent: string }>;
  searchParams?: { 
    track?: 'business' | 'sports';
    view?: 'backstory' | 'chat';
  };
};

export default async function AgentPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const { agent: agentId } = resolvedParams;
  
  // Redirect to the backstory page as the default view
  redirect(`/agents/${agentId}/backstory`);
}


