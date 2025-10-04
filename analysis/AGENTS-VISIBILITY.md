# Agents Area Visibility & Progressive Enhancement

This document explains which components in the agents area are always-on vs. enhanced-by-flag, and which flags control them.

## Progressive Enhancement Pattern

The agents area follows a progressive enhancement pattern where:
- **Base UI always renders** - Core functionality is always available
- **Enhanced features toggle on/off** - Additional features appear when flags are enabled
- **No broken states** - UI remains functional when flags are disabled

## Always-On Components

### Agent League Grid (`/agents` page)
- **Component**: `AgentLeagueCard` components in grid layout
- **Status**: ✅ **Always visible** - Core agent browsing functionality
- **Purpose**: Primary way to discover and interact with agents
- **Implementation**: Renders regardless of feature flags

### Agent Details & Interactions
- **Components**: Agent modals, chat interfaces, workflow launches
- **Status**: ✅ **Always visible** - Core agent functionality
- **Purpose**: Essential agent interaction features
- **Implementation**: No flag dependencies

## Enhanced-by-Flag Components

### 1. Agent League Orbit Animation
- **Component**: `AgentLeagueOrbit` (`components/agents/AgentLeagueOrbit.tsx`)
- **Flag**: `FEATURE_FLAGS.ENABLE_ORBIT`
- **Default**: `false` (disabled)
- **Purpose**: Animated orbit visualization of agents
- **Implementation**: 
  ```typescript
  // app/agents/page.tsx
  const isOrbitEnabled = FEATURE_FLAGS.ENABLE_ORBIT;
  
  return (
    <>
      {/* Base grid always shows */}
      <AgentLeagueGrid agents={agents} />
      
      {/* Enhanced orbit only shows when flag enabled */}
      {isOrbitEnabled && (
        <AgentLeagueOrbit agents={agents} />
      )}
    </>
  );
  ```

### 2. Homepage Agent League Preview Enhancements
- **Component**: `AgentLeaguePreview` (`components/home/AgentLeaguePreview.tsx`)
- **Flag**: `FEATURE_FLAGS.HP_GUIDE_STAR`
- **Default**: `true` (enabled)
- **Purpose**: Enhanced live activity indicators and advanced features
- **Implementation**:
  ```typescript
  // components/home/AgentLeaguePreview.tsx
  const showAdvancedFeatures = FEATURE_FLAGS.HP_GUIDE_STAR;
  
  return (
    <>
      {/* Base agent league always shows */}
      <AgentLeagueGrid />
      
      {/* Enhanced live activity only shows when flag enabled */}
      {showAdvancedFeatures && (
        <div className="live-activity-summary">
          <div className="live-users-indicator" />
          <div className="activity-metrics" />
        </div>
      )}
    </>
  );
  ```

## Feature Flag Configuration

### Environment Variables
```bash
# Orbit animation on agents page
NEXT_PUBLIC_ENABLE_ORBIT=false

# Homepage guide star enhancements
NEXT_PUBLIC_HP_GUIDE_STAR=true
```

### Feature Flag Definitions
```typescript
// lib/config/featureFlags.ts
export const FEATURE_FLAGS = {
  // Agent & Service Features  
  ENABLE_ORBIT: readBooleanFlag('NEXT_PUBLIC_ENABLE_ORBIT', false),
  HP_GUIDE_STAR: readBooleanFlag('NEXT_PUBLIC_HP_GUIDE_STAR', true),
} as const;
```

## Component Behavior Matrix

| Component | Always On | Enhanced By Flag | Flag | Default | Purpose |
|-----------|-----------|------------------|------|---------|---------|
| Agent League Grid | ✅ | ❌ | N/A | N/A | Core agent browsing |
| Agent Modals | ✅ | ❌ | N/A | N/A | Agent interactions |
| Agent Chat | ✅ | ❌ | N/A | N/A | Agent communication |
| Agent Workflows | ✅ | ❌ | N/A | N/A | Agent automation |
| Orbit Animation | ❌ | ✅ | `ENABLE_ORBIT` | `false` | Visual enhancement |
| Live Activity UI | ❌ | ✅ | `HP_GUIDE_STAR` | `true` | Real-time metrics |

## Progressive Enhancement Examples

### ✅ Good: Progressive Enhancement
```typescript
// Base functionality always works
<AgentLeagueGrid agents={agents} />

// Enhanced features add value when enabled
{FEATURE_FLAGS.ENABLE_ORBIT && (
  <AgentLeagueOrbit agents={agents} />
)}
```

### ❌ Bad: Hard Gates (Avoid)
```typescript
// Don't hide core functionality behind flags
if (!FEATURE_FLAGS.ENABLE_ORBIT) {
  return <div>Feature disabled</div>;
}
```

## Testing Scenarios

### Scenario 1: All Flags Disabled
- **ENABLE_ORBIT**: `false`
- **HP_GUIDE_STAR**: `false`
- **Expected**: Core agent functionality works, no enhanced features visible
- **Result**: ✅ Agents page fully functional, homepage shows basic agent league

### Scenario 2: Orbit Enabled Only
- **ENABLE_ORBIT**: `true`
- **HP_GUIDE_STAR**: `false`
- **Expected**: Agents page shows orbit animation, homepage shows basic agent league
- **Result**: ✅ Enhanced agents page, basic homepage

### Scenario 3: Guide Star Enabled Only
- **ENABLE_ORBIT**: `false`
- **HP_GUIDE_STAR**: `true`
- **Expected**: Homepage shows enhanced agent league, agents page shows basic grid
- **Result**: ✅ Enhanced homepage, basic agents page

### Scenario 4: All Flags Enabled
- **ENABLE_ORBIT**: `true`
- **HP_GUIDE_STAR**: `true`
- **Expected**: Full enhanced experience on both pages
- **Result**: ✅ Maximum feature visibility

## Migration Notes

- No breaking changes to existing functionality
- All components gracefully handle flag states
- Progressive enhancement ensures core functionality always works
- Enhanced features provide additional value when enabled

## Recommendations

1. **Keep Core Functionality Always-On**: Never gate essential agent browsing behind flags
2. **Use Progressive Enhancement**: Add enhancements rather than replacing core features
3. **Test All Flag Combinations**: Ensure UI works in all flag states
4. **Document Flag Dependencies**: Keep this document updated as new flags are added