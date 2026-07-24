export interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  note?: string;
}

export interface VisitFormData {
  patientId: string;
  chamberId: string;
  visitType: 'new' | 'follow_up' | 'telemedicine';
  diagnosisIcd: string;
  diagnosisText: string;
  chiefComplaints: string[];
  investigations: string[];
  medicines: Medicine[];
  advice: string;
  followUp: string;
}

export interface Patient {
  id: string;
  doctor_id: string;
  name: string; // Decrypted at the layer level
  phone?: string;
  email?: string;
  reg_no?: string;
  date_of_birth?: string;
  blood_group?: string;
  created_at: string;
}

export interface Chamber {
  id: string;
  doctor_id: string;
  name: string;
  address?: string;
  consultation_fee: number;
  is_active: boolean;
}

export interface Visit {
  id: string;
  patient_id: string;
  chamber_id?: string;
  doctor_id: string;
  visit_date: string;
  visit_type: 'new' | 'follow_up' | 'telemedicine';
  diagnosis_icd?: string;
  diagnosis_text?: string;
  chief_complaints: string[];
  investigations: string[];
  advice?: string;
  follow_up?: string;
  pdf_path?: string;
  status: 'draft' | 'final';
  created_at: string;
  updated_at: string;
}
