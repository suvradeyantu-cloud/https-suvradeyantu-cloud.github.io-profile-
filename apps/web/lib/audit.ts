import { supabaseAdmin } from './supabase/admin';

export interface AuditLogPayload {
  doctor_id: string;
  action: string;
  patient_id?: string;
  details?: string;
  success: boolean;
}

export async function logAuditEvent(payload: AuditLogPayload) {
  try {
    const { doctor_id, action, patient_id, details, success } = payload;
    console.log(`[AUDIT] Doctor: ${doctor_id} | Action: ${action} | Patient: ${patient_id || 'none'} | Success: ${success} | Details: ${details || 'none'}`);
    
    // In our DB schema we have ai_scribe_logs. We can write AI scribe logs specifically there.
    if (action === 'ai_scribe') {
      await supabaseAdmin.from('ai_scribe_logs').insert({
        doctor_id,
        success,
        transcript_snippet: details ? details.substring(0, 200) : '',
        error_message: success ? null : details,
      });
    }
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
