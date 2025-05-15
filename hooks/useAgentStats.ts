import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AgentStats } from '@/types/agent';
import { Database } from '@/types/supabase';

export function useAgentStats() {
  const [topAgents, setTopAgents] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTopAgents() {
      try {
        if (process.env.NODE_ENV === 'development') {
          // Mock data for development
          setTopAgents([
            { id: '1', name: 'Code Wizard', emoji: '🧙‍♂️', usageCount: 42 },
            { id: '2', name: 'Design Guru', emoji: '🎨', usageCount: 35 },
            { id: '3', name: 'Writing Pro', emoji: '✍️', usageCount: 28 }
          ]);
          return;
        }

        const { data, error } = await supabase
          .from('agent_usage_stats')
          .select('agent_id, agent_name, agent_emoji, usage_count')
          .order('usage_count', { ascending: false })
          .limit(3);

        if (error) throw error;

        setTopAgents(data.map((d: Database['public']['Tables']['agent_usage_stats']['Row']) => ({
          id: d.agent_id,
          name: d.agent_name,
          emoji: d.agent_emoji,
          usageCount: d.usage_count
        })));
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopAgents();
  }, []);

  return { topAgents, loading, error };
}
