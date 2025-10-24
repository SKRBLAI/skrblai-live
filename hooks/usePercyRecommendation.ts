/**
 * usePercyRecommendation Hook
 *
 * React hook for getting intelligent service and agent recommendations from Percy.
 * Integrates with the Percy recommendation engine API.
 *
 * @example
 * ```tsx
 * const { recommendation, loading, error, getRecommendation } = usePercyRecommendation();
 *
 * // Get instant recommendation
 * await getRecommendation('revenue-stalling');
 *
 * // Get recommendation with context
 * await getRecommendation('revenue-stalling', {
 *   businessType: 'ecommerce',
 *   urgencyLevel: 'high',
 *   userHistory: ['analytics', 'social']
 * });
 * ```
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/components/context/AuthContext';

export interface PercyRecommendationContext {
  businessType?: string;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  userHistory?: string[];
  previousEngagement?: Array<{ service: string; timestamp: number }>;
}

export interface PercyRecommendation {
  service: {
    id: string;
    name: string;
    category: string;
    description: string;
  };
  confidence: number;
  reasoning: string;
  followUpServices: Array<{
    id: string;
    name: string;
    reason: string;
  }>;
  urgencyMessage?: string;
  agentHandoff?: {
    agentId: string;
    agentName: string;
    reason: string;
  };
}

export interface PercyRecommendationResponse {
  recommendation: PercyRecommendation | PercyRecommendation[];
  percyMessage: {
    greeting: string;
    confidence: string;
    urgency: string;
  };
  metadata: {
    confidence: number;
    timestamp: number;
    recommendationType: string;
    triggerAnalyzed: string;
  };
}

export interface UsePercyRecommendationOptions {
  autoFetch?: boolean;
  trigger?: string;
  context?: PercyRecommendationContext;
}

export function usePercyRecommendation(options?: UsePercyRecommendationOptions) {
  const [recommendation, setRecommendation] = useState<PercyRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  /**
   * Get a single instant recommendation based on trigger
   */
  const getRecommendation = useCallback(
    async (
      trigger: string,
      context?: PercyRecommendationContext,
      requestType: 'instant' | 'set' | 'generate' = 'instant'
    ): Promise<PercyRecommendationResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/services/percy-recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && {
              Authorization: `Bearer ${session.access_token}`,
            }),
          },
          body: JSON.stringify({
            trigger,
            context,
            requestType,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get recommendation');
        }

        const data: PercyRecommendationResponse = await response.json();
        setRecommendation(data);
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to get recommendation from Percy';
        setError(errorMessage);
        console.error('[usePercyRecommendation] Error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session?.access_token]
  );

  /**
   * Get a set of recommendations (2-5 options)
   */
  const getRecommendationSet = useCallback(
    async (
      context: PercyRecommendationContext,
      count: number = 3
    ): Promise<PercyRecommendationResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/services/percy-recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && {
              Authorization: `Bearer ${session.access_token}`,
            }),
          },
          body: JSON.stringify({
            trigger: context.userHistory?.[0] || 'general',
            context,
            requestType: 'set',
            count: Math.min(count, 5),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get recommendation set');
        }

        const data: PercyRecommendationResponse = await response.json();
        setRecommendation(data);
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to get recommendation set from Percy';
        setError(errorMessage);
        console.error('[usePercyRecommendation] Error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session?.access_token]
  );

  /**
   * Generate a contextual recommendation based on full context analysis
   */
  const generateRecommendation = useCallback(
    async (context: PercyRecommendationContext): Promise<PercyRecommendationResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/services/percy-recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && {
              Authorization: `Bearer ${session.access_token}`,
            }),
          },
          body: JSON.stringify({
            trigger: 'contextual',
            context,
            requestType: 'generate',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate recommendation');
        }

        const data: PercyRecommendationResponse = await response.json();
        setRecommendation(data);
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to generate recommendation from Percy';
        setError(errorMessage);
        console.error('[usePercyRecommendation] Error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session?.access_token]
  );

  /**
   * Clear current recommendation
   */
  const clearRecommendation = useCallback(() => {
    setRecommendation(null);
    setError(null);
  }, []);

  return {
    recommendation,
    loading,
    error,
    getRecommendation,
    getRecommendationSet,
    generateRecommendation,
    clearRecommendation,
  };
}
