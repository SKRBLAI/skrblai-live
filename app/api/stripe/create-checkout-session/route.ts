import { NextRequest, NextResponse } from 'next/server';
import { requireStripe } from '@/lib/stripe/stripe';
import { getServerSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const stripe = requireStripe();
    const supabase = getServerSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }
    const { priceId, userId, email, successUrl, cancelUrl } = await req.json();

    // Validate required parameters
    if (!priceId || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required parameters: priceId, userId, email' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    let customerId: string;
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (existingUser?.stripe_customer_id) {
      customerId = existingUser.stripe_customer_id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email,
        metadata: { userId }
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session with automatic tax calculation
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required', // Required for tax calculation
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK'], // Add countries where you sell
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        userId,
      },
      allow_promotion_codes: true,
      // Enable automatic tax calculation
      automatic_tax: {
        enabled: true,
      },
      // Tax ID collection for business customers
      tax_id_collection: {
        enabled: true,
      },
      // Customer update options for tax-related info
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 