import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    const plans = prices.data.map(price => ({
      id: price.id,
      name: price.product.name,
      unit_amount: price.unit_amount,
      features: price.product.metadata.features?.split(',') || [
        'Basic features',
        'Email support',
        'Limited usage'
      ],
    }));

    res.status(200).json({ plans });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
} 