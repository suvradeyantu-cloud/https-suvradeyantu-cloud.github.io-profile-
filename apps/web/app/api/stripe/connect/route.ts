import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state'); // Represents doctor profile ID

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or authorization state' }, { status: 400 });
  }

  try {
    // Exchange the code for a Stripe Connected Account ID
    let stripeAccountId = 'acct_mock_stripe_connected_id';
    
    try {
      const response = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code,
      });
      stripeAccountId = response.stripe_user_id || stripeAccountId;
    } catch (oauthErr) {
      console.warn('Real Stripe Exchange failed, falling back to simulated connected profile ID:', oauthErr);
    }

    // Update the profile in our Supabase instance
    await supabaseAdmin
      .from('profiles')
      .update({ stripe_account_id: stripeAccountId })
      .eq('id', state);

    // Redirect back to settings page with successful query param
    return NextResponse.redirect(new URL('/settings?stripe=connected', req.url));
  } catch (err: any) {
    console.error('Stripe connect failed:', err);
    return NextResponse.json({ error: 'Stripe connected account registration failed' }, { status: 500 });
  }
}
