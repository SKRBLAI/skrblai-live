'use client';

import { useState } from 'react';
import { createCheckoutSessionCall, redirectToCheckout } from '../../utils/stripe';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface PaymentButtonProps {
  priceId: string;
  planName: string;
  amount: number;
  currency?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

export default function PaymentButton({
  priceId,
  planName,
  amount,
  currency = 'USD',
  buttonText,
  className = '',
  disabled = false
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, accessLevel } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    
    try {
      // Create checkout session
      const result = await createCheckoutSessionCall({
        priceId,
        userId: user.id,
        email: user.email || '',
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/pricing?payment=canceled`
      });

      if (!result.success) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (result.sessionId) {
        await redirectToCheckout(result.sessionId);
      } else if (result.url) {
        window.location.href = result.url;
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  const defaultButtonText = buttonText || `Subscribe to ${planName} - ${formatPrice(amount)}`;

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        disabled={disabled || isLoading}
        className={`
          relative px-6 py-3 rounded-lg font-semibold text-white
          bg-gradient-to-r from-electric-blue to-teal
          hover:from-electric-blue/90 hover:to-teal/90
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          defaultButtonText
        )}
      </button>
      
      <p className="text-xs text-soft-gray/60 text-center">
        💡 Tax will be calculated automatically based on your location
      </p>
    </div>
  );
}

// Usage example in a pricing component:
export function ExampleUsage() {
  return (
    <div className="pricing-card">
      <h3>Pro Plan</h3>
      <p>$49/month</p>
      
      <PaymentButton
        priceId="price_pro_monthly" // Replace with your actual Stripe price ID
        planName="Pro Plan"
        amount={4900} // $49.00 in cents
        buttonText="Upgrade to Pro"
        className="w-full mt-4"
      />
    </div>
  );
} 