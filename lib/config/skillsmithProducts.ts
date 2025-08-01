import { Target, Zap, Trophy, Star } from 'lucide-react';
import React from 'react';

export interface Product {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  price: number;
  originalPrice?: number;
  sku: string;
  category: 'analysis' | 'training' | 'nutrition' | 'performance';
  icon: React.ComponentType<any>;
  color: string;
  features: string[];
  popular?: boolean;
}

// Skillsmith sports product definitions
export const products: Product[] = [
  {
    id: 'form-analysis-pro',
    title: 'Form Analysis Pro',
    description: 'AI-powered technique analysis with biomechanics insights',
    detailedDescription: 'Get professional-grade biomechanical analysis of your form with detailed breakdown of movement patterns, efficiency metrics, and injury risk assessment.',
    price: 29,
    originalPrice: 39,
    sku: 'skillsmith_form_analysis_pro',
    category: 'analysis',
    icon: Target,
    color: 'text-blue-400',
    features: [
      'Frame-by-frame technique breakdown',
      'Biomechanical efficiency scoring',
      'Injury risk assessment',
      'Comparison with elite athletes',
      'Downloadable analysis report'
    ],
    popular: true
  },
  {
    id: 'performance-insights-elite',
    title: 'Performance Insights Elite',
    description: 'Advanced performance metrics and predictive analytics',
    detailedDescription: 'Unlock elite-level performance insights with advanced analytics, trend tracking, and AI-powered predictions to optimize your training and competition strategies.',
    price: 49,
    originalPrice: 69,
    sku: 'skillsmith_performance_insights_elite',
    category: 'performance',
    icon: Zap,
    color: 'text-yellow-400',
    features: [
      'Real-time performance tracking',
      'Predictive injury prevention',
      'Training optimization algorithms',
      'Competition readiness scoring',
      'Performance trend analysis'
    ],
    popular: false
  },
  {
    id: 'custom-training-plan',
    title: 'Custom Training Plan',
    description: 'Personalized training programs tailored to your goals',
    detailedDescription: 'Get a fully customized training program designed by AI and sports scientists, adapted to your current fitness level, goals, and available equipment.',
    price: 39,
    originalPrice: 59,
    sku: 'skillsmith_custom_training_plan',
    category: 'training',
    icon: Trophy,
    color: 'text-green-400',
    features: [
      'AI-generated personalized workouts',
      'Progressive difficulty scaling',
      'Equipment-based customization',
      'Goal-specific training phases',
      'Weekly plan adjustments'
    ],
    popular: true
  },
  {
    id: 'progress-tracker-premium',
    title: 'Progress Tracker Premium',
    description: 'Comprehensive progress monitoring and goal achievement',
    detailedDescription: 'Track every aspect of your athletic journey with detailed metrics, milestone tracking, and motivational insights to keep you on the path to success.',
    price: 19,
    originalPrice: 29,
    sku: 'skillsmith_progress_tracker_premium',
    category: 'performance',
    icon: Star,
    color: 'text-purple-400',
    features: [
      'Detailed progress analytics',
      'Goal setting and tracking',
      'Achievement milestones',
      'Performance photo comparisons',
      'Motivational insights'
    ],
    popular: false
  }
];