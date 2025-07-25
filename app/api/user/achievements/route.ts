import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // Specify Node.js runtime for this complex API route

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// ACHIEVEMENT DEFINITIONS
// =============================================================================

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'agent_mastery' | 'workflow_completion' | 'collaboration' | 'power_user' | 'milestone';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  points: number;
  requirements: {
    type: 'count' | 'streak' | 'unique' | 'time_based' | 'combination';
    criteria: Record<string, any>;
  };
  rewards: {
    agentUnlocks?: string[];
    features?: string[];
    badges?: string[];
    title?: string;
  };
}

const ACHIEVEMENTS: Achievement[] = [
  // Agent Mastery Achievements
  {
    id: 'first_agent_launch',
    name: 'First Steps',
    description: 'Launch your first AI agent',
    icon: '🚀',
    category: 'agent_mastery',
    difficulty: 'bronze',
    points: 10,
    requirements: {
      type: 'count',
      criteria: { agentLaunches: 1 }
    },
    rewards: {
      badges: ['rookie_launcher'],
      title: 'Agent Rookie'
    }
  },
  {
    id: 'agent_explorer',
    name: 'Agent Explorer',
    description: 'Use 5 different AI agents',
    icon: '🎯',
    category: 'agent_mastery',
    difficulty: 'silver',
    points: 50,
    requirements: {
      type: 'unique',
      criteria: { uniqueAgents: 5 }
    },
    rewards: {
      agentUnlocks: ['collaboration-commander'],
      badges: ['explorer']
    }
  },
  {
    id: 'agent_master',
    name: 'Agent Master',
    description: 'Successfully complete 50 agent workflows',
    icon: '👑',
    category: 'agent_mastery',
    difficulty: 'gold',
    points: 200,
    requirements: {
      type: 'count',
      criteria: { successfulWorkflows: 50 }
    },
    rewards: {
      agentUnlocks: ['power-agent-supreme'],
      badges: ['workflow_master'],
      title: 'Workflow Virtuoso'
    }
  },
  {
    id: 'efficiency_expert',
    name: 'Efficiency Expert',
    description: 'Complete 10 workflows with sub-30 second response times',
    icon: '⚡',
    category: 'power_user',
    difficulty: 'silver',
    points: 75,
    requirements: {
      type: 'count',
      criteria: { fastWorkflows: 10, maxResponseTime: 30000 }
    },
    rewards: {
      features: ['priority_queue'],
      badges: ['speed_demon']
    }
  },
  
  // Collaboration Achievements
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Execute 5 cross-agent handoffs',
    icon: '🤝',
    category: 'collaboration',
    difficulty: 'silver',
    points: 60,
    requirements: {
      type: 'count',
      criteria: { handoffs: 5 }
    },
    rewards: {
      agentUnlocks: ['handoff-coordinator'],
      badges: ['collaborator']
    }
  },
  {
    id: 'chain_master',
    name: 'Chain Master',
    description: 'Complete a workflow chain with 3+ agents',
    icon: '⛓️',
    category: 'collaboration',
    difficulty: 'gold',
    points: 150,
    requirements: {
      type: 'combination',
      criteria: { chainLength: 3, chainCompleted: true }
    },
    rewards: {
      features: ['advanced_chaining'],
      badges: ['chain_master'],
      title: 'Orchestrator'
    }
  },
  
  // Milestone Achievements
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Use agents for 7 consecutive days',
    icon: '📅',
    category: 'milestone',
    difficulty: 'silver',
    points: 100,
    requirements: {
      type: 'streak',
      criteria: { dailyUsage: 7 }
    },
    rewards: {
      features: ['premium_analytics'],
      badges: ['consistent_user']
    }
  },
  {
    id: 'power_user_supreme',
    name: 'Power User Supreme',
    description: 'Unlock all standard agents and complete 100 workflows',
    icon: '🏆',
    category: 'milestone',
    difficulty: 'legendary',
    points: 500,
    requirements: {
      type: 'combination',
      criteria: { 
        allStandardAgentsUnlocked: true, 
        totalWorkflows: 100,
        uniqueAgents: 10
      }
    },
    rewards: {
      agentUnlocks: ['percy-supreme', 'custom-agent-builder'],
      features: ['unlimited_workflows', 'priority_support'],
      badges: ['legendary_user'],
      title: 'SKRBL AI Legend'
    }
  }
];

