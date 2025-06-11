import { createClient } from '@supabase/supabase-js';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Lead {
  id?: number;
  email: string;
  phone?: string;
  company_size?: string;
  problem?: string;
  industry?: string;
  timeline?: string;
  lead_score: number;
  segment: 'cold' | 'warm' | 'hot' | 'mql' | 'sql';
  lead_source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  lifecycle_stage: 'subscriber' | 'lead' | 'mql' | 'opportunity' | 'customer';
  first_touch_date: string;
  last_activity_date: string;
  assigned_to?: string;
  notes?: string;
  lead_tags: string[];
  qualification_score?: number;
  session_id?: string;
  created_at?: string;
}

export interface LeadScoringActivity {
  lead_id: number;
  user_id?: string;
  activity_type: 'email_open' | 'email_click' | 'page_view' | 'form_submit' | 'download' | 
                 'agent_interaction' | 'trial_signup' | 'upgrade_view' | 'video_watch' |
                 'demo_request' | 'pricing_view' | 'feature_exploration' | 'automation_score_update';
  activity_value?: string;
  score_change: number;
  current_score: number;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface MarketingCampaign {
  id?: string;
  name: string;
  campaign_type: 'email_sequence' | 'drip_campaign' | 'behavioral_trigger' | 
                'lead_magnet' | 'retargeting' | 'onboarding' | 'winback';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  target_segment: Record<string, any>;
  start_date?: string;
  end_date?: string;
  goals: Record<string, any>;
  budget_cents: number;
  created_by?: string;
  n8n_workflow_id?: string;
  n8n_webhook_url?: string;
  metadata?: Record<string, any>;
}

export interface DripCampaign {
  id?: string;
  name: string;
  description?: string;
  trigger_type: 'signup' | 'trial_start' | 'trial_end' | 'first_agent_use' | 
               'upgrade_abandonment' | 'inactive_user' | 'high_value_action' | 
               'segment_entry' | 'manual';
  target_criteria: Record<string, any>;
  is_active: boolean;
  steps: DripCampaignStep[];
}

export interface DripCampaignStep {
  id?: string;
  campaign_id: string;
  step_number: number;
  step_type: 'email' | 'sms' | 'push' | 'webhook' | 'delay' | 'condition';
  delay_hours: number;
  conditions?: Record<string, any>;
  email_template_id?: string;
  subject?: string;
  content?: string;
  n8n_action?: Record<string, any>;
  metadata?: Record<string, any>;
  is_active: boolean;
}

export interface AutomationRule {
  id?: string;
  name: string;
  description?: string;
  trigger_event: string;
  trigger_conditions: Record<string, any>;
  action_type: 'send_email' | 'add_to_campaign' | 'update_score' | 'change_segment' |
              'create_task' | 'send_webhook' | 'trigger_n8n';
  action_config: Record<string, any>;
  delay_minutes: number;
  is_active: boolean;
  priority: number;
}

export interface LeadMagnet {
  id?: string;
  title: string;
  description?: string;
  magnet_type: 'ebook' | 'whitepaper' | 'template' | 'checklist' | 'webinar' |
              'free_trial' | 'consultation' | 'tool' | 'guide' | 'video_series';
  file_url?: string;
  thumbnail_url?: string;
  landing_page_url?: string;
  download_count: number;
  conversion_rate: number;
  target_segment: Record<string, any>;
  value_score: number;
  is_active: boolean;
}

// ==========================================
// MARKETING AUTOMATION MANAGER CLASS
// ==========================================

export class MarketingAutomationManager {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // ==========================================
  // LEAD SCORING SYSTEM
  // ==========================================

