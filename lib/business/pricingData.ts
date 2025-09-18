// Business pricing data with unified structure
// Matches the Plan interface from sports pricing for consistency

export interface Plan {
  label: string;
  priceText?: string;         // fallback display
  displayPrice?: string;      // e.g. "$27"
  originalPriceText?: string; // e.g. "$54.00"
  promoLabel?: string;        // "20% Off Annual"
  sku?: string;               // Stripe Price ID (if missing => disabled CTA)
  isSubscription: boolean;
  perks: string[];
  ctaKind?: "contact" | "buy"; // Enterprise = contact
}

export interface AddOn {
  label: string;
  priceText: string;
  originalPriceText?: string;
  sku?: string;               // Stripe Price ID
  isSubscription: boolean;
  description?: string;
}

// Business Plans - Using existing environment variables where available
export const BUSINESS_PLANS: Plan[] = [
  {
    label: "Gateway",
    priceText: "FREE",
    displayPrice: "$0",
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_GATEWAY, // May not exist, will show disabled
    isSubscription: true,
    perks: [
      "3 Strategic Agents",
      "Percy Concierge Access", 
      "10 Tasks/Agent/Month",
      "Community Support",
      "Basic Analytics"
    ],
  },
  {
    label: "Starter Hustler", 
    displayPrice: "$27",
    priceText: "$27/mo",
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY,
    isSubscription: true,
    perks: [
      "6 Content Creator Agents",
      "Percy Basic Access",
      "50 Tasks/Agent/Month", 
      "Social Media Automation",
      "Priority Support",
      "N8N Workflows",
      "Analytics Dashboard"
    ],
  },
  {
    label: "Business Dominator",
    displayPrice: "$69", 
    priceText: "$69/mo",
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY,
    isSubscription: true,
    perks: [
      "10 Growth Business Agents",
      "Percy + Advanced Analytics", 
      "200 Tasks/Agent/Month",
      "Client Success Automation",
      "Video Content Machine",
      "White-label Options",
      "Advanced N8N Workflows"
    ],
  },
  {
    label: "Industry Crusher",
    displayPrice: "$269",
    priceText: "$269/mo", 
    ctaKind: "contact", // Enterprise tier
    isSubscription: true,
    perks: [
      "Complete Agent Arsenal (14+)",
      "Percy + Predictive Intelligence",
      "Unlimited Tasks & Processing",
      "Custom Agent Builder",
      "White-label Options", 
      "Dedicated Success Manager",
      "API Access & Integrations",
      "Enterprise SLA"
    ],
  },
];

export const BUSINESS_ADDONS: AddOn[] = [
  {
    label: "Advanced Analytics",
    priceText: "$29/mo",
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_ANALYTICS,
    isSubscription: true,
    description: "Enhanced reporting and insights"
  },
  {
    label: "Automation Workflows",
    priceText: "$49/mo", 
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_AUTOMATION,
    isSubscription: true,
    description: "Advanced N8N workflow templates"
  },
  {
    label: "Additional Team Seat",
    priceText: "$19/mo",
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_SEAT,
    isSubscription: true,
    description: "Add team members to your plan"
  }
];

// Utility functions
export const getBusinessPlans = () => BUSINESS_PLANS;
export const getBusinessAddons = () => BUSINESS_ADDONS;

export const getPlanByLabel = (label: string): Plan | undefined => {
  return BUSINESS_PLANS.find(plan => plan.label === label);
};

export const formatPrice = (price: string): string => {
  // Handle different price formats
  if (price === "FREE" || price === "$0") return "FREE";
  if (price.startsWith("$")) return price;
  return `$${price}`;
};

// Badge helpers
export const getPlanBadge = (plan: Plan): string | undefined => {
  switch (plan.label) {
    case "Starter Hustler":
      return "Most Popular";
    case "Business Dominator": 
      return "Best Value";
    case "Industry Crusher":
      return "Enterprise";
    default:
      return undefined;
  }
};

export const getPlanIcon = (plan: Plan): string => {
  switch (plan.label) {
    case "Gateway":
      return "🎯";
    case "Starter Hustler":
      return "⚡";
    case "Business Dominator":
      return "🔥"; 
    case "Industry Crusher":
      return "👑";
    default:
      return "📊";
  }
};