import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'stripe_test_mock';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-04-10' as any, // Standard stable API version
});

export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;
