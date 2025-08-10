import agentRegistry from "../../../lib/agents/agentRegistry";
import AgentServiceClient from "../../services/[agent]/AgentServiceClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { agent: string } }): Promise<Metadata> {
  const agentId = params.agent;
  return {
    alternates: {
      canonical: `https://skrblai.io/agents/${agentId}`,
    },
  };
}

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { agent: string };
  searchParams?: { track?: 'business' | 'sports' };
};

export default function AgentPage({ params }: PageProps) {
  const agent = agentRegistry.find(a => a.id === params.agent && a.visible);
  return <AgentServiceClient agent={agent} params={params} />;
}


