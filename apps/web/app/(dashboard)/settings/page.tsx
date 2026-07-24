import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input } from '@prescriply/ui';
import StripeConnect from './stripe-connect';
import ApiKeys from './api-keys';
import { isOpenAIConfigured } from '@/lib/openai';
import { isStripeConfigured } from '@/lib/stripe';
import { revalidatePath } from 'next/cache';
import { Stethoscope, Building } from 'lucide-react';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  const { data: chambers } = await supabase
    .from('chambers')
    .select('*')
    .eq('doctor_id', user!.id);

  // Server Action to insert a Chamber
  const addChamberAction = async (formData: FormData) => {
    'use server';
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const fee = parseFloat(formData.get('fee') as string || '0');

    if (!name) return;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('chambers').insert({
      doctor_id: user!.id,
      name,
      address,
      consultation_fee: fee,
      is_active: true
    });

    revalidatePath('/settings');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Doctor Settings & Clinics</h1>
        <p className="text-gray-500 text-sm">Configure your active consulting clinics, payout connections, and subscription layers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chambers Editor & Profile */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Clinics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span>My Consultation Chambers</span>
              </CardTitle>
              <CardDescription>Setup chambers so prescriptions can dynamically display address, contact, and fee summaries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {chambers && chambers.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {chambers.map((c) => (
                    <div key={c.id} className="py-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">{c.name}</h4>
                        <p className="text-xs text-gray-500">{c.address || 'Physical Address not specified'}</p>
                      </div>
                      <span className="text-sm font-mono font-bold text-blue-600">৳{c.consultation_fee}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-3">No active chambers listed yet. Please add a chamber below.</p>
              )}

              {/* Add Chamber Sub-form */}
              <form action={addChamberAction} className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Chamber / Hospital Name</label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Care Hospital"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Address / Location</label>
                  <input
                    name="address"
                    placeholder="e.g. Dhanmondi, Dhaka"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Consultation Fee (৳)</label>
                  <div className="flex space-x-2">
                    <input
                      name="fee"
                      type="number"
                      placeholder="e.g. 500"
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button type="submit" variant="primary" className="h-10 shrink-0">
                      Add +
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Stripe Connect & Subscriptions */}
          <StripeConnect 
            initialAccountId={profile?.stripe_account_id} 
            subscriptionTier={profile?.subscription_tier} 
          />
        </div>

        {/* Configurations column */}
        <div className="space-y-8">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Doctor Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center space-x-3.5">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {profile?.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{profile?.full_name}</h4>
                  <p className="text-xs text-gray-500">Qualifications: {profile?.qualifications || 'MBBS / General'}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-500">
                <p>BMDC Reg: <span className="font-mono font-medium text-gray-900">{profile?.bmdc_reg || 'N/A'}</span></p>
                <p>Subscribed Tier: <span className="font-semibold text-blue-700">{profile?.subscription_tier?.toUpperCase()}</span></p>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <ApiKeys 
            openaiConfigured={isOpenAIConfigured} 
            stripeConfigured={isStripeConfigured} 
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL} 
          />
        </div>
      </div>
    </div>
  );
}
