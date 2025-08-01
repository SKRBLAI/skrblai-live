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
  // ... copy the rest of the array from app/sports/page.tsx ...
];