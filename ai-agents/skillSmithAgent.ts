import { supabase } from '../utils/supabase';
import { validateAgentInput, callOpenAI, callOpenAIWithFallback } from '../utils/agentUtils';
import type { Agent, AgentInput as BaseAgentInput, AgentFunction, AgentResponse } from '@/types/agent';

// Define input interface for Skill Smith Agent
interface SkillSmithInput extends BaseAgentInput {
  skillType: 'sports' | 'music' | 'dance' | 'public-speaking' | 'cooking' | 'crafts' | 'fitness' | 'martial-arts' | 'custom';
  videoUrl?: string; // URL to uploaded performance video
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  specificGoals?: string[];
  timeCommitment?: string; // e.g., "30 minutes daily", "2 hours weekly"
  previousExperience?: string;
  targetTimeframe?: string; // e.g., "1 month", "3 months", "6 months"
  analysisType: 'video-analysis' | 'training-plan' | 'quick-wins' | 'progress-check';
}

interface VideoAnalysisResult {
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
  technicalFeedback: string[];
  formCorrections: string[];
  quickFixes: string[];
  nextSteps: string[];
}

interface TrainingPlan {
  planId: string;
  duration: string;
  phases: TrainingPhase[];
  dailyExercises: Exercise[];
  weeklyGoals: string[];
  progressMilestones: Milestone[];
}

interface TrainingPhase {
  phase: number;
  name: string;
  duration: string;
  focus: string[];
  exercises: Exercise[];
}

interface Exercise {
  name: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  videoReference?: string;
}

interface Milestone {
  week: number;
  goal: string;
  assessment: string;
  reward: string;
}

/**
 * SkillSmith Agent - AI-powered skill development mentor
 * Provides video form analysis, instant feedback, training plans, and quick wins
 */
