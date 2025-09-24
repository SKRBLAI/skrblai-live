import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ agent: string }> }): Promise<Metadata> {
  const agentId = (await params).agent;
  return {
    title: `${agentId} Agent Backstory - SKRBL AI`,
    description: `Learn about the backstory and powers of our ${agentId} AI agent`,
    alternates: {
      canonical: `https://skrblai.io/agents/${agentId}/backstory`,
    },
  };
}

type PageProps = {
  params: Promise<{ agent: string }>;
};

export default async function AgentBackstoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { agent: agentId } = resolvedParams;
  
  // Redirect to the main agent page with backstory view parameter
  // This allows the main page to handle the modal opening
  redirect(`/agents/${agentId}?view=backstory`);
}