import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { requireStripe } from '@/lib/stripe/stripe';
import { priceMap, getPriceId, getAmount } from '../../../../lib/config/skillsmithPriceMap';

export async function POST(req: NextRequest) {
  let finalTier: string = 'unknown';
  let metadata: any = {};
  
  try {
    const requestData = await req.json();
    const { tier, productSku, price, title, successUrl, cancelUrl, email } = requestData;
    metadata = requestData.metadata || {};

    // Validate required parameters - now we prefer tier over productSku/price
    finalTier = tier || productSku;
    if (!finalTier) {
      return NextResponse.json(
        { error: 'Missing required parameter: tier (or legacy productSku)' },
        { status: 400 }
      );
    }

    // Create a server-side Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    let { data: { user } } = await supabase.auth.getUser();
    let userId = user?.id;
    let userEmail = user?.email;

    // Handle GUEST checkout if no user is found
    if (!user) {
      console.log('[Stripe API] No authenticated user found. Creating a guest user for checkout.');
      const guestEmail = `guest_${Date.now()}@skrbl.io`;
      const { data: guestData, error: guestError } = await supabase.auth.signUp({
        email: guestEmail,
        password: `password-${Date.now()}` // Secure, temporary password
      });

      if (guestError || !guestData.user) {
        console.error('[Stripe API] Failed to create guest user:', guestError);
        return NextResponse.json(
          { error: 'Failed to initialize guest checkout session.' },
          { status: 500 }
        );
      }
      
      user = guestData.user;
      userId = user.id;
      userEmail = user.email;
      console.log(`[Stripe API] Guest user created successfully: ${userId}`);
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

    // Resolve URLs with fallback to request origin if env not set
    const requestUrl = new URL(req.url);
    const defaultBase = process.env.NEXT_PUBLIC_BASE_URL || `${requestUrl.protocol}//${requestUrl.host}`;
    const resolvedSuccess = successUrl || `${defaultBase}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancel = cancelUrl || `${defaultBase}/checkout/cancel`;

    // Create checkout session using existing Stripe price
    const stripe = requireStripe();
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
      success_url: resolvedSuccess,
      cancel_url: resolvedCancel,
      metadata: {
        tier: finalTier,
        productSku: finalTier, // Keep legacy field for compatibility
        ...metadata,
        category: metadata?.category || 'sports',
        source: metadata?.source || 'sports_page'
      },
      client_reference_id: userId,
      allow_promotion_codes: true,
      customer_email: userEmail || undefined,
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
  } catch (error: any) {
    console.error('Error creating checkout session:', {
      // Log the full error object for detailed inspection
      errorMessage: error.message,
      errorStack: error.stack,
      stripeError: error.raw, // Stripe-specific error details
      tier: finalTier,
      metadata
    });
    // Return a more informative error message to the client
    const clientErrorMessage = error.raw?.message || 'Failed to create checkout session due to an internal error.';
    return NextResponse.json(
      { error: clientErrorMessage },
      { status: 500 }
    );
  }
}