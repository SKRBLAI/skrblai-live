# Agent Components Standardization

## Overview

This document outlines the standardization of agent components across the SKRBL AI platform. As part of the Agent League refactor, we've standardized how agent information is displayed and how users interact with agent details.

## Key Changes

1. **Central Source of Truth**: All agent components now use `agentBackstories.ts` as the single source of truth for agent superhero details.
2. **Consistent Routing**: All agent "Info"/"Details" buttons now route to `/agent-backstory/[agent.id]`.
3. **Standardized Action Naming**:
   - `onInfo`: View agent backstory (routes to `/agent-backstory/[agent.id]`)
   - `onChat`: Start a conversation with the agent
   - `onHandoff`: Hand off to another agent
   - `onLaunch`: Launch the agent's primary workflow

## Updated Components

### 1. AgentLeagueCard

- Added `onInfo` prop for consistent backstory access
- Default behavior routes to `/agent-backstory/[agent.id]`
- Standardized button layout with Info, Chat, and Handoff options

### 2. AgentCarousel

- Added `onInfo` and `onHandoff` props
- Updated to display superhero names from backstory data
- Improved button layout with consistent naming

### 3. AgentMarketplace

- Updated to use the agent backstory data
- Added `onInfo` handler that routes to agent backstory page
- Merged agent data with backstory data for display

### 4. AgentCard

- Added `onInfo` prop for consistent backstory access
- Updated click handlers to support backstory navigation

### 5. AgentLeagueDashboard

- Removed the modal-based backstory display
- Added navigation to the dedicated backstory page
- Standardized handler naming for clarity

## New Components

### 1. Agent Backstory Page

- Created a dedicated page at `/agent-backstory/[agentId]/page.tsx`
- Displays comprehensive agent information from backstories
- Provides consistent layout for all agent details
- Includes action buttons for launching the agent

## Benefits

1. **Consistency**: Users now have a consistent experience when viewing agent details
2. **SEO Improvement**: Dedicated pages for agent backstories improve searchability
3. **Performance**: Reduced component nesting by removing modals
4. **Maintainability**: Single source of truth for agent data
5. **Extensibility**: Easier to add new agents with standardized components

## Future Improvements

1. **Agent Analytics**: Track which agents are viewed most frequently
2. **Related Agents**: Show related agents on the backstory page
3. **User Favorites**: Allow users to favorite agents from the backstory page
4. **Personalized Recommendations**: Use backstory page interactions to improve agent recommendations

## Technical Implementation

All components now follow this pattern for accessing agent backstory data:

```typescript
// Get backstory data if available
const backstory = agentBackstories[agent.id] || 
                 agentBackstories[agent.id.replace('-agent', '')] || 
                 agentBackstories[agent.id.replace('Agent', '')];

// Merge with agent data for display
const enrichedAgent = {
  ...agent,
  ...backstory
};
```

This ensures consistent access to superhero names, powers, and other backstory elements across all components.

## Migration Notes

The legacy `SimpleAgentGrid` component has been replaced by the Agent League Dashboard system as part of the broader Agent League refactor. The new system provides a more consistent and feature-rich experience for users. 