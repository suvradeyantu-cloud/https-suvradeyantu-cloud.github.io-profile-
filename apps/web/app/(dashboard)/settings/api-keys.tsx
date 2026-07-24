"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@prescriply/ui';
import { Key, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ApiKeysProps {
  openaiConfigured: boolean;
  stripeConfigured: boolean;
  supabaseUrl?: string;
}

export default function ApiKeys({ openaiConfigured, stripeConfigured, supabaseUrl }: ApiKeysProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Key className="h-5 w-5 text-amber-600" />
          <span>System Integrations & API Credentials</span>
        </CardTitle>
        <CardDescription>
          Verify statuses of external medical NLP pipelines, Stripe Connect webhooks, and secure storage vaults.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OpenAI Connection */}
        <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-lg border border-gray-100">
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">OpenAI Clinical Scribe (Whisper + GPT-4o)</h4>
            <p className="text-xs text-gray-500">Required for spoken audio processing and pre-fill pipelines.</p>
          </div>
          {openaiConfigured ? (
            <div className="flex items-center space-x-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-100">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>CONNECTED</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-100 animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>CONFIG INCOMPLETE</span>
            </div>
          )}
        </div>

        {/* Stripe Configuration */}
        <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-lg border border-gray-100">
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">Stripe Payouts Gateway</h4>
            <p className="text-xs text-gray-500">Handles billing, subscription checkouts, and doctor payouts.</p>
          </div>
          {stripeConfigured ? (
            <div className="flex items-center space-x-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-100">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>INTEGRATED</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-100 animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>PENDING SETUP</span>
            </div>
          )}
        </div>

        {/* Supabase Host */}
        <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-lg border border-gray-100">
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">Supabase Database Endpoint</h4>
            <p className="text-xs text-gray-500">Houses profiles, templates, RLS policies, and encrypted clinical assets.</p>
          </div>
          <div className="text-right">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono font-medium">
              {supabaseUrl ? new URL(supabaseUrl).hostname : 'localhost'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
