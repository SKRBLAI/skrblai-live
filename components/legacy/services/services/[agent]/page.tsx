import agentRegistry from "../../../../../lib/agents/agentRegistry";
import AgentServiceClient from "./AgentServiceClient"; // Import the new client component

export default async function AgentPage({ params }: { params: Promise<{ agent: string }> }) {
  const resolvedParams = await params;
  const { agent: agentId } = resolvedParams;
  const agent = agentRegistry.find(a => a.id === agentId && a.visible);
  
  // Serialize agent object to remove functions before passing to client component
  const safeAgent = agent ? {
    ...agent,
    runAgent: undefined, // Remove function to prevent serialization error
    config: agent.config ? {
      ...agent.config,
      capabilities: agent.config.capabilities || []
    } : undefined,
    capabilities: { ...agent.capabilities }
  } as any : undefined;

  return <AgentServiceClient agent={safeAgent} params={resolvedParams} />;
}
