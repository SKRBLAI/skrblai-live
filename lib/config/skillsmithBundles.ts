export interface Bundle {
  id: 'rookie' | 'pro' | 'allstar' | 'yearly';
  title: string;
  subtitle?: string;
  price: number;
  sku: string;
  badge?: 'best-value' | 'most-popular' | null;
  features: string[];
  colorFrom: string;
  colorTo: string;
}

export const bundles: Bundle[] = [
  {
    id: 'rookie',
    title: 'Rookie',
    subtitle: 'Start strong',
    price: 5,
    sku: 'skillsmith_bundle_rookie',
    badge: null,
    features: [
      '1 additional AI scan',
      'Starter Quick Win pack',
      'Email support',
    ],
    colorFrom: '#30D5C8',
    colorTo: '#1E90FF',
  },
  {
    id: 'pro',
    title: 'Pro',
    subtitle: 'Serious gains',
    price: 25,
    sku: 'skillsmith_bundle_pro',
    badge: null,
    features: [
      '10 total AI scans',
      '5 Quick Wins (PDFs)',
      'Priority analysis queue',
    ],
    colorFrom: '#30D5C8',
    colorTo: '#1E90FF',
  },
  {
    id: 'allstar',
    title: 'All-Star',
    subtitle: 'Best value',
    price: 67,
    sku: 'skillsmith_bundle_allstar',
    badge: 'best-value',
    features: [
      '25 total AI scans',
      'All Quick Wins unlocked',
      'Pro tips + comparisons',
    ],
    colorFrom: '#30D5C8',
    colorTo: '#1E90FF',
  },
  {
    id: 'yearly',
    title: 'Yearly Plan',
    subtitle: 'Most popular for dedicated athletes',
    price: 149,
    sku: 'skillsmith_bundle_yearly',
    badge: 'most-popular',
    features: [
      'Unlimited seasonal scans (fair use)',
      'All Quick Wins + new drops',
      'Priority support & updates',
    ],
    colorFrom: '#30D5C8',
    colorTo: '#1E90FF',
  },
];
