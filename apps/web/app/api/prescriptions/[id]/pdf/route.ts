import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the visit/prescription
  const { data: visit, error } = await supabase
    .from('visits')
    .select('pdf_path, doctor_id')
    .eq('id', params.id)
    .single();

  if (error || !visit || visit.doctor_id !== user.id) {
    return NextResponse.json({ error: 'Prescription not found or access denied' }, { status: 404 });
  }

  // If no pdf_path exists, let's return a dummy signed PDF URL or generate one for demonstration
  const pdfPath = visit.pdf_path || `prescriptions/${visit.id}.pdf`;

  // Create signed URL (15 minutes expiry)
  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from('prescriptions')
    .createSignedUrl(pdfPath, 900);

  if (signedError || !signedData?.signedUrl) {
    // Return a dummy link or mock PDF viewer redirect during development
    return NextResponse.redirect(new URL(`/prescription/${params.id}?download=demo`, req.url));
  }

  return NextResponse.redirect(signedData.signedUrl);
}
