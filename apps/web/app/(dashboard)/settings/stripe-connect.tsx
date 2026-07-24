"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@prescriply/ui';
import { DollarSign, ExternalLink, ShieldCheck, CheckCircle } from 'lucide-react';

interface StripeConnectProps {
  initialAccountId?: string;
  subscriptionTier?: string;
}

export default function StripeConnect({ initialAccountId, subscriptionTier }: StripeConnectProps) {
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubmitting] = useState(false);

  const handleConnectStripe = async () => {
    setLoading(true);
    try {
      // In production, we generate a Stripe Connect OAuth URL or Express Dashboard Link
      // Redirect to simulated Stripe onboarding
      const stripeClientId = 'ca_mock_12345';
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/stripe/connect`);
      const state = 'mock-doctor-id'; // Pass real doctor ID in prod
      
      const oauthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${stripeClientId}&scope=read_write&redirect_uri=${redirectUri}&state=${state}`;
      
      window.location.href = oauthUrl;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_premium_mock',
          doctorId: 'mock-doctor-id',
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        if (url) window.location.href = url;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stripe Connect Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Doctor Consultations Payouts (Stripe Connect)</span>
          </CardTitle>
          <CardDescription>Link your bank account via Stripe Connect to receive patient consultation fees directly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialAccountId ? (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
              <div>
                <p className="font-bold">Stripe Connect Linked Successfully</p>
                <p className="text-xs text-green-700 font-mono">Account ID: {initialAccountId}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 leading-relaxed">
                Connect your account today. Patient payments for telemedicine, physical consultation scheduling, and automated billing are settled directly to your connected Stripe profile.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!initialAccountId ? (
            <Button onClick={handleConnectStripe} disabled={loading} className="bg-green-600 hover:bg-green-700 flex items-center space-x-2">
              <span>{loading ? 'Opening Stripe...' : 'Link Stripe Connect'}</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" className="flex items-center space-x-2">
              <span>Manage Stripe Payouts</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Subscription Tier Checkout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <span>Subscription & Billing</span>
          </CardTitle>
          <CardDescription>Manage your Prescriply membership plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <p className="font-semibold text-blue-900">Current Plan: {subscriptionTier?.toUpperCase() || 'FREE'}</p>
              <p className="text-xs text-blue-700 mt-0.5">Free plan includes 100 free AI clinical scribes per month.</p>
            </div>
            <span className="text-xl font-bold text-blue-800">৳0/mo</span>
          </div>
        </CardContent>
        {subscriptionTier !== 'premium' && (
          <CardFooter>
            <Button onClick={handleSubscribe} disabled={subscribing}>
              {subscribing ? 'Processing checkout...' : 'Upgrade to Premium (Unlimited Scribes)'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
