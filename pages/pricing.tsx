'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStripePromise } from '@/utils/stripe';

interface Plan {
  id: string;
  name: string;
  unit_amount: number;
  features: string[];
}

const stripePromise = getStripePromise();

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [recommendedPlan, setRecommendedPlan] = useState<Plan['name'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/get-pricing-plans');
        const data = await response.json();
        setPlans(data.plans);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleRecommendationSubmit = async (answers) => {
    // AI recommendation logic
    const recommended = determineRecommendedPlan(answers);
    setRecommendedPlan(recommended);
  };

  const determineRecommendedPlan = (answers) => {
    // Simple recommendation logic - can be enhanced with AI
    const { budget, teamSize, focus } = answers;
    
    if (budget < 1000 || teamSize === '1-3') return 'Starter';
    if (budget < 5000 || teamSize === '4-10') return 'Growth';
    if (focus === 'All') return 'Scale';
    return 'Enterprise';
  };

  const handleSubscribe = async (priceId) => {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/pricing`,
    });

    if (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) return <div>Loading pricing plans...</div>;
  if (error) return <div>Error loading pricing: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">SKRBL AI Pricing</h1>

      {/* AI Recommendation Form */}
      <div className="bg-deep-navy/80 p-6 rounded-xl mb-12">
        <h2 className="text-2xl font-semibold mb-4">Get AI-Powered Plan Recommendation</h2>
        <RecommendationForm onSubmit={handleRecommendationSubmit} />
      </div>

      {/* Pricing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            className={`bg-deep-navy/80 p-6 rounded-xl border ${
              recommendedPlan === plan.name ? 'border-electric-blue shadow-lg' : 'border-electric-blue/30'
            }`}
            whileHover={{ scale: 1.05 }}
            animate={{
              scale: recommendedPlan === plan.name ? 1.1 : 1,
              boxShadow: recommendedPlan === plan.name ? '0 0 20px rgba(30, 144, 255, 0.5)' : 'none'
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
            <p className="text-3xl font-bold mb-4">
              ${(plan.unit_amount / 100).toFixed(2)}/mo
            </p>
            <ul className="mb-6">
              {plan.features?.map((feature, i) => (
                <li key={i} className="flex items-center mb-2">
                  <span className="text-electric-blue mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              className="btn-primary w-full"
            >
              Subscribe Now
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RecommendationForm({ onSubmit }) {
  const [budget, setBudget] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [focus, setFocus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ budget, teamSize, focus });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2">Monthly marketing budget?</label>
        <select
          title="Select budget"
          className="w-full p-2 rounded bg-deep-navy border border-electric-blue/30"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
        >
          <option value="">Select budget</option>
          <option value="500">Under $500</option>
          <option value="1000">$500 - $1000</option>
          <option value="5000">$1000 - $5000</option>
          <option value="10000">$5000+</option>
        </select>
      </div>

      <div>
        <label className="block mb-2">Team size?</label>
        <select
          title="Select team size"
          className="w-full p-2 rounded bg-deep-navy border border-electric-blue/30"
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value)}
          required
        >
          <option value="">Select team size</option>
          <option value="1-3">1-3</option>
          <option value="4-10">4-10</option>
          <option value="10+">10+</option>
        </select>
      </div>

      <div>
        <label className="block mb-2">Primary focus?</label>
        <select
          title="Select focus"
          className="w-full p-2 rounded bg-deep-navy border border-electric-blue/30"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          required
        >
          <option value="">Select focus</option>
          <option value="Publishing">Publishing</option>
          <option value="Branding">Branding</option>
          <option value="Website Automation">Website Automation</option>
          <option value="All">All</option>
        </select>
      </div>

      <button type="submit" className="btn-primary w-full">
        Get Recommendation
      </button>
    </form>
  );
} 