// =============================================================================
// AGENT UNLOCK SYSTEM
// =============================================================================

const AGENT_UNLOCK_REQUIREMENTS = {
  'collaboration-commander': {
    achievements: ['agent_explorer'],
    OR: {
      workflows: 20,
      handoffs: 3
    }
  },
  'power-agent-supreme': {
    achievements: ['agent_master', 'efficiency_expert'],
    workflows: 75
  },
  'handoff-coordinator': {
    achievements: ['team_player'],
    handoffs: 10
  },
  'percy-supreme': {
    achievements: ['power_user_supreme'],
    userRole: 'pro'
  },
  'custom-agent-builder': {
    achievements: ['power_user_supreme'],
    userRole: 'enterprise'
  }
};

// =============================================================================
// API ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/user/achievements
 * Get user's achievements, progress, and unlocked agents
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (!user || userError) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    switch (action) {
      case 'status':
        return await getUserAchievementStatus(user.id);
      
      case 'leaderboard':
        return await getLeaderboard();
      
      case 'available':
        return await getAvailableAchievements(user.id);
      
      case 'unlock-check': {
        const agentId = searchParams.get('agentId');
        return await checkAgentUnlock(user.id, agentId);
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('[Achievements API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch achievements'
    }, { status: 500 });
  }
}

