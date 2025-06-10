import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe';
import { supabase } from '@/utils/supabase';
import { saveTaxCalculation, parseStripeTaxCalculation } from '@/utils/tax';

export async function POST(req: NextRequest) {
  try {
    const { 
      customerId, 
      priceId, 
      customerAddress, 
      taxId,
      currency = 'USD' 
    } = await req.json();

    if (!customerId || !priceId) {
      return NextResponse.json(
        { error: 'Missing required parameters: customerId, priceId' },
        { status: 400 }
      );
    }

    // Create tax calculation using Stripe Tax
    const taxCalculation = await stripe.tax.calculations.create({
      currency,
      customer_details: {
        address: {
          line1: customerAddress?.line1 || '',
          city: customerAddress?.city || '',
          state: customerAddress?.state || '',
          postal_code: customerAddress?.postal_code || '',
          country: customerAddress?.country || 'US',
        },
        address_source: 'billing'
      },
      line_items: [
        {
          amount: await getPriceAmount(priceId),
          reference: priceId,
          tax_behavior: 'exclusive',
          tax_code: 'txcd_10103001', // SaaS software
        },
      ]
    });

    return NextResponse.json({
      success: true,
      calculation: {
        subtotal: taxCalculation.amount_total - taxCalculation.tax_amount_exclusive,
        taxAmount: taxCalculation.tax_amount_exclusive,
        totalAmount: taxCalculation.amount_total,
        currency
      }
    });

  } catch (error) {
    console.error('Tax calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate tax' },
      { status: 500 }
    );
  }
}

async function getPriceAmount(priceId: string): Promise<number> {
  const price = await stripe.prices.retrieve(priceId);
  return price.unit_amount || 0;
}