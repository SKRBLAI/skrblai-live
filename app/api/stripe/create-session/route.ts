import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../utils/stripe';

export async function POST(req: NextRequest) {
  try {
    const { productSku, price, title, successUrl, cancelUrl, email, metadata } = await req.json();

    // Validate required parameters
    if (!productSku || !price || !title) {
      return NextResponse.json(
        { error: 'Missing required parameters: productSku, price, title' },
        { status: 400 }
      );
    }

    // Create one-time product for this purchase
    const product = await stripe.products.create({
      name: title,
      metadata: {
        sku: productSku,
        category: 'skillsmith'
      }
    });

    // Create price for this product
    const priceObject = await stripe.prices.create({
      product: product.id,
      unit_amount: price * 100, // Convert to cents
      currency: 'usd',
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceObject.id,
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment for products
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      metadata: {
        productSku,
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
      productSku,
      category: metadata?.category || 'sports',
      source: metadata?.source || 'sports_page'
    });
    
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      productSku,
      metadata
    });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}