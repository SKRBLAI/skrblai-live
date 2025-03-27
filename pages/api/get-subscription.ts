import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  try {
    // customerId removed from here
    const subscriptionId = 'sub_123456789'; // Replace with actual subscription ID

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const plan = subscription.items.data[0]?.plan;
    if (!plan || plan.amount === null) {
      throw new Error('Invalid plan configuration');
    }

    return res.status(200).json({
      subscription: {
        plan: {
          name: plan.nickname || plan.id,
          amount: plan.amount / 100,
        },
        next_invoice_date: subscription.current_period_end * 1000,
        payment_method: 'Visa **** 4242', // You'd get this from the payment method
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
} 