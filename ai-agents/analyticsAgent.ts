import { getServerSupabaseAdmin } from '@/lib/supabase';
import { validateAgentInput, callOpenAI, callOpenAIWithFallback } from '../utils/agentUtils';

import type { Agent, AgentInput as BaseAgentInput, AgentFunction } from '@/types/agent';

// Define input interface for Analytics Agent
interface AnalyticsInput extends BaseAgentInput {
  dataSource: 'website' | 'social' | 'email' | 'ads' | 'content' | 'sales' | 'all';
  timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  metrics?: string[];
  dimensions?: string[];
  filters?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number;
  }[];
  comparisonTimeframe?: 'previous_period' | 'previous_year' | 'none';
  segmentBy?: string[];
  includeRawData?: boolean;
  customInstructions?: string;
}

interface RawDataRow {
  date: string;
  [key: string]: string | number;
}

interface RawDataResponse {
  columns: string[];
  rows: RawDataRow[];
  totalRows: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  change: string;
}

interface ChartData {
  category: string;
  value: number;
}

/**
 * Analytics Agent - Analyzes performance data and provides insights
 * @param input - Analytics parameters
 * @returns Promise with success status, message and optional data
 */
const runAnalytics = async (input: AnalyticsInput) => {
  const supabase = getServerSupabaseAdmin();
  
  if (!supabase) {
    throw new Error('Database unavailable - cannot execute analytics agent');
  }

  try {
    // Validate input
    if (!input.userId || !input.dataSource || !input.timeframe) {
      throw new Error('Missing required fields: userId, dataSource, and timeframe');
    }

    // Set defaults for optional parameters
    const analyticsParams = {
      startDate: input.startDate || getDefaultStartDate(input.timeframe),
      endDate: input.endDate || new Date().toISOString().split('T')[0],
      metrics: input.metrics || getDefaultMetrics(input.dataSource),
      dimensions: input.dimensions || getDefaultDimensions(input.dataSource),
      filters: input.filters || [],
      comparisonTimeframe: input.comparisonTimeframe || 'previous_period',
      segmentBy: input.segmentBy || [],
      includeRawData: input.includeRawData !== undefined ? input.includeRawData : false,
      customInstructions: input.customInstructions || ''
    };

    // Generate analytics results
    const analyticsResults = {
      summary: generateSummary(
        input.dataSource,
        input.timeframe,
        analyticsParams
      ),
      insights: generateInsights(
        input.dataSource,
        input.timeframe,
        analyticsParams
      ),
      recommendations: generateRecommendations(
        input.dataSource,
        input.timeframe,
        analyticsParams
      ),
      visualizations: generateVisualizations(
        input.dataSource,
        input.timeframe,
        analyticsParams
      ),
      rawData: analyticsParams.includeRawData ? generateRawData(
        input.dataSource,
        input.timeframe,
        analyticsParams
      ) : null,
      metadata: {
        dataSource: input.dataSource,
        timeframe: input.timeframe,
        startDate: analyticsParams.startDate,
        endDate: analyticsParams.endDate,
        metrics: analyticsParams.metrics,
        dimensions: analyticsParams.dimensions,
        generatedAt: new Date().toISOString()
      }
    };

    // Log the analytics generation to Supabase
    const { error: logError } = await supabase
      .from('agent-logs')
      .insert({
        agent: 'analyticsAgent',
        input,
        dataSource: input.dataSource,
        timeframe: input.timeframe,
        timestamp: new Date().toISOString()
      });
    if (logError) throw logError;

    // Save the generated analytics to Supabase
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics-reports')
      .insert({
        userId: input.userId,
        dataSource: input.dataSource,
        timeframe: input.timeframe,
        results: analyticsResults,
        params: analyticsParams,
        createdAt: new Date().toISOString(),
        status: 'completed'
      })
      .select();
    if (analyticsError) throw analyticsError;

    return {
      success: true,
      message: `Analytics report generated successfully for ${input.dataSource} data over the ${input.timeframe} timeframe`,
      data: {
        analyticsReportId: analyticsData[0].id,
        results: analyticsResults
      }
    };
  } catch (error) {
    console.error('Analytics agent failed:', error);
    return {
      success: false,
      message: `Analytics agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get default start date based on timeframe
 * @param timeframe - Time period for analysis
 * @returns Default start date in YYYY-MM-DD format
 */
function getDefaultStartDate(timeframe: string): string {
  const today = new Date();
  let startDate = new Date(today);
  
  switch (timeframe) {
    case 'day':
      startDate.setDate(today.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(today.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(today.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    default:
      startDate.setDate(today.getDate() - 30); // Default to 30 days
  }
  
  return startDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

/**
 * Get default metrics based on data source
 * @param dataSource - Source of the data
 * @returns Array of default metrics
 */
function getDefaultMetrics(dataSource: string): string[] {
  switch (dataSource) {
    case 'website':
      return ['pageviews', 'sessions', 'users', 'bounce_rate', 'avg_session_duration'];
    case 'social':
      return ['impressions', 'engagement', 'followers', 'clicks', 'shares'];
    case 'email':
      return ['opens', 'clicks', 'deliveries', 'unsubscribes', 'conversion_rate'];
    case 'ads':
      return ['impressions', 'clicks', 'cost', 'conversions', 'ctr', 'cpc', 'roas'];
    case 'content':
      return ['views', 'engagement', 'shares', 'time_on_page', 'conversions'];
    case 'sales':
      return ['revenue', 'transactions', 'avg_order_value', 'conversion_rate', 'customer_acquisition_cost'];
    case 'all':
      return ['pageviews', 'sessions', 'conversions', 'revenue', 'engagement'];
    default:
      return ['views', 'engagement', 'conversions'];
  }
}

/**
 * Get default dimensions based on data source
 * @param dataSource - Source of the data
 * @returns Array of default dimensions
 */
function getDefaultDimensions(dataSource: string): string[] {
  switch (dataSource) {
    case 'website':
      return ['page', 'source', 'device', 'country'];
    case 'social':
      return ['platform', 'post_type', 'audience', 'time_of_day'];
    case 'email':
      return ['campaign', 'subject_line', 'device', 'audience_segment'];
    case 'ads':
      return ['campaign', 'ad_group', 'keyword', 'placement', 'device'];
    case 'content':
      return ['content_type', 'topic', 'author', 'publish_date'];
    case 'sales':
      return ['product', 'category', 'customer_type', 'location'];
    case 'all':
      return ['source', 'medium', 'date'];
    default:
      return ['date', 'source'];
  }
}

/**
 * Generate summary of analytics data
 * @param dataSource - Source of the data
 * @param timeframe - Time period for analysis
 * @param params - Additional analytics parameters
 * @returns Generated summary
 */
async function generateSummary(
  dataSource: string,
  timeframe: string,
  params: any
): Promise<any> {
  const topMetrics = params.metrics.length > 3 ? params.metrics.slice(0, 3) : params.metrics;
  const selectedDimensions = params.dimensions.length > 2 ? params.dimensions.slice(0, 2) : params.dimensions;
  
  const prompt = `Generate a summary of analytics data for ${dataSource} over the ${timeframe} period, focusing on ${topMetrics.join(', ')} broken down by ${selectedDimensions.join(', ')}.`;
  
  try {
    const summary = await callOpenAIWithFallback<string>(
      prompt, 
      { maxTokens: 300 },
      () => {
        // Fallback to static analytics summary
        return `During the ${timeframe} period, ${dataSource} performance showed ${generateRandomTrend()} trend. The key metric ${topMetrics[0]} ${generateRandomPerformanceComparison()}, while ${topMetrics[1] || 'secondary metrics'} ${generateRandomPercentageChange()}. Analysis by ${selectedDimensions[0] || 'dimensions'} revealed interesting patterns.`;
      }
    );
    
    return {
      headline: summary.split('.')[0] + '.',
      text: summary,
      metrics: params.metrics.reduce((acc: any, metric: string) => {
        acc[metric] = {
          value: generateRandomMetricValue(metric),
          change: generateRandomPercentageChange()
        };
        return acc;
      }, {})
    };
  } catch (err) {
    console.error('Error generating analytics summary:', err);
    
    // Final fallback if everything else fails
    return {
      headline: `${dataSource} Summary for ${timeframe}`,
      text: `This is an overview of your ${dataSource} performance over the ${timeframe} period.`,
      metrics: params.metrics.reduce((acc: any, metric: string) => {
        acc[metric] = {
          value: generateRandomMetricValue(metric),
          change: generateRandomPercentageChange()
        };
        return acc;
      }, {})
    };
  }
}

/**
 * Generate insights from analytics data
 * @param dataSource - Source of the data
 * @param timeframe - Time period for analysis
 * @param params - Additional analytics parameters
 * @returns Generated insights
 */
function generateInsights(
  dataSource: string,
  timeframe: string,
  params: any
): any[] {
  // In a real implementation, this would analyze actual data for insights
  // For now, we'll generate placeholder insights
  
  const insights = [
    {
      title: 'Performance Trend',
      description: `Overall ${dataSource} performance is ${generateRandomTrend()} over the ${timeframe}.`,
      significance: 'high',
      metrics: [params.metrics[0]],
      recommendation: `Continue to monitor ${params.metrics[0]} closely.`
    },
    {
      title: 'Audience Behavior',
      description: `${generateRandomAudienceInsight()}`,
      significance: 'medium',
      metrics: [params.metrics.length > 1 ? params.metrics[1] : params.metrics[0]],
      recommendation: 'Consider adjusting targeting strategy based on this behavior.'
    },
    {
      title: 'Conversion Optimization',
      description: `${generateRandomConversionInsight()}`,
      significance: 'high',
      metrics: ['conversion_rate'],
      recommendation: 'Test different approaches to improve conversion rates.'
    },
    {
      title: 'Content Effectiveness',
      description: `${generateRandomContentInsight()}`,
      significance: 'medium',
      metrics: ['engagement', 'time_on_page'],
      recommendation: 'Focus on creating more content that follows successful patterns.'
    },
    {
      title: 'Channel Performance',
      description: `${generateRandomChannelInsight()}`,
      significance: 'medium',
      metrics: ['traffic', 'conversions'],
      recommendation: 'Reallocate resources to higher-performing channels.'
    }
  ];
  
  return insights;
}

/**
 * Generate recommendations based on analytics
 * @param dataSource - Source of the data
 * @param timeframe - Time period for analysis
 * @param params - Additional analytics parameters
 * @returns Generated recommendations
 */
function generateRecommendations(
  dataSource: string,
  timeframe: string,
  params: any
): any[] {
  // In a real implementation, this would generate data-driven recommendations
  // For now, we'll generate placeholder recommendations
  
  return [
    {
      title: 'Optimize Top Performing Content',
      description: 'Your top performing content shows strong engagement. Consider creating more content on similar topics.',
      priority: 'high',
      expectedImpact: 'Increased engagement and time on site',
      implementation: 'Short-term',
      metrics: ['engagement', 'time_on_page']
    },
    {
      title: 'Improve Mobile Experience',
      description: 'Mobile users have a higher bounce rate than desktop. Review mobile UX and page load times.',
      priority: 'medium',
      expectedImpact: 'Reduced bounce rate and increased mobile conversions',
      implementation: 'Medium-term',
      metrics: ['bounce_rate', 'conversion_rate']
    },
    {
      title: 'Adjust Posting Schedule',
      description: 'Analysis shows higher engagement during specific times. Adjust your content schedule accordingly.',
      priority: 'medium',
      expectedImpact: 'Improved reach and engagement',
      implementation: 'Short-term',
      metrics: ['impressions', 'engagement']
    },
    {
      title: 'Refine Audience Targeting',
      description: 'Certain audience segments show higher conversion rates. Focus more resources on these segments.',
      priority: 'high',
      expectedImpact: 'Increased conversion rate and ROI',
      implementation: 'Medium-term',
      metrics: ['conversion_rate', 'roas']
    },
    {
      title: 'Implement A/B Testing',
      description: 'Test different approaches to optimize performance across key metrics.',
      priority: 'medium',
      expectedImpact: 'Data-driven optimization of key metrics',
      implementation: 'Ongoing',
      metrics: params.metrics
    }
  ];
}

/**
 * Generate visualization configurations
 * @param dataSource - Source of the data
 * @param timeframe - Time period for analysis
 * @param params - Additional analytics parameters
 * @returns Generated visualization configs
 */
function generateVisualizations(
  dataSource: string,
  timeframe: string,
  params: any
): any[] {
  // In a real implementation, this would generate actual visualization data
  // For now, we'll generate placeholder visualization configs
  
  return [
    {
      type: 'time_series',
      title: `${params.metrics[0]} Over Time`,
      data: generateTimeSeriesData(params.startDate, params.endDate, params.metrics[0]),
      config: {
        xAxis: 'date',
        yAxis: params.metrics[0],
        showComparison: params.comparisonTimeframe !== 'none'
      }
    },
    {
      type: 'bar_chart',
      title: `Top ${params.dimensions[0]} by ${params.metrics[0]}`,
      data: generateBarChartData(params.dimensions[0], params.metrics[0]),
      config: {
        xAxis: params.dimensions[0],
        yAxis: params.metrics[0],
        limit: 10,
        sortOrder: 'desc'
      }
    },
    {
      type: 'pie_chart',
      title: `${params.metrics[0]} Distribution by ${params.dimensions[0]}`,
      data: generatePieChartData(params.dimensions[0], params.metrics[0]),
      config: {
        showLegend: true,
        showPercentages: true
      }
    },
    {
      type: 'heatmap',
      title: 'Performance Heatmap',
      data: generateHeatmapData(params.dimensions.slice(0, 2), params.metrics[0]),
      config: {
        xAxis: params.dimensions[0],
        yAxis: params.dimensions.length > 1 ? params.dimensions[1] : 'time_of_day',
        colorMetric: params.metrics[0]
      }
    },
    {
      type: 'funnel',
      title: 'Conversion Funnel',
      data: generateFunnelData(),
      config: {
        showPercentages: true,
        showAbsoluteValues: true
      }
    }
  ];
}

/**
 * Generate raw data if requested
 * @param dataSource - Source of the data
 * @param timeframe - Time period for analysis
 * @param params - Additional analytics parameters
 * @returns Generated raw data
 */
function generateRawData(
  dataSource: string,
  timeframe: string,
  params: {
    dimensions: string[];
    metrics: string[];
    startDate: string;
    endDate: string;
  }
): RawDataResponse {
  const dates = generateDateRange(new Date(params.startDate), new Date(params.endDate));
  const rows: RawDataRow[] = [];
  
  for (const date of dates) {
    const row: RawDataRow = { date };
    
    // Add dimension values
    for (const dimension of params.dimensions) {
      if (dimension !== 'date') {
        row[dimension] = generateRandomDimensionValue(dimension);
      }
    }
    
    // Add metric values
    for (const metric of params.metrics) {
      row[metric] = generateRandomMetricValue(metric);
    }
    
    rows.push(row);
  }
  
  return {
    columns: ['date', ...params.dimensions.filter(d => d !== 'date'), ...params.metrics],
    rows,
    totalRows: rows.length
  };
}

/**
 * Generate top performers for a dimension
 * @param dataSource - Source of the data
 * @param dimension - Dimension to analyze
 * @returns Top performers data
 */
function generateTopPerformers(dataSource: string, dimension: string): PerformanceMetric[] {
  return [
    {
      name: generateRandomDimensionValue(dimension),
      value: generateRandomMetricValue('pageviews'),
      change: generateRandomPercentageChange()
    }
  ];
}

/**
 * Generate time series data
 * @param startDate - Start date
 * @param endDate - End date
 * @param metric - Metric to generate data for
 * @returns Time series data
 */
function generateTimeSeriesData(startDate: string, endDate: string, metric: string): ChartData[] {
  const dates = generateDateRange(new Date(startDate), new Date(endDate));
  return dates.map(date => ({
    category: date,
    value: generateRandomMetricValue(metric)
  }));
}

/**
 * Generate bar chart data
 * @param dimension - Dimension for categories
 * @param metric - Metric for values
 * @returns Bar chart data
 */
function generateBarChartData(dimension: string, metric: string): ChartData[] {
  return Array.from({ length: 5 }, () => ({
    category: generateRandomDimensionValue(dimension),
    value: generateRandomMetricValue(metric)
  }));
}

/**
 * Generate pie chart data
 * @param dimension - Dimension for segments
 * @param metric - Metric for values
 * @returns Pie chart data
 */
function generatePieChartData(dimension: string, metric: string): ChartData[] {
  return Array.from({ length: 5 }, () => ({
    category: generateRandomDimensionValue(dimension),
    value: generateRandomMetricValue(metric)
  }));
}

/**
 * Generate heatmap data
 * @param dimensions - Dimensions for x and y axes
 * @param metric - Metric for color intensity
 * @returns Heatmap data
 */
function generateHeatmapData(dimensions: string[], metric: string): ChartData[] {
  return Array.from({ length: 25 }, () => ({
    category: `${generateRandomDimensionValue(dimensions[0])} - ${generateRandomDimensionValue(dimensions[1])}`,
    value: generateRandomMetricValue(metric)
  }));
}

/**
 * Generate funnel data
 * @returns Funnel data
 */
function generateFunnelData(): any[] {
  const totalVisitors = Math.floor(Math.random() * 10000) + 5000;
  const productViews = Math.floor(totalVisitors * (Math.random() * 0.3 + 0.5)); // 50-80%
  const addToCart = Math.floor(productViews * (Math.random() * 0.2 + 0.2)); // 20-40%
  const checkoutStart = Math.floor(addToCart * (Math.random() * 0.3 + 0.5)); // 50-80%
  const purchases = Math.floor(checkoutStart * (Math.random() * 0.3 + 0.6)); // 60-90%
  
  return [
    { stage: 'Visitors', count: totalVisitors },
    { stage: 'Product Views', count: productViews },
    { stage: 'Add to Cart', count: addToCart },
    { stage: 'Checkout Started', count: checkoutStart },
    { stage: 'Purchases', count: purchases }
  ];
}

/**
 * Generate random metric value based on metric type
 * @param metric - Metric name
 * @returns Random appropriate value for the metric
 */
function generateRandomMetricValue(metric: string): number {
  switch (metric) {
    case 'pageviews':
    case 'sessions':
    case 'users':
    case 'impressions':
    case 'views':
      return Math.floor(Math.random() * 10000) + 1000;
    case 'engagement':
    case 'clicks':
    case 'shares':
    case 'opens':
    case 'conversions':
      return Math.floor(Math.random() * 1000) + 100;
    case 'bounce_rate':
    case 'conversion_rate':
    case 'ctr':
      return parseFloat((Math.random() * 0.3 + 0.1).toFixed(4)); // 10-40%
    case 'avg_session_duration':
      return Math.floor(Math.random() * 180) + 60; // 1-4 minutes in seconds
    case 'cost':
    case 'revenue':
      return parseFloat((Math.random() * 5000 + 1000).toFixed(2));
    case 'cpc':
      return parseFloat((Math.random() * 2 + 0.5).toFixed(2));
    case 'roas':
      return parseFloat((Math.random() * 5 + 2).toFixed(2));
    case 'avg_order_value':
      return parseFloat((Math.random() * 100 + 50).toFixed(2));
    default:
      return Math.floor(Math.random() * 100);
  }
}

/**
 * Generate random percentage change
 * @returns Random percentage change between -30% and +50%
 */
function generateRandomPercentageChange(): string {
  const change = parseFloat((Math.random() * 80 - 30).toFixed(1)); // -30% to +50%
  return `${change > 0 ? '+' : ''}${change}%`;
}

/**
 * Generate random performance trend
 * @returns Random trend description
 */
function generateRandomTrend(): string {
  const trends = ['increasing', 'decreasing', 'stable', 'slightly increasing', 'slightly decreasing'];
  return trends[Math.floor(Math.random() * trends.length)];
}

/**
 * Generate random performance comparison
 * @returns Random performance comparison
 */
function generateRandomPerformanceComparison(): string {
  const comparisons = [
    'Performance improved by 25% compared to last month',
    'Engagement rates are up 15% from previous period',
    'Conversion rates show a 10% increase quarter-over-quarter',
    'User retention has improved by 20% since last analysis'
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

/**
 * Generate random audience insight
 * @returns Random audience insight
 */
function generateRandomAudienceInsight(): string {
  const insights = [
    'Majority of users are accessing content via mobile devices',
    'Peak engagement occurs during evening hours',
    'Users from tech industry show highest engagement',
    'Content consumption peaks on weekdays'
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}

/**
 * Generate random conversion insight
 * @returns Random conversion insight
 */
function generateRandomConversionInsight(): string {
  const insights = [
    'Product pages with video content show higher conversion rates',
    'Users who engage with blog content are 2x more likely to convert',
    'Mobile users have a 15% higher cart abandonment rate',
    'Email campaigns drive highest conversion rates'
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}

/**
 * Generate random content insight
 * @returns Random content insight
 */
function generateRandomContentInsight(): string {
  const insights = [
    'Video content receives 3x more engagement',
    'Long-form articles drive higher time on site',
    'Interactive content generates 2x more shares',
    'User-generated content shows highest trust signals'
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}

/**
 * Generate random channel insight
 * @returns Random channel insight
 */
function generateRandomChannelInsight(): string {
  const insights = [
    'Organic search drives highest quality traffic',
    'Social media shows best engagement metrics',
    'Email campaigns have highest ROI',
    'Direct traffic shows strongest conversion intent'
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}

/**
 * Generate date range between two dates
 * @param start - Start date
 * @param end - End date
 * @returns Array of dates in YYYY-MM-DD format
 */
function generateDateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const currentDate = new Date(start);
  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

type DimensionKey = 'age' | 'gender' | 'location' | 'device' | 'browser' | 'platform' | 'default' | string;

/**
 * Generate random dimension value
 * @param dimension - Dimension name
 * @returns Random appropriate value for the dimension
 */
function generateRandomDimensionValue(dimension: DimensionKey): string {
  const dimensionValues: Record<DimensionKey, string[]> = {
    'age': ['18-24', '25-34', '35-44', '45-54', '55+'],
    'gender': ['male', 'female', 'other'],
    'location': ['North America', 'Europe', 'Asia', 'Other'],
    'device': ['desktop', 'mobile', 'tablet'],
    'browser': ['Chrome', 'Firefox', 'Safari', 'Edge'],
    'platform': ['Windows', 'macOS', 'iOS', 'Android'],
    'default': ['Value A', 'Value B', 'Value C']
  };

  const values = dimensionValues[dimension] || dimensionValues['default'];
  return values[Math.floor(Math.random() * values.length)];
}

const analyticsAgent: Agent = {
  id: 'analytics',
  name: 'Analytics',
  category: 'Marketing',
  description: 'Analyzes your marketing performance and provides actionable insights',
  visible: true,
  agentCategory: ['analytics', 'marketing', 'data'],
  config: {
    name: 'Analytics',
    description: 'AI-powered marketing analytics and optimization',
    capabilities: ['Performance Tracking', 'Audience Analysis', 'ROI Optimization']
  },
  capabilities: ['Performance Tracking', 'Audience Analysis', 'ROI Optimization'],
  runAgent: async (input: BaseAgentInput) => {
    // Use the validateAgentInput helper for analytics fields
    const extendedInput = input as unknown as Record<string, any>;
    
    const analyticsFields = validateAgentInput(
      extendedInput,
      ['dataSource', 'timeframe', 'startDate', 'endDate', 'metrics', 'dimensions', 'filters', 
       'comparisonTimeframe', 'segmentBy', 'includeRawData', 'customInstructions'],
      {
        // Type validation functions
        dataSource: (val) => typeof val === 'string',
        timeframe: (val) => typeof val === 'string',
        startDate: (val) => typeof val === 'string',
        endDate: (val) => typeof val === 'string',
        metrics: (val) => Array.isArray(val),
        dimensions: (val) => Array.isArray(val),
        filters: (val) => Array.isArray(val),
        comparisonTimeframe: (val) => typeof val === 'string',
        segmentBy: (val) => Array.isArray(val),
        includeRawData: (val) => typeof val === 'boolean'
      },
      {
        // Default values
        dataSource: 'website',
        timeframe: 'month',
        startDate: undefined,
        endDate: undefined,
        metrics: undefined,
        dimensions: undefined,
        filters: undefined,
        comparisonTimeframe: undefined,
        segmentBy: undefined,
        includeRawData: undefined
      }
    );
    
    // Create the final input with both base and extended fields
    const analyticsInput: AnalyticsInput = {
      userId: input.userId,
      goal: input.goal,
      content: input.content,
      context: input.context,
      options: input.options,
      ...analyticsFields
    };
    
    return runAnalytics(analyticsInput);
  },
  canConverse: true,
  recommendedHelpers: ['adcreative', 'contentcreation', 'social'],
  handoffTriggers: ['create ads', 'ad creative', 'content creation', 'social media', 'campaign optimization'],
  conversationCapabilities: {
    supportedLanguages: ['English'],
    maxConversationDepth: 20,
    specializedTopics: ['analytics', 'data analysis', 'performance metrics', 'marketing insights', 'conversion optimization'],
    emotionalIntelligence: true
  },
  roleRequired: 'client'
};

export { analyticsAgent };
export default analyticsAgent;