  /**
   * Calculate dynamic lead score based on activities and profile
   */
  async calculateLeadScore(leadId: number, activities: LeadScoringActivity[]): Promise<number> {
    let totalScore = 0;

    // Base scoring rules
    const scoringRules = {
      email_open: 5,
      email_click: 15,
      page_view: 3,
      form_submit: 25,
      download: 20,
      agent_interaction: 30,
      trial_signup: 50,
      upgrade_view: 40,
      video_watch: 10,
      demo_request: 75,
      pricing_view: 35,
      feature_exploration: 25,
      automation_score_update: 15
    };

    // Score recent activities (last 30 days get full points, older get decay)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    for (const activity of activities) {
      const activityDate = new Date(activity.created_at || now);
      const ageInDays = (now.getTime() - activityDate.getTime()) / (24 * 60 * 60 * 1000);
      
      let scoreValue = scoringRules[activity.activity_type] || 0;
      
      // Apply decay for older activities
      if (ageInDays > 30) {
        scoreValue *= Math.max(0.1, 1 - (ageInDays - 30) / 90); // 90-day decay to 10%
      }
      
      totalScore += scoreValue;
    }

    // Get lead profile for demographic scoring
    const { data: lead } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (lead) {
      // Industry scoring
      const industryBonus: Record<string, number> = {
        Enterprise: 30,
        Agency: 25,
        SaaS: 20,
        Consultant: 15,
        'E-commerce': 10,
      };
      totalScore += industryBonus[lead.industry ?? ''] || 0;

      // Timeline urgency scoring
      const timelineBonus: Record<string, number> = {
        urgent: 40,
        week: 30,
        month: 20,
        '2-3': 15,
        planning: 5,
      };
      Object.keys(timelineBonus).forEach((key) => {
        if (lead.timeline?.toLowerCase().includes(key)) {
          totalScore += timelineBonus[key];
        }
      });

      // Company size scoring
      const companySizeBonus: Record<string, number> = {
        '50+': 25,
        '11-50': 20,
        '2-10': 15,
        solo: 10,
      };
      totalScore += companySizeBonus[lead.company_size ?? ''] || 0;
    }

    return Math.min(totalScore, 100); // Cap at 100
  }

  /**
   * Record lead scoring activity
   */
  async recordLeadActivity(activity: LeadScoringActivity): Promise<void> {
    try {
      // Calculate new score
      const { data: existingActivities } = await this.supabase
        .from('lead_scoring_activities')
        .select('*')
        .eq('lead_id', activity.lead_id);

      const newScore = await this.calculateLeadScore(
        activity.lead_id, 
        [...(existingActivities || []), activity]
      );

      // Insert activity record
      await this.supabase.from('lead_scoring_activities').insert([{
        ...activity,
        current_score: newScore,
        created_at: new Date().toISOString()
      }]);

      // Update lead score and last activity
      await this.supabase
        .from('leads')
        .update({
          lead_score: newScore,
          last_activity_date: new Date().toISOString()
        })
        .eq('id', activity.lead_id);

      // Check for segment transitions
      await this.checkSegmentTransition(activity.lead_id, newScore);

      // Trigger automation rules
      await this.triggerAutomationRules('score_change', {
        lead_id: activity.lead_id,
        old_score: activity.current_score,
        new_score: newScore,
        activity_type: activity.activity_type
      });

    } catch (error) {
      console.error('Failed to record lead activity:', error);
      throw error;
    }
  }

  /**
   * Check and handle segment transitions based on score
   */
  private async checkSegmentTransition(leadId: number, newScore: number): Promise<void> {
    const { data: lead } = await this.supabase
      .from('leads')
      .select('segment')
      .eq('id', leadId)
      .single();

    if (!lead) return;

    let newSegment = lead.segment;
    const currentSegment = lead.segment;

    // Define segment thresholds
    if (newScore >= 80) newSegment = 'hot';
    else if (newScore >= 60) newSegment = 'warm';
    else if (newScore >= 40) newSegment = 'mql';
    else newSegment = 'cold';

    if (newSegment !== currentSegment) {
      // Update segment
      await this.supabase
        .from('leads')
        .update({ segment: newSegment })
        .eq('id', leadId);

      // Record transition
      await this.supabase.from('lead_lifecycle_transitions').insert([{
        lead_id: leadId,
        from_stage: currentSegment,
        to_stage: newSegment,
        trigger_type: 'score_threshold',
        trigger_metadata: { score: newScore },
        created_at: new Date().toISOString()
      }]);

      // Trigger segment-based automation
      await this.triggerAutomationRules('segment_change', {
        lead_id: leadId,
        from_segment: currentSegment,
        to_segment: newSegment,
        score: newScore
      });
    }
  }