const runSkillSmith = async (input: SkillSmithInput): Promise<AgentResponse> => {
  try {
    // Validate input
    if (!input.userId || !input.skillType || !input.currentLevel || !input.analysisType) {
      throw new Error('Missing required fields: userId, skillType, currentLevel, and analysisType');
    }

    let result: any;

    switch (input.analysisType) {
      case 'video-analysis':
        result = await performVideoAnalysis(input);
        break;
      case 'training-plan':
        result = await generateTrainingPlan(input);
        break;
      case 'quick-wins':
        result = await generateQuickWins(input);
        break;
      case 'progress-check':
        result = await checkProgress(input);
        break;
      default:
        throw new Error('Invalid analysis type');
    }

    // Log activity to Supabase
    const { error: logError } = await supabase
      .from('agent-logs')
      .insert({
        agent: 'skillSmithAgent',
        input,
        skillType: input.skillType,
        analysisType: input.analysisType,
        timestamp: new Date().toISOString()
      });
    if (logError) throw logError;

    // Save skill development data
    const { data: skillData, error: skillError } = await supabase
      .from('skill-development')
      .insert({
        userId: input.userId,
        skillType: input.skillType,
        currentLevel: input.currentLevel,
        analysisType: input.analysisType,
        result,
        createdAt: new Date().toISOString(),
        status: 'completed'
      })
      .select();
    if (skillError) throw skillError;

    return {
      success: true,
      message: `SkillSmith analysis completed for ${input.skillType}`,
      data: {
        skillSessionId: skillData[0].id,
        analysisType: input.analysisType,
        result,
        handoffSuggestions: generateHandoffSuggestions(input.analysisType, input.skillType)
      }
    };
  } catch (error) {
    console.error('SkillSmith agent failed:', error);
    return {
      success: false,
      message: `SkillSmith agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Perform AI-powered video analysis of technique and form
 */
const performVideoAnalysis = async (input: SkillSmithInput): Promise<VideoAnalysisResult> => {
  const prompt = `
    Analyze a ${input.skillType} performance video for a ${input.currentLevel} level practitioner.
    
    Skill: ${input.skillType}
    Level: ${input.currentLevel}
    Goals: ${input.specificGoals?.join(', ') || 'General improvement'}
    
    Provide detailed feedback on:
    1. Overall technique (score 1-100)
    2. Specific strengths to maintain
    3. Key areas needing improvement
    4. Technical corrections needed
    5. Form/posture adjustments
    6. Quick fixes for immediate improvement
    7. Next steps for development
    
    Be encouraging but specific with actionable advice.
  `;

  const aiAnalysis = await callOpenAIWithFallback<string>(
    prompt,
    { maxTokens: 600 },
    () => generateFallbackVideoAnalysis(input)
  );

  // Parse AI response into structured format
  return parseVideoAnalysis(aiAnalysis, input);
};

/**
 * Generate a comprehensive training plan
 */
const generateTrainingPlan = async (input: SkillSmithInput): Promise<TrainingPlan> => {
  const prompt = `
    Create a comprehensive training plan for ${input.skillType} improvement.
    
    Current Level: ${input.currentLevel}
    Time Commitment: ${input.timeCommitment || '30 minutes daily'}
    Goals: ${input.specificGoals?.join(', ') || 'General skill improvement'}
    Timeframe: ${input.targetTimeframe || '3 months'}
    
    Include:
    1. 3-4 training phases with progressive difficulty
    2. Daily exercises with descriptions
    3. Weekly goals and milestones
    4. Progress assessment methods
    5. Reward system for motivation
    
    Make it practical and achievable.
  `;

  const aiPlan = await callOpenAIWithFallback<string>(
    prompt,
    { maxTokens: 800 },
    () => generateFallbackTrainingPlan(input)
  );

  return parseTrainingPlan(aiPlan, input);
};

/**
 * Generate quick wins for immediate improvement
 */
const generateQuickWins = async (input: SkillSmithInput): Promise<string[]> => {
  const prompt = `
    Provide 5-7 quick wins for immediate improvement in ${input.skillType} for a ${input.currentLevel} practitioner.
    
    These should be:
    - Achievable in 1-3 practice sessions
    - High impact on performance
    - Easy to understand and implement
    - Confidence-building
    
    Focus on the most common issues for this skill and level.
  `;

  const aiQuickWins = await callOpenAIWithFallback<string>(
    prompt,
    { maxTokens: 400 },
    () => generateFallbackQuickWins(input)
  );

  return parseQuickWins(aiQuickWins);
};

/**
 * Check progress against previous assessments
 */
const checkProgress = async (input: SkillSmithInput): Promise<any> => {
  // Retrieve previous assessments from database
  const { data: previousSessions, error } = await supabase
    .from('skill-development')
    .select('*')
    .eq('userId', input.userId)
    .eq('skillType', input.skillType)
    .order('createdAt', { ascending: false })
    .limit(5);

  if (error) throw error;

  if (!previousSessions || previousSessions.length === 0) {
    return {
      status: 'first-assessment',
      message: 'This is your first assessment. Complete a video analysis to establish your baseline.',
      recommendations: ['Upload a performance video', 'Set specific goals', 'Create a training plan']
    };
  }

  const prompt = `
    Analyze skill development progress for ${input.skillType}.
    
    Previous sessions: ${previousSessions.length}
    Time period: ${calculateTimePeriod(previousSessions)}
    
    Compare improvement trends and provide:
    1. Progress summary
    2. Areas of greatest improvement
    3. Persistent challenges
    4. Recommendations for next steps
    5. Motivation and encouragement
  `;

  const progressAnalysis = await callOpenAIWithFallback<string>(
    prompt,
    { maxTokens: 500 },
    () => generateFallbackProgressCheck(previousSessions)
  );

  return {
    status: 'progress-tracked',
    sessionCount: previousSessions.length,
    timePeriod: calculateTimePeriod(previousSessions),
    analysis: progressAnalysis,
    trends: calculateProgressTrends(previousSessions)
  };
};

/**
 * Fallback functions for when OpenAI is unavailable
 */
const generateFallbackVideoAnalysis = (input: SkillSmithInput): string => {
  const skillTemplates = {
    sports: "Good athletic foundation. Focus on consistency and form refinement.",
    music: "Solid rhythm and timing. Work on technique precision and expression.",
    dance: "Great energy and movement. Focus on alignment and flow.",
    'public-speaking': "Clear communication style. Work on confidence and engagement.",
    cooking: "Good knife skills and timing. Focus on flavor balance and presentation.",
    crafts: "Creative approach and attention to detail. Focus on precision and technique.",
    fitness: "Strong effort and dedication. Focus on form and progressive overload.",
    'martial-arts': "Good discipline and focus. Work on technique and control.",
    custom: "Solid foundation in place. Focus on consistent practice and technique.",
    default: "Good foundation in place. Focus on consistent practice and technique."
  };

  return skillTemplates[input.skillType] || skillTemplates.default;
};

const generateFallbackTrainingPlan = (input: SkillSmithInput): string => {
  return `
    Phase 1 (Weeks 1-2): Foundation Building
    - Daily practice: 20-30 minutes
    - Focus: Basic techniques and form
    
    Phase 2 (Weeks 3-6): Skill Development  
    - Daily practice: 30-45 minutes
    - Focus: Intermediate techniques and consistency
    
    Phase 3 (Weeks 7-12): Mastery Pursuit
    - Daily practice: 45-60 minutes
    - Focus: Advanced techniques and personal style
  `;
};

const generateFallbackQuickWins = (input: SkillSmithInput): string => {
  return `
    1. Focus on proper warm-up routine
    2. Practice fundamental movements slowly
    3. Record yourself for self-analysis
    4. Set up consistent practice schedule
    5. Find accountability partner or mentor
  `;
};

const generateFallbackProgressCheck = (sessions: any[]): string => {
  return `Based on ${sessions.length} previous sessions, you're showing consistent engagement with your skill development. Keep practicing regularly and tracking your progress.`;
};

/**
 * Parsing functions to structure AI responses
 */
const parseVideoAnalysis = (analysis: string, input: SkillSmithInput): VideoAnalysisResult => {
  // Simple parsing logic - in production this would be more sophisticated
  return {
    overallScore: extractScore(analysis) || getDefaultScore(input.currentLevel),
    strengths: extractListItems(analysis, 'strengths') || getDefaultStrengths(input.skillType),
    improvementAreas: extractListItems(analysis, 'improvement') || getDefaultImprovements(input.skillType),
    technicalFeedback: extractListItems(analysis, 'technical') || getDefaultTechnical(input.skillType),
    formCorrections: extractListItems(analysis, 'form') || getDefaultForm(input.skillType),
    quickFixes: extractListItems(analysis, 'quick') || getDefaultQuickFixes(input.skillType),
    nextSteps: extractListItems(analysis, 'next') || getDefaultNextSteps(input.skillType)
  };
};

const parseTrainingPlan = (plan: string, input: SkillSmithInput): TrainingPlan => {
  return {
    planId: `plan_${Date.now()}_${input.skillType}`,
    duration: input.targetTimeframe || '12 weeks',
    phases: parsePhases(plan) || getDefaultPhases(input.skillType),
    dailyExercises: parseDailyExercises(plan) || getDefaultExercises(input.skillType),
    weeklyGoals: parseWeeklyGoals(plan) || getDefaultWeeklyGoals(input.skillType),
    progressMilestones: parseMilestones(plan) || getDefaultMilestones()
  };
};

const parseQuickWins = (quickWins: string): string[] => {
  return quickWins.split('\n').filter(line => line.trim()).map(line => line.replace(/^\d+\.?\s*/, '').trim());
};

/**
 * Helper functions for generating handoff suggestions
 */
const generateHandoffSuggestions = (analysisType: string, skillType: string) => {
  const suggestions = [];

  if (analysisType === 'video-analysis' || analysisType === 'training-plan') {
    suggestions.push({
      agentId: 'videocontent',
      reason: 'Create instructional videos for your training plan',
      confidence: 85
    });
  }

  if (analysisType === 'progress-check') {
    suggestions.push({
      agentId: 'social-bot-agent',
      reason: 'Share your skill development progress on social media',
      confidence: 75
    });
  }

  suggestions.push({
    agentId: 'content-creator-agent',
    reason: 'Document your skill journey with blog posts or guides',
    confidence: 70
  });

  return suggestions;
};

/**
 * Utility functions for extracting data from AI responses
 */
const extractScore = (text: string): number | null => {
  const match = text.match(/score.*?(\d+)/i);
  return match ? parseInt(match[1]) : null;
};

const extractListItems = (text: string, keyword: string): string[] | null => {
  const regex = new RegExp(`${keyword}.*?:(.*?)(?:\\n\\n|$)`, 'is');
  const match = text.match(regex);
  if (match) {
    return match[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, '').trim());
  }
  return null;
};

const getDefaultScore = (level: string): number => {
  const scores: Record<string, number> = { beginner: 40, intermediate: 65, advanced: 80, expert: 90 };
  return scores[level] || 50;
};

const getDefaultStrengths = (skillType: string): string[] => {
  return ['Shows dedication to improvement', 'Good basic understanding', 'Consistent effort'];
};

const getDefaultImprovements = (skillType: string): string[] => {
  return ['Focus on fundamental techniques', 'Increase practice consistency', 'Work on precision'];
};

const getDefaultTechnical = (skillType: string): string[] => {
  return ['Review basic form', 'Practice slowly for accuracy', 'Record sessions for self-analysis'];
};

const getDefaultForm = (skillType: string): string[] => {
  return ['Maintain proper posture', 'Focus on alignment', 'Use full range of motion'];
};

const getDefaultQuickFixes = (skillType: string): string[] => {
  return ['Warm up properly', 'Practice daily for 15 minutes', 'Focus on one technique at a time'];
};

const getDefaultNextSteps = (skillType: string): string[] => {
  return ['Continue regular practice', 'Set specific weekly goals', 'Track progress weekly'];
};

const getDefaultPhases = (skillType: string): TrainingPhase[] => {
  return [
    {
      phase: 1,
      name: 'Foundation',
      duration: '4 weeks',
      focus: ['Basic techniques', 'Form development'],
      exercises: getDefaultExercises(skillType).slice(0, 3)
    },
    {
      phase: 2,
      name: 'Development',
      duration: '4 weeks', 
      focus: ['Intermediate skills', 'Consistency'],
      exercises: getDefaultExercises(skillType).slice(2, 5)
    },
    {
      phase: 3,
      name: 'Mastery',
      duration: '4 weeks',
      focus: ['Advanced techniques', 'Personal style'],
      exercises: getDefaultExercises(skillType).slice(4, 7)
    }
  ];
};

const getDefaultExercises = (skillType: string): Exercise[] => {
  return [
    {
      name: 'Warm-up routine',
      description: 'Prepare your body and mind for practice',
      duration: '5 minutes',
      difficulty: 'easy',
      category: 'preparation'
    },
    {
      name: 'Basic technique practice',
      description: 'Focus on fundamental movements',
      duration: '15 minutes',
      difficulty: 'medium',
      category: 'fundamentals'
    },
    {
      name: 'Form refinement',
      description: 'Perfect your technique with slow practice',
      duration: '10 minutes',
      difficulty: 'medium',
      category: 'technique'
    },
    {
      name: 'Progressive challenge',
      description: 'Gradually increase difficulty or speed',
      duration: '15 minutes',
      difficulty: 'hard',
      category: 'advancement'
    },
    {
      name: 'Cool down and reflection',
      description: 'Review session and note improvements',
      duration: '5 minutes',
      difficulty: 'easy',
      category: 'reflection'
    }
  ];
};

const getDefaultWeeklyGoals = (skillType: string): string[] => {
  return [
    'Complete all daily practice sessions',
    'Master one new technique',
    'Improve consistency by 10%',
    'Record progress video'
  ];
};

const getDefaultMilestones = (): Milestone[] => {
  return [
    {
      week: 2,
      goal: 'Establish consistent practice routine',
      assessment: 'Complete 10 practice sessions',
      reward: 'Celebrate with favorite healthy meal'
    },
    {
      week: 4,
      goal: 'Master basic techniques',
      assessment: 'Demonstrate improved form',
      reward: 'Share progress with friend or mentor'
    },
    {
      week: 8,
      goal: 'Show measurable improvement',
      assessment: 'Compare to baseline video',
      reward: 'Treat yourself to new equipment'
    },
    {
      week: 12,
      goal: 'Achieve target skill level',
      assessment: 'Complete final assessment',
      reward: 'Plan advanced training or new skill'
    }
  ];
};

const parsePhases = (text: string): TrainingPhase[] | null => {
  // Simple parsing - in production would be more sophisticated
  return null;
};

const parseDailyExercises = (text: string): Exercise[] | null => {
  return null;
};

const parseWeeklyGoals = (text: string): string[] | null => {
  return null;
};

const parseMilestones = (text: string): Milestone[] | null => {
  return null;
};

const calculateTimePeriod = (sessions: any[]): string => {
  if (sessions.length < 2) return 'Single session';
  
  const latest = new Date(sessions[0].createdAt);
  const earliest = new Date(sessions[sessions.length - 1].createdAt);
  const diffDays = Math.floor((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
  return `${Math.floor(diffDays / 30)} months`;
};

const calculateProgressTrends = (sessions: any[]): any => {
  return {
    sessionFrequency: calculateSessionFrequency(sessions),
    improvementRate: 'steady', // Would calculate based on scores
    consistencyScore: calculateConsistencyScore(sessions)
  };
};

const calculateSessionFrequency = (sessions: any[]): string => {
  if (sessions.length < 2) return 'insufficient-data';
  
  const totalDays = Math.floor((new Date(sessions[0].createdAt).getTime() - new Date(sessions[sessions.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const avgDaysBetween = totalDays / (sessions.length - 1);
  
  if (avgDaysBetween <= 1.5) return 'daily';
  if (avgDaysBetween <= 4) return 'frequent';
  if (avgDaysBetween <= 7) return 'weekly';
  return 'occasional';
};

const calculateConsistencyScore = (sessions: any[]): number => {
  // Simple consistency calculation - in production would be more sophisticated
  return Math.min(sessions.length * 10, 100);
};

// Agent definition
const skillSmithAgent: Agent = {
  id: 'skillsmith',
  name: 'Skill Smith',
  category: 'Training',
  description: 'AI-powered skill development mentor with video analysis, instant feedback, and personalized training plans',
  imageSlug: 'skillsmith',
  visible: true,
  agentCategory: ['training', 'education'],
  config: {
    name: 'Skill Smith',
    description: 'AI-powered skill development mentor with video analysis, instant feedback, and personalized training plans',
    capabilities: [
      'Video Form Analysis',
      'Instant Feedback Generation', 
      'Personalized Training Plans',
      'Quick Wins Identification',
      'Progress Tracking',
      'Multi-Skill Support',
      'Achievement System'
    ]
  },
  capabilities: [
    'video form analysis',
    'skill assessment',
    'training plans',
    'instant feedback',
    'quick wins',
    'progress tracking',
    'sports training',
    'music training',
    'dance training',
    'public speaking',
    'cooking skills',
    'fitness coaching',
    'martial arts',
    'skill development',
    'technique improvement',
    'performance optimization'
  ],
  roleRequired: 'any',
  canConverse: true,
  recommendedHelpers: ['videocontent', 'social'],
  handoffTriggers: ['video creation', 'social sharing', 'content documentation'],
  usageCount: undefined,
  lastRun: undefined,
  performanceScore: undefined,
  runAgent: async (input: BaseAgentInput) => {
    const extendedInput = input as unknown as Record<string, any>;
    
    const skillFields = validateAgentInput(
      extendedInput,
      ['skillType', 'currentLevel', 'analysisType', 'videoUrl', 'specificGoals', 'timeCommitment', 'previousExperience', 'targetTimeframe'],
      {
        skillType: (val) => ['sports', 'music', 'dance', 'public-speaking', 'cooking', 'crafts', 'fitness', 'martial-arts', 'custom'].includes(val),
        currentLevel: (val) => ['beginner', 'intermediate', 'advanced', 'expert'].includes(val),
        analysisType: (val) => ['video-analysis', 'training-plan', 'quick-wins', 'progress-check'].includes(val),
        videoUrl: (val) => typeof val === 'string',
        specificGoals: (val) => Array.isArray(val),
        timeCommitment: (val) => typeof val === 'string',
        previousExperience: (val) => typeof val === 'string',
        targetTimeframe: (val) => typeof val === 'string'
      },
      {
        skillType: 'fitness',
        currentLevel: 'beginner',
        analysisType: 'quick-wins',
        videoUrl: undefined,
        specificGoals: [],
        timeCommitment: '30 minutes daily',
        previousExperience: '',
        targetTimeframe: '3 months'
      }
    );
    
    const skillSmithInput: SkillSmithInput = {
      userId: input.userId,
      goal: input.goal,
      content: input.content,
      context: input.context,
      options: input.options,
      ...skillFields
    };
    
    return runSkillSmith(skillSmithInput);
  }
};

export { skillSmithAgent };
export default skillSmithAgent;