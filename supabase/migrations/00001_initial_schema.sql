-- Enable pgcrypto for encryption (optional)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (doctors)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  qualifications TEXT,
  bmdc_reg TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  stripe_account_id TEXT,        -- Stripe Connect account ID
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chambers (doctor’s clinics)
CREATE TABLE IF NOT EXISTS chambers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  consultation_fee NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name_encrypted TEXT,             -- AES-256 encrypted
  phone_encrypted TEXT,
  email_encrypted TEXT,
  reg_no TEXT,                     -- hospital registration number
  date_of_birth DATE,
  blood_group TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visits / Prescriptions
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  chamber_id UUID REFERENCES chambers(id),
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  visit_date DATE DEFAULT CURRENT_DATE,
  visit_type TEXT CHECK (visit_type IN ('new', 'follow_up', 'telemedicine')),
  diagnosis_icd TEXT,
  diagnosis_text TEXT,
  chief_complaints TEXT[],
  investigations TEXT[],
  advice TEXT,
  follow_up TEXT,
  pdf_path TEXT,                   -- path in private storage bucket
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medicines prescribed in a visit
CREATE TABLE IF NOT EXISTS visit_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  duration TEXT NOT NULL,
  note TEXT,
  seq_no INT DEFAULT 0
);

-- AI Scribe logs (billing/compliance)
CREATE TABLE IF NOT EXISTS ai_scribe_logs (
  id BIGSERIAL PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  success BOOLEAN NOT NULL,
  transcript_snippet TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor templates
CREATE TABLE IF NOT EXISTS prescription_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  sections JSONB,                 -- which sections are visible/order
  content JSONB,                  -- default medicines, advice, etc.
  is_default BOOLEAN DEFAULT false
);

-- Payouts (Stripe) sync table
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  stripe_transfer_id TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'bdt',
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chambers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_scribe_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_templates ENABLE ROW LEVEL SECURITY;

-- Doctor sees/edits only own data
CREATE POLICY "doctor_own_profile" ON profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "doctor_own_chambers" ON chambers FOR ALL USING (doctor_id = auth.uid());
CREATE POLICY "doctor_own_patients" ON patients FOR ALL USING (doctor_id = auth.uid());
CREATE POLICY "doctor_own_visits" ON visits FOR ALL USING (doctor_id = auth.uid());
CREATE POLICY "doctor_own_medicines" ON visit_medicines USING (visit_id IN (SELECT id FROM visits WHERE doctor_id = auth.uid()));
CREATE POLICY "doctor_own_templates" ON prescription_templates FOR ALL USING (doctor_id = auth.uid());

-- AI logs only visible to own doctor
CREATE POLICY "doctor_own_scribe_logs" ON ai_scribe_logs FOR SELECT USING (doctor_id = auth.uid());