  // ==========================================
  // DRIP CAMPAIGN SYSTEM
  // ==========================================

  /**
   * Create a new drip campaign
   */
  async createDripCampaign(campaign: DripCampaign): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('drip_campaigns')
        .insert([{
          name: campaign.name,
          description: campaign.description,
          trigger_type: campaign.trigger_type,
          target_criteria: campaign.target_criteria,
          is_active: campaign.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      const campaignId = data.id;

      // Create campaign steps
      for (const step of campaign.steps) {
        await this.supabase.from('drip_campaign_steps').insert([{
          campaign_id: campaignId,
          step_number: step.step_number,
          step_type: step.step_type,
          delay_hours: step.delay_hours,
          conditions: step.conditions || {},
          email_template_id: step.email_template_id,
          subject: step.subject,
          content: step.content,
          n8n_action: step.n8n_action || {},
          metadata: step.metadata || {},
          is_active: step.is_active,
          created_at: new Date().toISOString()
        }]);
      }

      return campaignId;
    } catch (error) {
      console.error('Failed to create drip campaign:', error);
      throw error;
    }
  }

  /**
   * Enroll user in drip campaign
   */
  async enrollUserInDripCampaign(
    campaignId: string, 
    userId: string, 
    leadId?: number,
    startStep: number = 1
  ): Promise<void> {
    try {
      // Check if already enrolled
      const { data: existing } = await this.supabase
        .from('drip_enrollments')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        console.log('User already enrolled in drip campaign');
        return;
      }

      // Get first step to calculate next action date
      const { data: firstStep } = await this.supabase
        .from('drip_campaign_steps')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('step_number', startStep)
        .single();

      const nextActionDate = new Date();
      if (firstStep) {
        nextActionDate.setHours(nextActionDate.getHours() + firstStep.delay_hours);
      }

      // Create enrollment
      await this.supabase.from('drip_enrollments').insert([{
        campaign_id: campaignId,
        user_id: userId,
        lead_id: leadId,
        current_step: startStep,
        enrollment_date: new Date().toISOString(),
        next_action_date: nextActionDate.toISOString(),
        status: 'active',
        metadata: {}
      }]);

      console.log(`User ${userId} enrolled in drip campaign ${campaignId}`);
    } catch (error) {
      console.error('Failed to enroll user in drip campaign:', error);
      throw error;
    }
  }

  /**
   * Process drip campaign step execution
   */
  async processDripCampaignStep(enrollmentId: string): Promise<void> {
    try {
      // Get enrollment details
      const { data: enrollment } = await this.supabase
        .from('drip_enrollments')
        .select(`
          *,
          drip_campaigns(*),
          leads(*)
        `)
        .eq('id', enrollmentId)
        .single();

      if (!enrollment || enrollment.status !== 'active') return;

      // Get current step
      const { data: step } = await this.supabase
        .from('drip_campaign_steps')
        .select('*')
        .eq('campaign_id', enrollment.campaign_id)
        .eq('step_number', enrollment.current_step)
        .single();

      if (!step || !step.is_active) return;

      // Execute step based on type
      let executionStatus = 'executed';
      let executionData: Record<string, any> = {};

      switch (step.step_type) {
        case 'email':
          await this.executeDripEmailStep(enrollment, step);
          break;
        case 'webhook':
          await this.executeDripWebhookStep(enrollment, step);
          break;
        case 'condition': {
          const conditionMet = await this.evaluateStepCondition(enrollment, step);
          if (!conditionMet) {
            executionStatus = 'skipped';
            executionData.reason = 'condition_not_met';
          }
          break;
        }
        case 'delay':
          // Delay steps are handled by scheduling
          break;
      }

      // Log execution
      await this.supabase.from('drip_execution_log').insert([{
        enrollment_id: enrollmentId,
        step_id: step.id,
        executed_at: new Date().toISOString(),
        status: executionStatus,
        execution_data: executionData
      }]);

      // Move to next step
      await this.advanceDripCampaignStep(enrollmentId, enrollment.current_step + 1);

    } catch (error) {
      console.error('Failed to process drip campaign step:', error);
      // Log error
      await this.supabase.from('drip_execution_log').insert([{
        enrollment_id: enrollmentId,
        executed_at: new Date().toISOString(),
        status: 'failed',
        error_message: error instanceof Error ? error.message : String(error)
      }]);
    }
  }

