'use client';

import { useState } from 'react';
import CheckoutButton from './CheckoutButton';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface PaymentButtonProps {
  priceId: string;
  label?: string;
  className?: string;
  metadata?: Record<string, string>;
  vertical?: "sports" | "business";
}

export default function PaymentButton({ 
  priceId, 
  label = 'Subscribe Now', 
  className = '',
  metadata = {},
  vertical = 'business'
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return (
      <button 
        disabled 
        className={`btn-solid-grad h-11 w-full rounded-xl ${className}`}
      >
        Please sign in to purchase
      </button>
    );
  }

  return (
    <CheckoutButton
      label={label}
      priceId={priceId}
      mode="subscription"
      className={className}
      metadata={metadata}
      vertical={vertical}
    />
  );
}
