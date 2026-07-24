export interface DoctorProfile {
  id: string;
  full_name: string;
  qualifications?: string;
  bmdc_reg?: string;
  phone?: string;
  avatar_url?: string;
  stripe_account_id?: string;
  subscription_tier: 'free' | 'premium' | 'enterprise';
  created_at: string;
  updated_at: string;
}
