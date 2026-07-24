import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { priceId, doctorId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'bdt',
            product_data: {
              name: 'Prescriply Premium Subscription',
              description: 'Unlimited HIPAA clinical scribes, secure storage, and advanced templates.',
            },
            unit_amount: 150000, // ৳1500 per month (1500.00 BDT)
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/settings`,
      client_reference_id: doctorId || 'mock-id',
      metadata: { doctorId: doctorId || 'mock-id' },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout session creation failed:', error);
    return NextResponse.json({ error: error.message || 'Stripe Session Error' }, { status: 500 });
  }
}
