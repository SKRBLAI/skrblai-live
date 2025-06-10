import { supabase } from './supabase';

// Tax jurisdiction mapping
export const TAX_JURISDICTIONS = {
  'US': {
    name: 'United States',
    states: {
      'CA': 'California',
      'NY': 'New York',
      'TX': 'Texas',
      'FL': 'Florida',
      'WA': 'Washington',
      // Add more states as needed
    }
  },
  'CA': {
    name: 'Canada',
    provinces: {
      'ON': 'Ontario',
      'BC': 'British Columbia',
      'QC': 'Quebec',
      'AB': 'Alberta',
      // Add more provinces as needed
    }
  },
  'GB': { name: 'United Kingdom' },
  'AU': { name: 'Australia' },
  'DE': { name: 'Germany' },
  'FR': { name: 'France' },
  'IT': { name: 'Italy' },
  'ES': { name: 'Spain' },
  'NL': { name: 'Netherlands' },
  'SE': { name: 'Sweden' },
  'NO': { name: 'Norway' },
  'DK': { name: 'Denmark' },
} as const;

export interface TaxCalculation {
  subtotal: number; // in cents
  taxAmount: number; // in cents
  totalAmount: number; // in cents
  taxRate: number; // decimal (e.g., 0.0875 for 8.75%)
  jurisdiction: string;
  breakdown: TaxBreakdown[];
}

export interface TaxBreakdown {
  type: string; // e.g., 'sales_tax', 'vat', 'gst'
  name: string; // e.g., 'California Sales Tax'
  rate: number; // decimal
  amount: number; // in cents
  jurisdiction: string;
}

/**
 * Format tax amount for display
 */
export function formatTaxAmount(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

/**
 * Format tax rate as percentage
 */
export function formatTaxRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Calculate effective tax rate from subtotal and tax amount
 */
export function calculateEffectiveTaxRate(subtotal: number, taxAmount: number): number {
  if (subtotal === 0) return 0;
  return taxAmount / subtotal;
}

/**
 * Save tax calculation to database
 */
export async function saveTaxCalculation(params: {
  userId: string;
  sessionId?: string;
  invoiceId?: string;
  calculationType: 'checkout' | 'invoice' | 'quote';
  calculation: TaxCalculation;
  customerAddress?: any;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('tax_calculations')
      .insert({
        user_id: params.userId,
        stripe_session_id: params.sessionId,
        stripe_invoice_id: params.invoiceId,
        calculation_type: params.calculationType,
        subtotal: params.calculation.subtotal,
        tax_amount: params.calculation.taxAmount,
        total_amount: params.calculation.totalAmount,
        tax_jurisdiction: params.calculation.jurisdiction,
        tax_rate: params.calculation.taxRate,
        tax_breakdown: params.calculation.breakdown,
        customer_address: params.customerAddress || {}
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error saving tax calculation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get tax calculations for a user
 */
export async function getUserTaxCalculations(userId: string): Promise<{
  success: boolean;
  calculations?: any[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('tax_calculations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, calculations: data };
  } catch (error) {
    console.error('Error fetching tax calculations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get jurisdiction display name
 */
export function getJurisdictionName(jurisdictionCode: string): string {
  const parts = jurisdictionCode.split('-');
  const country = parts[0];
  const state = parts[1];

  const countryInfo = TAX_JURISDICTIONS[country as keyof typeof TAX_JURISDICTIONS];
  if (!countryInfo) return jurisdictionCode;

  if (state && 'states' in countryInfo) {
    const stateName = countryInfo.states[state as keyof typeof countryInfo.states];
    return stateName ? `${stateName}, ${countryInfo.name}` : `${state}, ${countryInfo.name}`;
  }

  if (state && 'provinces' in countryInfo) {
    const provinceName = countryInfo.provinces[state as keyof typeof countryInfo.provinces];
    return provinceName ? `${provinceName}, ${countryInfo.name}` : `${state}, ${countryInfo.name}`;
  }

  return countryInfo.name;
}

/**
 * Parse Stripe tax calculation data
 */
export function parseStripeTaxCalculation(stripeData: any): TaxCalculation | null {
  if (!stripeData?.total_details?.amount_tax) return null;

  const breakdown: TaxBreakdown[] = [];
  
  if (stripeData.total_details.breakdown?.taxes) {
    stripeData.total_details.breakdown.taxes.forEach((tax: any) => {
      breakdown.push({
        type: tax.tax_rate?.tax_type || 'unknown',
        name: tax.tax_rate?.display_name || 'Tax',
        rate: (tax.tax_rate?.percentage || 0) / 100,
        amount: tax.amount || 0,
        jurisdiction: tax.tax_rate?.jurisdiction || 'unknown'
      });
    });
  }

  return {
    subtotal: stripeData.amount_subtotal || 0,
    taxAmount: stripeData.total_details.amount_tax,
    totalAmount: stripeData.amount_total || 0,
    taxRate: calculateEffectiveTaxRate(
      stripeData.amount_subtotal || 0,
      stripeData.total_details.amount_tax
    ),
    jurisdiction: stripeData.customer_details?.address?.country || 'unknown',
    breakdown
  };
}

/**
 * Format tax summary for display
 */
export function formatTaxSummary(calculation: TaxCalculation, currency = 'USD'): {
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  effectiveRate: string;
  jurisdiction: string;
} {
  return {
    subtotal: formatTaxAmount(calculation.subtotal, currency),
    taxAmount: formatTaxAmount(calculation.taxAmount, currency),
    totalAmount: formatTaxAmount(calculation.totalAmount, currency),
    effectiveRate: formatTaxRate(calculation.taxRate),
    jurisdiction: getJurisdictionName(calculation.jurisdiction)
  };
} 