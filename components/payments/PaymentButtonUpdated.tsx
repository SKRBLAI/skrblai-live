'use client';

import { useState } from 'react';
import CheckoutButton from './CheckoutButton';
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

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  const defaultButtonText = buttonText || `Subscribe to ${planName} - ${formatPrice(amount)}`;

  return (
    <div className="space-y-2">
      <div className={disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}>
        <CheckoutButton
          label={defaultButtonText}
          priceId={priceId}
          mode="subscription"
          className={className}
        />
      </div>
      
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
