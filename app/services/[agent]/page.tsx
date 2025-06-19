import agentRegistry from "@/lib/agents/agentRegistry";
import AgentServiceClient from "./AgentServiceClient"; // Import the new client component

export default function AgentPage({ params }: { params: { agent: string } }) {
  const agent = agentRegistry.find(a => a.id === params.agent && a.visible);
  // The notFound logic or a simplified version can be handled here or passed to client
  // For simplicity, we pass agent (which can be undefined) and params to the client component.
  // The client component will then handle the 'not found' display.

  return <AgentServiceClient agent={agent} params={params} />;
}
