import agentRegistry from "../../../lib/agents/agentRegistry";
import AgentServiceClient from "../../../components/legacy/services/services/[agent]/AgentServiceClient";
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
  const agent = agentRegistry.find(a => a.id === agentId && a.visible);
  return <AgentServiceClient agent={agent} params={resolvedParams} searchParams={searchParams} />;
}