/**
 * POST /api/user/achievements
 * Update user progress, check for new achievements, unlock agents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (!user || userError) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    switch (action) {
      case 'update_progress':
        return await updateUserProgress(user.id, data);
      
      case 'claim_achievement':
        return await claimAchievement(user.id, data.achievementId);
      
      case 'unlock_agent':
        return await unlockAgent(user.id, data.agentId);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('[Achievements API] POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update achievements'
    }, { status: 500 });
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getUserAchievementStatus(userId: string) {
  // Get user's achievement progress
  const { data: userProgress, error: progressError } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId);

  if (progressError) {
    console.error('[Achievements] Error fetching user progress:', progressError);
  }

  // Get user's unlocked agents
  const { data: unlockedAgents, error: agentError } = await supabase
    .from('user_agent_unlocks')
    .select('agent_id, unlocked_at')
    .eq('user_id', userId);

  if (agentError) {
    console.error('[Achievements] Error fetching unlocked agents:', agentError);
  }

  // Calculate current statistics
  const stats = await calculateUserStats(userId);
  
  // Check for newly earned achievements
  const newAchievements = await checkForNewAchievements(userId, stats);
  
  // Get total points and ranking
  const totalPoints = (userProgress || []).reduce((sum, achievement) => 
    sum + (ACHIEVEMENTS.find(a => a.id === achievement.achievement_id)?.points || 0), 0
  );

  const response = {
    success: true,
    data: {
      userId,
      totalPoints,
      earnedAchievements: userProgress || [],
      unlockedAgents: unlockedAgents || [],
      currentStats: stats,
      newAchievements,
      availableUnlocks: await getAvailableAgentUnlocks(userId),
      nextMilestones: getNextMilestones(stats),
      timestamp: new Date().toISOString()
    }
  };

  return NextResponse.json(response);
}

async function calculateUserStats(userId: string) {
  const [
    agentLaunches,
    successfulWorkflows,
    uniqueAgents,
    handoffs,
    fastWorkflows,
    dailyUsage
  ] = await Promise.all([
    // Total agent launches
    supabase
      .from('agent_launches')
      .select('id', { count: 'exact' })
      .eq('user_id', userId),
    
    // Successful workflows
    supabase
      .from('agent_launches')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'success'),
    
    // Unique agents used
    supabase
      .from('agent_launches')
      .select('agent_id')
      .eq('user_id', userId),
    
    // Cross-agent handoffs
    supabase
      .from('agent_handoffs')
      .select('id', { count: 'exact' })
      .eq('user_id', userId),
    
    // Fast workflows (< 30 seconds)
    supabase
      .from('agent_launches')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'success')
      .lt('execution_time_ms', 30000),
    
    // Daily usage streak
    supabase
      .from('user_funnel_events')
      .select('timestamp')
      .eq('user_id', userId)
      .in('event_type', ['agent_launch', 'workflow_complete'])
      .order('timestamp', { ascending: false })
  ]);

  // Calculate unique agents
  const uniqueAgentIds = new Set(
    (uniqueAgents.data || []).map(item => item.agent_id)
  );

  // Calculate daily usage streak
  const dailyStreak = calculateDailyStreak(dailyUsage.data || []);

  return {
    agentLaunches: agentLaunches.count || 0,
    successfulWorkflows: successfulWorkflows.count || 0,
    uniqueAgents: uniqueAgentIds.size,
    handoffs: handoffs.count || 0,
    fastWorkflows: fastWorkflows.count || 0,
    dailyStreak,
    totalWorkflows: agentLaunches.count || 0
  };
}

async function checkForNewAchievements(userId: string, stats: any) {
  const { data: earnedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const earnedIds = new Set((earnedAchievements || []).map(a => a.achievement_id));
  const newAchievements = [];

  for (const achievement of ACHIEVEMENTS) {
    if (earnedIds.has(achievement.id)) continue;

    const isEarned = checkAchievementCriteria(achievement, stats);
    if (isEarned) {
      // Award the achievement
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          earned_at: new Date().toISOString(),
          points_awarded: achievement.points
        });

      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}

function checkAchievementCriteria(achievement: Achievement, stats: any): boolean {
  const { type, criteria } = achievement.requirements;

  switch (type) {
    case 'count':
      return Object.entries(criteria).every(([key, value]) => 
        stats[key] >= value
      );
    
    case 'unique':
      return Object.entries(criteria).every(([key, value]) => 
        stats[key] >= value
      );
    
    case 'streak':
      return Object.entries(criteria).every(([key, value]) => 
        stats[key] >= value
      );
    
    case 'combination':
      return Object.entries(criteria).every(([key, value]) => {
        if (key === 'allStandardAgentsUnlocked') {
          return stats.uniqueAgents >= 8; // Assuming 8 standard agents
        }
        return stats[key] >= value;
      });
    
    default:
      return false;
  }
}

function calculateDailyStreak(events: any[]): number {
  if (!events.length) return 0;

  const dailyActivity = new Map();
  
  events.forEach(event => {
    const date = new Date(event.timestamp).toDateString();
    dailyActivity.set(date, true);
  });

  const sortedDates = Array.from(dailyActivity.keys()).sort();
  let streak = 0;
  let currentDate = new Date();

  for (let i = 0; i < sortedDates.length; i++) {
    const eventDate = new Date(sortedDates[sortedDates.length - 1 - i]);
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (eventDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

async function getAvailableAgentUnlocks(userId: string) {
  const availableUnlocks = [];
  
  for (const [agentId, requirements] of Object.entries(AGENT_UNLOCK_REQUIREMENTS)) {
    const canUnlock = await checkAgentUnlockRequirements(userId, requirements);
    if (canUnlock) {
      availableUnlocks.push(agentId);
    }
  }
  
  return availableUnlocks;
}

async function checkAgentUnlockRequirements(userId: string, requirements: any): Promise<boolean> {
  // Check required achievements
  if (requirements.achievements) {
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
    
    const earnedIds = new Set((userAchievements || []).map(a => a.achievement_id));
    
    for (const requiredAchievement of requirements.achievements) {
      if (!earnedIds.has(requiredAchievement)) {
        return false;
      }
    }
  }

  // Check user role if required
  if (requirements.userRole) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!userRole || userRole.role !== requirements.userRole) {
      return false;
    }
  }

  // Check other criteria (workflows, handoffs, etc.)
  const stats = await calculateUserStats(userId);
  
  return Object.entries(requirements)
    .filter(([key]) => !['achievements', 'userRole', 'OR'].includes(key))
    .every(([key, value]) => stats[key as keyof typeof stats] >= (value as number));
}

function getNextMilestones(stats: any) {
  const milestones = [];
  
  // Find next achievement milestones
  for (const achievement of ACHIEVEMENTS) {
    const { type, criteria } = achievement.requirements;
    
    if (type === 'count' || type === 'unique') {
      for (const [key, target] of Object.entries(criteria)) {
        const current = stats[key as keyof typeof stats] || 0;
        if (current < (target as number)) {
          milestones.push({
            achievement: achievement.id,
            name: achievement.name,
            current,
            target,
            remaining: (target as number) - current,
            category: achievement.category,
            points: achievement.points
          });
        }
      }
    }
  }
  
  return milestones.slice(0, 5); // Return top 5 next milestones
}

async function getLeaderboard() {
  // Use a simpler approach for leaderboard since Supabase client doesn't support group by in this context
  const { data: achievements, error } = await supabase
    .from('user_achievements')
    .select('user_id, points_awarded');

  if (error) {
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  // Calculate leaderboard in JavaScript
  const leaderboard = (achievements || []).reduce((acc: any[], achievement) => {
    const existing = acc.find(item => item.user_id === achievement.user_id);
    if (existing) {
      existing.total_points += achievement.points_awarded;
      existing.achievements_count += 1;
    } else {
      acc.push({
        user_id: achievement.user_id,
        total_points: achievement.points_awarded,
        achievements_count: 1
      });
    }
    return acc;
  }, [])
  .sort((a, b) => b.total_points - a.total_points)
  .slice(0, 50);

  return NextResponse.json({
    success: true,
    data: {
      leaderboard,
      timestamp: new Date().toISOString()
    }
  });
}

async function getAvailableAchievements(userId: string) {
  const { data: earnedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const earnedIds = new Set((earnedAchievements || []).map(a => a.achievement_id));
  const availableAchievements = ACHIEVEMENTS.filter(a => !earnedIds.has(a.id));

  return NextResponse.json({
    success: true,
    data: {
      available: availableAchievements,
      total: ACHIEVEMENTS.length,
      earned: earnedIds.size,
      timestamp: new Date().toISOString()
    }
  });
}

async function checkAgentUnlock(userId: string, agentId: string | null) {
  if (!agentId) {
    return NextResponse.json(
      { success: false, error: 'agentId parameter required' },
      { status: 400 }
    );
  }

  const requirements = AGENT_UNLOCK_REQUIREMENTS[agentId as keyof typeof AGENT_UNLOCK_REQUIREMENTS];
  if (!requirements) {
    return NextResponse.json({
      success: true,
      data: { 
        canUnlock: true, 
        reason: 'No special requirements',
        agentId 
      }
    });
  }

  const canUnlock = await checkAgentUnlockRequirements(userId, requirements);
  
  return NextResponse.json({
    success: true,
    data: {
      canUnlock,
      requirements,
      agentId,
      timestamp: new Date().toISOString()
    }
  });
}

async function updateUserProgress(userId: string, data: any) {
  // This would be called by other parts of the system to update progress
  // For now, just trigger a progress check
  const stats = await calculateUserStats(userId);
  const newAchievements = await checkForNewAchievements(userId, stats);
  
  return NextResponse.json({
    success: true,
    data: {
      statsUpdated: stats,
      newAchievements,
      message: 'Progress updated successfully',
      timestamp: new Date().toISOString()
    }
  });
}

async function claimAchievement(userId: string, achievementId: string) {
  // Mark achievement as claimed (for UI purposes)
  const { error } = await supabase
    .from('user_achievements')
    .update({ claimed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('achievement_id', achievementId);

  if (error) {
    throw new Error(`Failed to claim achievement: ${error.message}`);
  }

  return NextResponse.json({
    success: true,
    data: {
      achievementId,
      claimed: true,
      timestamp: new Date().toISOString()
    }
  });
}

async function unlockAgent(userId: string, agentId: string) {
  // Check if agent can be unlocked
  const requirements = AGENT_UNLOCK_REQUIREMENTS[agentId as keyof typeof AGENT_UNLOCK_REQUIREMENTS];
  if (requirements) {
    const canUnlock = await checkAgentUnlockRequirements(userId, requirements);
    if (!canUnlock) {
      return NextResponse.json(
        { success: false, error: 'Requirements not met for agent unlock' },
        { status: 403 }
      );
    }
  }

  // Unlock the agent
  const { error } = await supabase
    .from('user_agent_unlocks')
    .insert({
      user_id: userId,
      agent_id: agentId,
      unlocked_at: new Date().toISOString()
    });

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    throw new Error(`Failed to unlock agent: ${error.message}`);
  }

  return NextResponse.json({
    success: true,
    data: {
      agentId,
      unlocked: true,
      timestamp: new Date().toISOString()
    }
  });
} 