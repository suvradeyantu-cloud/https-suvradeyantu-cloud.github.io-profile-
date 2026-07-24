export interface ScribeTranscript {
  text: string;
  confidence?: number;
}

export interface ScribeResponse {
  success: boolean;
  transcript: string;
  structuredData?: {
    chiefComplaints?: string[];
    diagnosis?: string;
    medicines?: Array<{
      name: string;
      dosage: string;
      duration: string;
      note?: string;
    }>;
    advice?: string;
    investigations?: string[];
  };
  error?: string;
}

export interface ScribeLog {
  id: string;
  doctor_id: string;
  success: boolean;
  transcript_snippet?: string;
  error_message?: string;
  created_at: string;
}
