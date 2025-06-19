'use client';

import { useState, useEffect } from 'react';
import { getUserTaxCalculations, formatTaxSummary, type TaxCalculation } from '@/utils/tax';
import { useAuth } from '@/components/context/AuthContext';

interface TaxSummaryProps {
  className?: string;
  showTitle?: boolean;
  limit?: number;
}

export default function TaxSummary({ 
  className = '', 
  showTitle = true, 
  limit = 5 
}: TaxSummaryProps) {
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchTaxCalculations = async () => {
      try {
        setLoading(true);
        const result = await getUserTaxCalculations(user.id);
        
        if (result.success && result.calculations) {
          setCalculations(result.calculations.slice(0, limit));
        } else {
          setError(result.error || 'Failed to load tax calculations');
        }
      } catch (err) {
        setError('Failed to load tax calculations');
        console.error('Tax calculations error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxCalculations();
  }, [user, limit]);

  if (!user) return null;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showTitle && <h3 className="text-lg font-semibold">Tax Summary</h3>}
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-soft-gray/20 rounded"></div>
          <div className="h-4 bg-soft-gray/20 rounded w-3/4"></div>
          <div className="h-4 bg-soft-gray/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showTitle && <h3 className="text-lg font-semibold">Tax Summary</h3>}
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  if (calculations.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showTitle && <h3 className="text-lg font-semibold">Tax Summary</h3>}
        <div className="text-soft-gray/60 text-sm">No tax calculations found</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && <h3 className="text-lg font-semibold">Tax Summary</h3>}
      
      <div className="space-y-3">
        {calculations.map((calc, index) => {
          const taxCalc: TaxCalculation = {
            subtotal: calc.subtotal,
            taxAmount: calc.tax_amount,
            totalAmount: calc.total_amount,
            taxRate: calc.tax_rate,
            jurisdiction: calc.tax_jurisdiction,
            breakdown: calc.tax_breakdown || []
          };

          const summary = formatTaxSummary(taxCalc, calc.currency);

          return (
            <div 
              key={calc.id} 
              className="bg-deep-navy/60 rounded-lg p-4 border border-electric-blue/20"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-medium capitalize">
                    {calc.calculation_type} Transaction
                  </div>
                  <div className="text-xs text-soft-gray/60">
                    {new Date(calc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{summary.totalAmount}</div>
                  <div className="text-xs text-soft-gray/60">
                    includes {summary.taxAmount} tax
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-soft-gray/60">Subtotal:</span>
                  <span className="ml-2">{summary.subtotal}</span>
                </div>
                <div>
                  <span className="text-soft-gray/60">Tax Rate:</span>
                  <span className="ml-2">{summary.effectiveRate}</span>
                </div>
              </div>

              <div className="text-xs text-soft-gray/60 mt-2">
                <span className="inline-flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {summary.jurisdiction}
                </span>
              </div>

              {taxCalc.breakdown.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-electric-blue cursor-pointer hover:text-electric-blue/80">
                    Tax Breakdown
                  </summary>
                  <div className="mt-2 space-y-1">
                    {taxCalc.breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-soft-gray/60">{item.name}:</span>
                        <span>{formatTaxAmount(item.amount, calc.currency)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>

      {calculations.length >= limit && (
        <div className="text-center">
          <button className="text-electric-blue text-sm hover:text-electric-blue/80 transition-colors">
            View All Tax Records
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function (imported from tax utils but redefined for clarity)
function formatTaxAmount(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
} 