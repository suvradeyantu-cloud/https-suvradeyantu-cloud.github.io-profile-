import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Development mock mode fallback
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
  }

  try {
    // 1. Payout Transfers Sync
    if (event.type === 'transfer.created') {
      const transfer = event.data.object as any;
      const doctorId = transfer.metadata?.doctor_id;

      if (doctorId) {
        await supabaseAdmin.from('payouts').insert({
          doctor_id: doctorId,
          stripe_transfer_id: transfer.id,
          amount: transfer.amount / 100,
          currency: transfer.currency || 'bdt',
          status: transfer.reversed ? 'reversed' : 'paid',
        });
      }
    }

    // 2. Subscription Checkout Success Upgrades
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const doctorId = session.client_reference_id || session.metadata?.doctorId;

      if (doctorId) {
        await supabaseAdmin
          .from('profiles')
          .update({ subscription_tier: 'premium' })
          .eq('id', doctorId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (dbErr: any) {
    console.error('Database sync from Stripe webhook failed:', dbErr);
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}
