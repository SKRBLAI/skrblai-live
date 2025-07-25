import { renderHook } from '@testing-library/react-hooks';
import { useAgentBackstory, useAgentBackstories } from '../../hooks/useAgentBackstory';
import { agentBackstories } from '../../lib/agents/agentBackstories';
import type { Agent } from '@/types/agent';

// Mock the agentBackstories module
jest.mock('@/lib/agents/agentBackstories', () => ({
  agentBackstories: {
    'percy': {
      superheroName: 'Percy the Cosmic Concierge',
      origin: 'Born from the convergence of quantum AI models',
      powers: ['Omniscient Knowledge Navigation', 'Intent Telepathy'],
      weakness: 'Chooses to not create content',
      catchphrase: 'Your wish is my command protocol!',
      nemesis: 'The Confusion Cloud',
      backstory: 'Percy was the first hero born in the SKRBL AI universe',
    },
    'branding': {
      superheroName: 'BrandAlexander the Identity Architect',
      origin: 'Emerged from the Creative Nebula',
      powers: ['Visual Identity Manifestation', 'Brand Voice Telepathy'],
      weakness: 'Struggles with minimalist designs',
      catchphrase: 'Your brand, your legacy, my masterpiece!',
      nemesis: 'The Generic Impersonator',
      backstory: 'BrandAlexander was forged in the Creative Nebula',
    }
  }
}));

describe('useAgentBackstory', () => {
  const mockAgent: Agent = {
    id: 'percy',
    name: 'Percy',
    description: 'AI Assistant',
    category: 'assistant',
    capabilities: [],
    visible: true,
    canConverse: true,
    recommendedHelpers: [],
    handoffTriggers: []
  };

  it('should return null for undefined agent', () => {
    const { result } = renderHook(() => useAgentBackstory(undefined as unknown as Agent));
    expect(result.current).toBeNull();
  });

  it('should return the agent with backstory data when given an agent object', () => {
    const { result } = renderHook(() => useAgentBackstory(mockAgent));
    
    expect(result.current).toEqual({
      ...mockAgent,
      ...agentBackstories['percy'],
      name: 'Percy', // Should preserve the original name
      description: 'AI Assistant', // Should preserve the original description
      capabilities: [] // Should preserve the original capabilities
    });
  });

  it('should return an agent object when given just an agent ID', () => {
    const { result } = renderHook(() => useAgentBackstory('percy'));
    
    expect(result.current).toEqual({
      id: 'percy',
      name: 'Percy the Cosmic Concierge',
      description: 'Percy was the first hero born in the SKRBL AI universe',
      category: '',
      capabilities: ['Omniscient Knowledge Navigation', 'Intent Telepathy'],
      visible: true,
      canConverse: false,
      recommendedHelpers: [],
      handoffTriggers: [],
      ...agentBackstories['percy']
    });
  });

  it('should handle agent IDs without hyphens', () => {
    const { result } = renderHook(() => useAgentBackstory('brandingAgent'));
    
    expect(result.current).toEqual(expect.objectContaining({
      id: 'brandingAgent',
      superheroName: 'BrandAlexander the Identity Architect'
    }));
  });

  it('should return the original agent if no backstory is found', () => {
    const noBackstoryAgent: Agent = {
      id: 'unknown-agent',
      name: 'Unknown',
      description: 'No backstory',
      category: 'misc',
      capabilities: [],
      visible: true,
      canConverse: false,
      recommendedHelpers: [],
      handoffTriggers: []
    };
    
    const { result } = renderHook(() => useAgentBackstory(noBackstoryAgent));
    expect(result.current).toEqual(noBackstoryAgent);
  });
});

describe('useAgentBackstories', () => {
  const mockAgents: Agent[] = [
    {
      id: 'percy',
      name: 'Percy',
      description: 'AI Assistant',
      category: 'assistant',
      capabilities: [],
      visible: true,
      canConverse: true,
      recommendedHelpers: [],
      handoffTriggers: []
    },
    {
      id: 'branding',
      name: 'Branding',
      description: 'Branding Assistant',
      category: 'branding',
      capabilities: [],
      visible: true,
      canConverse: true,
      recommendedHelpers: [],
      handoffTriggers: []
    }
  ];

  it('should return an empty array for undefined agents', () => {
    const { result } = renderHook(() => useAgentBackstories(undefined as unknown as Agent[]));
    expect(result.current).toEqual([]);
  });

  it('should return an array of agents with backstory data', () => {
    const { result } = renderHook(() => useAgentBackstories(mockAgents));
    
    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toEqual(expect.objectContaining({
      id: 'percy',
      superheroName: 'Percy the Cosmic Concierge'
    }));
    expect(result.current[1]).toEqual(expect.objectContaining({
      id: 'branding',
      superheroName: 'BrandAlexander the Identity Architect'
    }));
  });
}); 