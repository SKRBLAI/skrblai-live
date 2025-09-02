// Centralized agent route helper
export function routeForAgent(agent: { id: string } | string): string {
  const id = typeof agent === 'string' ? agent : agent.id;
  return `/agents/${id}`;
}
