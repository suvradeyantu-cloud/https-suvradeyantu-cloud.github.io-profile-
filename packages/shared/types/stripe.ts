export interface StripeConnectStatus {
  connected: boolean;
  accountId?: string;
  detailsSubmitted: boolean;
}

export interface Payout {
  id: string;
  doctor_id: string;
  stripe_transfer_id?: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}
