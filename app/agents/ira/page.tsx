import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { isAllowedIRA } from "@/lib/auth/isAllowedIRA";
import AgentChat from "@/components/chat/AgentChat";

export default async function IraPage() {
  const session = await getSession();
  const email = session?.user?.email ?? null;
  if (!isAllowedIRA(email)) {
    redirect("/404");
  }
  return <AgentChat agentId="ira" />;
}
