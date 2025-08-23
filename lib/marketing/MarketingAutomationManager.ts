import { getOptionalServerSupabase } from '@/lib/supabase/server';

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
  private getClient() {
    return getOptionalServerSupabase();
  }

  private ensure() {
    const c = this.getClient();
    if (!c) {
      console.warn('[MarketingAutomationManager] Supabase not configured – skipping op');
    }
    return c;
  }

  private nowIso() {
    return new Date().toISOString();
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
        scoreValue = Math.floor(scoreValue * 0.5);
      }
      
      totalScore += scoreValue;
    }

    const supabase = this.ensure();
    if (!supabase) return Math.min(totalScore, 100);

    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (lead) {
      // Industry-based scoring
      const industryBonus: Record<string, number> = {
        'SaaS': 20,
        'Technology': 15,
        'Consultant': 15,
        'E-commerce': 10,
      };
      totalScore += industryBonus[lead.industry ?? ''] || 0;

      // Timeline urgency scoring
      const timelineBonus: Record<string, number> = {
        'immediate': 30,
        'within_month': 20,
        'within_quarter': 10,
        'within_year': 5,
      };
      totalScore += timelineBonus[lead.timeline ?? ''] || 0;

      // Company size scoring
      const sizeBonus: Record<string, number> = {
        'enterprise': 25,
        'large': 20,
        'medium': 15,
        'small': 10,
        'startup': 5,
      };
      totalScore += sizeBonus[lead.company_size ?? ''] || 0;
    }

    return Math.min(totalScore, 100);
  }

  /**
   * Update lead score and trigger segment transitions
   */
  async updateLeadScore(leadId: number, newScore: number): Promise<void> {
    const supabase = this.ensure();
    if (!supabase) return;

    try {
      const { data: lead } = await supabase
        .from('leads')
        .select('lead_score, segment')
        .eq('id', leadId)
        .single();

      if (!lead) return;

      await supabase
        .from('leads')
        .update({ 
          lead_score: newScore,
          last_activity_date: this.nowIso()
        })
        .eq('id', leadId);

      await this.checkSegmentTransition(leadId, newScore);
    } catch (error) {
      console.error('Failed to update lead score:', error);
      throw error;
    }
  }

  /**
   * Check and handle segment transitions based on score
   */
  private async checkSegmentTransition(leadId: number, newScore: number): Promise<void> {
    const supabase = this.ensure();
    if (!supabase) return;

    const { data: lead } = await supabase
      .from('leads')
      .select('segment')
      .eq('id', leadId)
      .single();

    if (!lead) return;

    let newSegment = lead.segment;
    const currentSegment = lead.segment;

    if (newScore >= 80) newSegment = 'hot';
    else if (newScore >= 60) newSegment = 'warm';
    else if (newScore >= 40) newSegment = 'mql';
    else newSegment = 'cold';

    if (newSegment !== currentSegment) {
      await supabase
        .from('leads')
        .update({ segment: newSegment })
        .eq('id', leadId);

      await supabase.from('lead_lifecycle_transitions').insert([{
        lead_id: leadId,
        from_stage: currentSegment,
        to_stage: newSegment,
        trigger_type: 'score_threshold',
        trigger_metadata: { score: newScore },
        created_at: this.nowIso()
      }]);

      await this.triggerAutomationRules('segment_change', {
        lead_id: leadId,
        from_segment: currentSegment,
        to_segment: newSegment,
        score: newScore
      });
    }
  }

  /**
   * Record lead scoring activity
   */
  async recordLeadActivity(activity: LeadScoringActivity): Promise<string | undefined> {
    const supabase = this.ensure();
    if (!supabase) return undefined;

    try {
      const { data, error } = await supabase
        .from('lead_scoring_activities')
        .insert([{
          ...activity,
          created_at: this.nowIso()
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to record lead activity:', error);
      throw error;
    }
  }

  // ==========================================
  // DRIP CAMPAIGNS
  // ==========================================

  /**
   * Create a new drip campaign
   */
  async createDripCampaign(campaign: DripCampaign): Promise<string | undefined> {
    const supabase = this.ensure();
    if (!supabase) return undefined;

    try {
      const { data, error } = await supabase
        .from('drip_campaigns')
        .insert([{
          name: campaign.name,
          description: campaign.description,
          trigger_type: campaign.trigger_type,
          target_criteria: campaign.target_criteria,
          is_active: campaign.is_active,
          created_at: this.nowIso(),
          updated_at: this.nowIso()
        }])
        .select()
        .single();

      if (error) throw error;

      const campaignId = data.id;

      // Create campaign steps
      for (const step of campaign.steps) {
        await supabase.from('drip_campaign_steps').insert([{
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
          created_at: this.nowIso()
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
    const supabase = this.ensure();
    if (!supabase) return;

    try {
      // Check if already enrolled
      const { data: existing } = await supabase
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
      const { data: firstStep } = await supabase
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
      await supabase.from('drip_enrollments').insert([{
        campaign_id: campaignId,
        user_id: userId,
        lead_id: leadId,
        current_step: startStep,
        enrollment_date: this.nowIso(),
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
    const supabase = this.ensure();
    if (!supabase) return;

    try {
      // Get enrollment details
      const { data: enrollment } = await supabase
        .from('drip_enrollments')
        .select('*')
        .eq('id', enrollmentId)
        .single();

      if (!enrollment || enrollment.status !== 'active') return;

      // Get campaign step
      const { data: step } = await supabase
        .from('drip_campaign_steps')
        .select('*')
        .eq('campaign_id', enrollment.campaign_id)
        .eq('step_number', enrollment.current_step)
        .single();

      if (!step) {
        // Campaign completed
        await supabase
          .from('drip_enrollments')
          .update({
            status: 'completed',
            completed_at: this.nowIso()
          })
          .eq('id', enrollmentId);
        return;
      }

      // Execute step based on type
      switch (step.step_type) {
        case 'email':
          await this.sendDripEmail(enrollment, step);
          break;
        case 'webhook':
          await this.executeWebhook(step);
          break;
        case 'delay':
          // Just move to next step after delay
          break;
      }

      // Move to next step
      const nextStep = enrollment.current_step + 1;
      const nextActionDate = new Date();
      
      const { data: nextStepData } = await supabase
        .from('drip_campaign_steps')
        .select('delay_hours')
        .eq('campaign_id', enrollment.campaign_id)
        .eq('step_number', nextStep)
        .single();

      if (nextStepData) {
        nextActionDate.setHours(nextActionDate.getHours() + nextStepData.delay_hours);
      }

      await supabase
        .from('drip_enrollments')
        .update({
          current_step: nextStep,
          next_action_date: nextActionDate.toISOString(),
          last_step_executed: this.nowIso()
        })
        .eq('id', enrollmentId);

    } catch (error) {
      console.error('Failed to process drip campaign step:', error);
      throw error;
    }
  }

  private async sendDripEmail(enrollment: any, step: any): Promise<void> {
    if (!step.subject || !step.content) return;

    // Implementation would integrate with email service
    console.log(`Sending drip email to ${enrollment.user_id}: ${step.subject}`);
  }

  private async executeWebhook(step: any): Promise<void> {
    // Centralized N8N relay usage
    const agentId = step.n8n_action?.agent_id || step.agent_id;
    if (!agentId) {
      console.error('[MarketingAutomationManager] No agentId provided for N8N workflow trigger');
      return;
    }
    try {
      const relayUrl = `/api/agents/${agentId}/trigger-n8n`;
      await fetch(relayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step.n8n_action.payload || {})
      });
    } catch (error) {
      console.error('[MarketingAutomationManager] Relay workflow trigger failed:', error);
    }
  }

  /**
   * Get pending drip campaign actions
   */
  async getPendingDripActions(): Promise<any[]> {
    const supabase = this.ensure();
    if (!supabase) return [];

    const { data, error } = await supabase
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
    const supabase = this.ensure();
    if (!supabase) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await supabase
      .from('drip_enrollments')
      .delete()
      .eq('status', 'completed')
      .lt('completed_at', thirtyDaysAgo.toISOString());
  }

  // ==========================================
  // AUTOMATION RULES
  // ==========================================

  /**
   * Create automation rule
   */
  async createAutomationRule(rule: AutomationRule): Promise<string | undefined> {
    const supabase = this.ensure();
    if (!supabase) return undefined;

    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert([{
          ...rule,
          created_at: this.nowIso(),
          updated_at: this.nowIso()
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
   * Trigger automation rules for an event
   */
  async triggerAutomationRules(eventType: string, eventData: Record<string, any>): Promise<void> {
    const supabase = this.ensure();
    if (!supabase) return;

    try {
      const { data: rules } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('trigger_event', eventType)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (!rules) return;

      for (const rule of rules) {
        await this.executeAutomationRule(rule, eventData);
      }
    } catch (error) {
      console.error('Failed to trigger automation rules:', error);
    }
  }

  private async executeAutomationRule(rule: any, eventData: Record<string, any>): Promise<void> {
    const supabase = this.ensure();
    if (!supabase) return;

    try {
      // Add to automation triggers queue
      await supabase.from('automation_triggers').insert([{
        rule_id: rule.id,
        trigger_data: eventData,
        status: 'pending',
        scheduled_for: new Date(Date.now() + (rule.delay_minutes * 60000)).toISOString(),
        created_at: this.nowIso()
      }]);
    } catch (error) {
      console.error('Failed to execute automation rule:', error);
    }
  }

  // ==========================================
  // LEAD MAGNETS
  // ==========================================

  /**
   * Create lead magnet
   */
  async createLeadMagnet(magnet: LeadMagnet): Promise<string | undefined> {
    const supabase = this.ensure();
    if (!supabase) return undefined;

    try {
      const { data, error } = await supabase
        .from('lead_magnets')
        .insert([{
          ...magnet,
          created_at: this.nowIso(),
          updated_at: this.nowIso()
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
  async trackLeadMagnetDownload(magnetId: string, leadId: number, userId?: string): Promise<void> {
    const supabase = this.ensure();
    if (!supabase) return;

    try {
      await supabase.from('lead_magnet_downloads').insert([{
        magnet_id: magnetId,
        lead_id: leadId,
        user_id: userId,
        downloaded_at: this.nowIso()
      }]);

      // Update download count
      await supabase.rpc('increment_download_count', { magnet_id: magnetId });

      // Record activity
      await this.recordLeadActivity({
        lead_id: leadId,
        activity_type: 'download',
        score_change: 20,
        current_score: 0 // Will be updated by calculateLeadScore
      });
    } catch (error) {
      console.error('Failed to track lead magnet download:', error);
    }
  }

  // ==========================================
  // LEAD MANAGEMENT
  // ==========================================

  /**
   * Create or update lead
   */
  async createLead(leadData: Partial<Lead>): Promise<number | undefined> {
    const supabase = this.ensure();
    if (!supabase) return undefined;

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          ...leadData,
          lead_score: leadData.lead_score || 0,
          segment: leadData.segment || 'cold',
          lifecycle_stage: leadData.lifecycle_stage || 'subscriber',
          first_touch_date: this.nowIso(),
          last_activity_date: this.nowIso(),
          lead_tags: leadData.lead_tags || [],
          created_at: this.nowIso()
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  }

  /**
   * Get lead by email
   */
  async getLeadByEmail(email: string): Promise<Lead | null> {
    const supabase = this.ensure();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get lead activities
   */
  async getLeadActivities(leadId: number): Promise<LeadScoringActivity[]> {
    const supabase = this.ensure();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('lead_scoring_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  }

  // ==========================================
  // ANALYTICS & REPORTING
  // ==========================================

  /**
   * Get marketing analytics dashboard data
   */
  async getMarketingAnalytics(): Promise<{
    totalLeads: number;
    newLeads: number;
    avgLeadScore: number;
    segmentDistribution: Record<string, number>;
    sourceCounts: Record<string, number>;
    dripCampaignPerformance: any[];
    leadMagnetPerformance: any[];
  }> {
    const supabase = this.ensure();
    if (!supabase) {
      return {
        totalLeads: 0,
        newLeads: 0,
        avgLeadScore: 0,
        segmentDistribution: {},
        sourceCounts: {},
        dripCampaignPerformance: [],
        leadMagnetPerformance: []
      };
    }

    try {
      // Get leads data
      const { data: leads } = await supabase
        .from('leads')
        .select('*');

      const totalLeads = leads?.length || 0;
      
      // New leads (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newLeads = leads?.filter((lead: any) => 
        new Date(lead.created_at) >= sevenDaysAgo
      ).length || 0;

      // Segment distribution
      const segmentDistribution = leads?.reduce((acc: Record<string, number>, lead: any) => {
        const segment = lead.segment || 'unknown';
        acc[segment] = (acc[segment] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Source counts
      const sourceCounts = leads?.reduce((acc: Record<string, number>, lead: any) => {
        const source = lead.lead_source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Average lead score
      const avgLeadScore = leads?.reduce((sum: number, lead: any) => sum + (lead.lead_score || 0), 0) / (leads?.length || 1) || 0;

      // Drip campaign performance
      const { data: enrollments } = await supabase
        .from('drip_enrollments')
        .select('*, drip_campaigns(name)');

      const dripCampaignPerformance = enrollments?.reduce((acc: any[], enrollment: any) => {
        const campaignName = enrollment.drip_campaigns?.name || 'Unknown Campaign';
        let campaign = acc.find((c: any) => c.name === campaignName);
        if (!campaign) {
          campaign = { name: campaignName, enrollments: 0, completions: 0 };
          acc.push(campaign);
        }
        campaign.enrollments++;
        if (enrollment.status === 'completed') campaign.completions++;
        return acc;
      }, [] as any[]) || [];

      // Lead magnet performance
      const { data: downloads } = await supabase
        .from('lead_magnet_downloads')
        .select('*, lead_magnets(name, type)');

      const leadMagnetPerformance = downloads?.reduce((acc: any[], download: any) => {
        const magnetName = download.lead_magnets?.name || 'Unknown Magnet';
        let magnet = acc.find((m: any) => m.name === magnetName);
        if (!magnet) {
          magnet = { name: magnetName, downloads: 0, type: download.lead_magnets?.type || 'unknown' };
          acc.push(magnet);
        }
        magnet.downloads++;
        return acc;
      }, [] as any[]) || [];

      return {
        totalLeads,
        newLeads,
        avgLeadScore,
        segmentDistribution,
        sourceCounts,
        dripCampaignPerformance,
        leadMagnetPerformance
      };
    } catch (error) {
      console.error('Failed to get marketing analytics:', error);
      return {
        totalLeads: 0,
        newLeads: 0,
        avgLeadScore: 0,
        segmentDistribution: {},
        sourceCounts: {},
        dripCampaignPerformance: [],
        leadMagnetPerformance: []
      };
    }
  }
}
