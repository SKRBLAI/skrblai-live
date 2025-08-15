import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../utils/stripe';
import { priceMap, getPriceId, getAmount } from '../../../../lib/config/skillsmithPriceMap';

export async function POST(req: NextRequest) {
  let finalTier: string;
  
  try {
    const { tier, productSku, price, title, successUrl, cancelUrl, email, metadata } = await req.json();

    // Validate required parameters - now we prefer tier over productSku/price
    finalTier = tier || productSku;
    if (!finalTier) {
      return NextResponse.json(
        { error: 'Missing required parameter: tier (or legacy productSku)' },
        { status: 400 }
      );
    }

    // Get price ID from price map
    let priceId: string;
    let finalPrice: number;
    
    try {
      priceId = getPriceId(finalTier);
      finalPrice = getAmount(finalTier);
    } catch (error) {
      return NextResponse.json(
        { error: `Unknown tier: ${finalTier}. Available tiers: ${Object.keys(priceMap).join(', ')}` },
        { status: 400 }
      );
    }

    // Create checkout session using existing Stripe price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment for products
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      metadata: {
        tier: finalTier,
        productSku: finalTier, // Keep legacy field for compatibility
        ...metadata,
        category: metadata?.category || 'sports',
        source: metadata?.source || 'sports_page'
      },
      allow_promotion_codes: true,
      customer_email: email || undefined,
      // Enable automatic tax calculation
      automatic_tax: {
        enabled: true,
      },
    });

    console.log('Checkout session created successfully:', {
      sessionId: session.id,
      tier: finalTier,
      priceId,
      amount: finalPrice,
      category: metadata?.category || 'sports',
      source: metadata?.source || 'sports_page'
    });
    
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tier: finalTier,
      metadata
    });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}