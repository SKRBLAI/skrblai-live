import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentLeagueCard from '../../components/ui/AgentLeagueCard';
import { SafeAgent } from '../../types/agent';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
  useReducedMotion: () => false,
}));

// Mock agent utils
jest.mock('../../utils/agentUtils', () => ({
  getAgentImagePath: (agent: any) => `/images/agents/${agent.id}.png`,
  getAgentEmoji: (id: string) => '🤖',
}));

// Mock agent league
jest.mock('../../lib/agents/agentLeague', () => ({
  agentLeague: {
    getAgent: (id: string) => ({
      id,
      personality: {
        superheroName: `${id} Hero`,
        catchphrase: `${id} catchphrase`,
      },
      capabilities: [
        { category: 'Test Capability' },
        { category: 'Another Capability' },
      ],
      powers: ['Power 1', 'Power 2'],
      emoji: '🤖',
    }),
  },
}));

// Mock agent backstories
jest.mock('../../lib/agents/agentBackstories', () => ({
  agentBackstories: {
    testAgent: {
      superheroName: 'Test Hero',
      catchphrase: 'Test catchphrase',
    },
  },
}));

// Mock agent intelligence
jest.mock('../../lib/agents/agentIntelligence', () => ({
  agentIntelligenceEngine: {
    getAgentIntelligence: () => null,
  },
}));

// Mock routes
jest.mock('../../lib/agents/routes', () => ({
  routeForAgent: (id: string) => `/agents/${id}`,
}));

describe('AgentLeagueCard', () => {
  const mockAgent: SafeAgent = {
    id: 'testAgent',
    name: 'Test Agent',
    description: 'Test Description',
    category: 'Test Category',
    visible: true,
    capabilities: ['Test Capability'],
    canConverse: true,
    recommendedHelpers: [],
    handoffTriggers: [],
    imageSlug: 'testAgent',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders agent card with correct information', () => {
    render(<AgentLeagueCard agent={mockAgent} />);

    expect(screen.getByText('testAgent Hero')).toBeInTheDocument();
    expect(screen.getByText('"testAgent catchphrase"')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Launch Agent')).toBeInTheDocument();
  });

  it('navigates to chat tab when chat button is clicked', () => {
    render(<AgentLeagueCard agent={mockAgent} />);

    const chatButton = screen.getByText('Chat');
    fireEvent.click(chatButton);

    expect(mockPush).toHaveBeenCalledWith('/agents/testAgent?tab=chat');
  });

  it('navigates to backstory tab when info button is clicked', () => {
    render(<AgentLeagueCard agent={mockAgent} />);

    const infoButton = screen.getByText('Info');
    fireEvent.click(infoButton);

    expect(mockPush).toHaveBeenCalledWith('/agents/testAgent?tab=backstory');
  });

  it('navigates to launch tab when launch button is clicked', () => {
    render(<AgentLeagueCard agent={mockAgent} />);

    const launchButton = screen.getByText('Launch Agent');
    fireEvent.click(launchButton);

    expect(mockPush).toHaveBeenCalledWith('/agents/testAgent?tab=launch');
  });

  it('calls custom handlers when provided', () => {
    const mockOnChat = jest.fn();
    const mockOnInfo = jest.fn();
    const mockOnLaunch = jest.fn();

    render(
      <AgentLeagueCard
        agent={mockAgent}
        onChat={mockOnChat}
        onInfo={mockOnInfo}
        onLaunch={mockOnLaunch}
      />
    );

    fireEvent.click(screen.getByText('Chat'));
    expect(mockOnChat).toHaveBeenCalledWith(mockAgent);

    fireEvent.click(screen.getByText('Info'));
    expect(mockOnInfo).toHaveBeenCalledWith(mockAgent);

    fireEvent.click(screen.getByText('Launch Agent'));
    expect(mockOnLaunch).toHaveBeenCalledWith(mockAgent);
  });

  it('shows fallback when agent data is unavailable', () => {
    const invalidAgent = { ...mockAgent, name: '' };
    
    render(<AgentLeagueCard agent={invalidAgent as SafeAgent} />);

    expect(screen.getByText('Agent data unavailable')).toBeInTheDocument();
  });

  it('displays agent image with correct src', () => {
    render(<AgentLeagueCard agent={mockAgent} />);

    const image = screen.getByAltText('testAgent Hero Avatar');
    expect(image).toHaveAttribute('src', expect.stringContaining('/images/agents/testAgent.png'));
  });
});