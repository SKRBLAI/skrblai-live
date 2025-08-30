import agentRegistry from "../../../lib/agents/agentRegistry";
import AgentServiceClient from "./AgentServiceClient"; // Import the new client component

export default async function AgentPage({ params }: { params: Promise<{ agent: string }> }) {
  const resolvedParams = await params;
  const { agent: agentId } = resolvedParams;
  const agent = agentRegistry.find(a => a.id === agentId && a.visible);
  // The notFound logic or a simplified version can be handled here or passed to client
  // For simplicity, we pass agent (which can be undefined) and params to the client component.
  // The client component will then handle the 'not found' display.

  return <AgentServiceClient agent={agent} params={resolvedParams} />;
}