  /**
   * Execute email step in drip campaign
   */
  private async executeDripEmailStep(enrollment: any, step: DripCampaignStep): Promise<void> {
    try {
      // Get user email
      const userEmail = enrollment.leads?.email || enrollment.user_email;
      if (!userEmail) throw new Error('No email address found');

      // Prepare email data
      const emailData = {
        to: userEmail,
        subject: step.subject || 'Update from SKRBL AI',
        content: step.content || '',
        template_id: step.email_template_id,
        campaign_id: enrollment.campaign_id,
        enrollment_id: enrollment.id
      };

      // Send via existing email system
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'drip_campaign',
          ...emailData
        })
      });

      if (!response.ok) {
        throw new Error(`Email send failed: ${response.status}`);
      }

      console.log(`Drip email sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to execute drip email step:', error);
      throw error;
    }
  }

  /**
   * Execute webhook step in drip campaign
   */
  private async executeDripWebhookStep(enrollment: any, step: DripCampaignStep): Promise<void> {
    try {
      const webhookUrl = step.n8n_action?.webhook_url;
      if (!webhookUrl) throw new Error('No webhook URL configured');

      const webhookData = {
        enrollment_id: enrollment.id,
        user_id: enrollment.user_id,
        lead_id: enrollment.lead_id,
        campaign_id: enrollment.campaign_id,
        step_number: step.step_number,
        metadata: step.metadata || {}
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }

      console.log(`Drip webhook executed for enrollment ${enrollment.id}`);
    } catch (error) {
      console.error('Failed to execute drip webhook step:', error);
      throw error;
    }
  }

  /**
   * Evaluate step conditions
   */
  private async evaluateStepCondition(enrollment: any, step: DripCampaignStep): Promise<boolean> {
    const conditions = step.conditions || {};
    
    // Example condition evaluations
    if (conditions.min_score) {
      const leadScore = enrollment.leads?.lead_score || 0;
      if (leadScore < conditions.min_score) return false;
    }

    if (conditions.required_activity) {
      const { data: activities } = await this.supabase
        .from('lead_scoring_activities')
        .select('*')
        .eq('lead_id', enrollment.lead_id)
        .eq('activity_type', conditions.required_activity);
      
      if (!activities || activities.length === 0) return false;
    }

    return true;
  }

  /**
   * Advance drip campaign to next step
   */
  private async advanceDripCampaignStep(enrollmentId: string, nextStep: number): Promise<void> {
    try {
      // Get enrollment details
      const { data: enrollment } = await this.supabase
        .from('drip_enrollments')
        .select('campaign_id')
        .eq('id', enrollmentId)
        .single();

      if (!enrollment) {
        // Enrollment record missing; nothing to advance
        return;
      }

      // Get first step to calculate next action date
      const { data: nextStepData } = await this.supabase
        .from('drip_campaign_steps')
        .select('*')
        .eq('campaign_id', enrollment.campaign_id)
        .eq('step_number', nextStep)
        .single();

      const nextActionDate = new Date();
      if (nextStepData) {
        nextActionDate.setHours(nextActionDate.getHours() + nextStepData.delay_hours);
      }

      // Update enrollment
      await this.supabase
        .from('drip_enrollments')
        .update({
          current_step: nextStep,
          next_action_date: nextActionDate.toISOString()
        })
        .eq('id', enrollmentId);
    } catch (error) {
      console.error('Failed to advance drip campaign step:', error);
      throw error;
    }
  }

  // ==========================================
  // BEHAVIORAL AUTOMATION TRIGGERS
  // ==========================================

  /**
   * Create automation rule
   */
  async createAutomationRule(rule: AutomationRule): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('automation_rules')
        .insert([{
          name: rule.name,
          description: rule.description,
          trigger_event: rule.trigger_event,
          trigger_conditions: rule.trigger_conditions,
          action_type: rule.action_type,
          action_config: rule.action_config,
          delay_minutes: rule.delay_minutes,
          is_active: rule.is_active,
          priority: rule.priority,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to create automation rule:', error);
      throw error;
    }
  }

  /**
   * Trigger automation rules for specific event
   */
  async triggerAutomationRules(event: string, eventData: Record<string, any>): Promise<void> {
    try {
      // Get matching automation rules
      const { data: rules } = await this.supabase
        .from('automation_rules')
        .select('*')
        .eq('trigger_event', event)
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (!rules || rules.length === 0) return;

      for (const rule of rules) {
        // Check if conditions are met
        const conditionsMet = this.evaluateRuleConditions(rule.trigger_conditions, eventData);
        
        if (conditionsMet) {
          await this.executeAutomationAction(rule, eventData);
        }
      }
    } catch (error) {
      console.error('Failed to trigger automation rules:', error);
    }
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateRuleConditions(
    conditions: Record<string, any>, 
    eventData: Record<string, any>
  ): boolean {
    for (const [key, expectedValue] of Object.entries(conditions)) {
      const actualValue = eventData[key];
      
      if (typeof expectedValue === 'object' && expectedValue.operator) {
        // Handle complex conditions like { operator: 'gte', value: 50 }
        switch (expectedValue.operator) {
          case 'gte':
            if (actualValue < expectedValue.value) return false;
            break;
          case 'lte':
            if (actualValue > expectedValue.value) return false;
            break;
          case 'eq':
            if (actualValue !== expectedValue.value) return false;
            break;
          case 'in':
            if (!expectedValue.value.includes(actualValue)) return false;
            break;
        }
      } else {
        // Simple equality check
        if (actualValue !== expectedValue) return false;
      }
    }
    return true;
  }

  /**
   * Execute automation action
   */
  private async executeAutomationAction(
    rule: AutomationRule, 
    eventData: Record<string, any>
  ): Promise<void> {
    try {
      const executionStart = Date.now();
      let executionStatus = 'executed';
      let resultData: Record<string, any> = {};

      switch (rule.action_type) {
        case 'send_email':
          await this.executeEmailAction(rule.action_config, eventData);
          break;
        case 'add_to_campaign':
          await this.executeAddToCampaignAction(rule.action_config, eventData);
          break;
        case 'update_score':
          await this.executeUpdateScoreAction(rule.action_config, eventData);
          break;
        case 'change_segment':
          await this.executeChangeSegmentAction(rule.action_config, eventData);
          break;
        case 'trigger_n8n':
          resultData = await this.executeTriggerN8nAction(rule.action_config, eventData);
          break;
      }

      // Log execution
      await this.supabase.from('automation_executions').insert([{
        rule_id: rule.id,
        user_id: eventData.user_id,
        lead_id: eventData.lead_id,
        trigger_data: eventData,
        execution_date: new Date().toISOString(),
        status: executionStatus,
        result_data: resultData,
        execution_time_ms: Date.now() - executionStart
      }]);

    } catch (error) {
      console.error('Failed to execute automation action:', error);
      
      // Log error
      await this.supabase.from('automation_executions').insert([{
        rule_id: rule.id,
        user_id: eventData.user_id,
        lead_id: eventData.lead_id,
        trigger_data: eventData,
        execution_date: new Date().toISOString(),
        status: 'failed',
        error_message: error instanceof Error ? error.message : String(error)
      }]);
    }
  }

  /**
   * Execute email action
   */
  private async executeEmailAction(config: Record<string, any>, eventData: Record<string, any>): Promise<void> {
    // Implementation for sending automated emails
    const emailData = {
      to: config.recipient || eventData.email,
      subject: config.subject || 'Automated Message',
      template: config.template || 'default',
      templateData: { ...eventData, ...config.templateData }
    };

    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'automation', ...emailData })
    });
  }

  /**
   * Execute add to campaign action
   */
  private async executeAddToCampaignAction(config: Record<string, any>, eventData: Record<string, any>): Promise<void> {
    const campaignId = config.campaign_id;
    const userId = eventData.user_id;
    const leadId = eventData.lead_id;

    if (campaignId && userId) {
      await this.enrollUserInDripCampaign(campaignId, userId, leadId);
    }
  }

  /**
   * Execute update score action
   */
  private async executeUpdateScoreAction(config: Record<string, any>, eventData: Record<string, any>): Promise<void> {
    const scoreChange = config.score_change || 0;
    const leadId = eventData.lead_id;

    if (leadId && scoreChange !== 0) {
      await this.recordLeadActivity({
        lead_id: leadId,
        user_id: eventData.user_id,
        activity_type: 'automation_score_update' as any,
        activity_value: `Automation: ${config.reason || 'Score update'}`,
        score_change: scoreChange,
        current_score: eventData.current_score || 0,
        metadata: { automation_rule: eventData.rule_id }
      });
    }
  }

  /**
   * Execute change segment action
   */
  private async executeChangeSegmentAction(config: Record<string, any>, eventData: Record<string, any>): Promise<void> {
    const newSegment = config.new_segment;
    const leadId = eventData.lead_id;

    if (leadId && newSegment) {
      await this.supabase
        .from('leads')
        .update({ segment: newSegment })
        .eq('id', leadId);
    }
  }

  /**
   * Execute trigger N8N action
   */
  private async executeTriggerN8nAction(config: Record<string, any>, eventData: Record<string, any>): Promise<Record<string, any>> {
    const webhookUrl = config.webhook_url;
    
    if (!webhookUrl) {
      throw new Error('No webhook URL configured for N8N trigger');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...eventData, ...config.payload })
    });

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.status}`);
    }

    return { webhook_response: await response.json() };
  }

  // ==========================================
  // LEAD MAGNET SYSTEM
  // ==========================================

  /**
   * Create lead magnet
   */
  async createLeadMagnet(magnet: LeadMagnet): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('lead_magnets')
        .insert([{
          title: magnet.title,
          description: magnet.description,
          magnet_type: magnet.magnet_type,
          file_url: magnet.file_url,
          thumbnail_url: magnet.thumbnail_url,
          landing_page_url: magnet.landing_page_url,
          download_count: 0,
          conversion_rate: 0.0,
          target_segment: magnet.target_segment,
          value_score: magnet.value_score,
          is_active: magnet.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to create lead magnet:', error);
      throw error;
    }
  }

  /**
   * Track lead magnet download
   */
  async trackLeadMagnetDownload(
    magnetId: string,
    userId: string,
    leadId: number,
    utmData?: { source?: string; medium?: string; campaign?: string },
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Record download
      await this.supabase.from('lead_magnet_downloads').insert([{
        magnet_id: magnetId,
        user_id: userId,
        lead_id: leadId,
        download_date: new Date().toISOString(),
        utm_source: utmData?.source,
        utm_medium: utmData?.medium,
        utm_campaign: utmData?.campaign,
        referrer: metadata?.referrer,
        ip_address: metadata?.ip_address,
        user_agent: metadata?.user_agent,
        follow_up_sent: false,
        metadata: metadata || {}
      }]);

      // Update download count
      await this.supabase.rpc('increment', {
        table_name: 'lead_magnets',
        row_id: magnetId,
        column_name: 'download_count'
      });

      // Score the download activity
      await this.recordLeadActivity({
        lead_id: leadId,
        user_id: userId,
        activity_type: 'download',
        activity_value: magnetId,
        score_change: 20,
        current_score: 0, // Will be calculated
        metadata: { magnet_id: magnetId, utm_data: utmData }
      });

      // Trigger follow-up automation
      await this.triggerAutomationRules('lead_magnet_download', {
        user_id: userId,
        lead_id: leadId,
        magnet_id: magnetId,
        utm_data: utmData
      });

    } catch (error) {
      console.error('Failed to track lead magnet download:', error);
      throw error;
    }
  }

  // ==========================================
  // ANALYTICS & REPORTING
  // ==========================================

  /**
   * Get marketing automation analytics
   */
  async getMarketingAnalytics(dateRange?: { start: string; end: string }): Promise<Record<string, any>> {
    try {
      const dateFilter = dateRange ? 
        `created_at >= '${dateRange.start}' AND created_at <= '${dateRange.end}'` : 
        `created_at >= NOW() - INTERVAL '30 days'`;

      // Lead generation metrics
      const { data: leadMetrics } = await this.supabase
        .from('leads')
        .select('lead_score, segment, lead_source, created_at')
        .order('created_at', { ascending: false });

      // Campaign performance
      const { data: campaignMetrics } = await this.supabase
        .from('campaign_metrics')
        .select('*')
        .order('metric_date', { ascending: false });

      // Drip campaign performance
      const { data: dripMetrics } = await this.supabase
        .from('drip_enrollments')
        .select('status, completion_rate, created_at')
        .order('created_at', { ascending: false });

      // Lead magnet performance
      const { data: magnetMetrics } = await this.supabase
        .from('lead_magnets')
        .select('title, download_count, conversion_rate')
        .order('download_count', { ascending: false });

      // Automation execution stats
      const { data: automationMetrics } = await this.supabase
        .from('automation_executions')
        .select('status, execution_time_ms, created_at')
        .order('execution_date', { ascending: false });

      return {
        overview: {
          total_leads: leadMetrics?.length || 0,
          avg_lead_score: leadMetrics && leadMetrics.length > 0 ?
            leadMetrics.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / leadMetrics.length : 0,
          hot_leads: leadMetrics?.filter(lead => lead.segment === 'hot').length || 0,
          mql_count: leadMetrics?.filter(lead => lead.segment === 'mql').length || 0
        },
        campaigns: {
          total_campaigns: campaignMetrics?.length || 0,
          avg_conversion_rate: this.calculateAvgConversionRate(campaignMetrics || []),
          total_emails_sent: campaignMetrics?.reduce((sum, c) => sum + (c.emails_sent || 0), 0) || 0
        },
        drip_campaigns: {
          active_enrollments: dripMetrics?.filter(d => d.status === 'active').length || 0,
          avg_completion_rate: dripMetrics && dripMetrics.length > 0 ?
            dripMetrics.reduce((sum, d) => sum + (d.completion_rate || 0), 0) / dripMetrics.length : 0,
          completed_campaigns: dripMetrics?.filter(d => d.status === 'completed').length || 0
        },
        lead_magnets: {
          total_downloads: magnetMetrics?.reduce((sum, m) => sum + (m.download_count || 0), 0) || 0,
          top_performers: magnetMetrics?.slice(0, 5) || []
        },
        automation: {
          total_executions: automationMetrics?.length || 0,
          success_rate: (automationMetrics?.filter(a => a.status === 'executed').length || 0) / (automationMetrics?.length || 1) * 100,
          avg_execution_time: automationMetrics && automationMetrics.length > 0 ?
            automationMetrics.reduce((sum, a) => sum + (a.execution_time_ms || 0), 0) / automationMetrics.length : 0
        }
      };
    } catch (error) {
      console.error('Failed to get marketing analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate average conversion rate for campaigns
   */
  private calculateAvgConversionRate(campaignMetrics: any[]): number {
    if (campaignMetrics.length === 0) return 0;
    
    const totalSent = campaignMetrics.reduce((sum, c) => sum + (c.emails_sent || 0), 0);
    const totalConversions = campaignMetrics.reduce((sum, c) => sum + (c.conversions || 0), 0);
    
    return totalSent > 0 ? (totalConversions / totalSent) * 100 : 0;
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Get leads by segment
   */
  async getLeadsBySegment(segment: string): Promise<Lead[]> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('segment', segment)
      .order('lead_score', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get pending drip campaign actions
   */
  async getPendingDripActions(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('drip_enrollments')
      .select('*')
      .eq('status', 'active')
      .lte('next_action_date', new Date().toISOString())
      .order('next_action_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Clean up completed campaigns
   */
  async cleanupCompletedCampaigns(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.supabase
      .from('drip_enrollments')
      .delete()
      .eq('status', 'completed')
      .lt('completed_at', thirtyDaysAgo.toISOString());
  }
}

export const marketingAutomation = new MarketingAutomationManager(); 