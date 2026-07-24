import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/pii-encrypt';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: rawPatients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Decrypt fields
    const decryptedPatients = (rawPatients || []).map((patient) => ({
      id: patient.id,
      name: decrypt(patient.name_encrypted),
      phone: decrypt(patient.phone_encrypted),
      email: decrypt(patient.email_encrypted),
      reg_no: patient.reg_no,
      date_of_birth: patient.date_of_birth,
      blood_group: patient.blood_group,
      created_at: patient.created_at,
    }));

    return NextResponse.json({ success: true, patients: decryptedPatients });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to retrieve patients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, email, regNo, dob, bloodGroup } = body;

    if (!name) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    // Encrypt details
    const name_encrypted = encrypt(name);
    const phone_encrypted = phone ? encrypt(phone) : null;
    const email_encrypted = email ? encrypt(email) : null;

    const { data: patient, error } = await supabase
      .from('patients')
      .insert({
        doctor_id: user.id,
        name_encrypted,
        phone_encrypted,
        email_encrypted,
        reg_no: regNo || null,
        date_of_birth: dob || null,
        blood_group: bloodGroup || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        name,
        phone,
        email,
        reg_no: patient.reg_no,
        date_of_birth: patient.date_of_birth,
        blood_group: patient.blood_group,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to register patient' }, { status: 500 });
  }
}
