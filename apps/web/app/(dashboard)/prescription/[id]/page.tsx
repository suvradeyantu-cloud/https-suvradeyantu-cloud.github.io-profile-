import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@prescriply/ui';
import { decrypt } from '@/lib/pii-encrypt';
import { Calendar, User, FileText, Download, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/navigation';

export default async function PrescriptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select('*, patients(*), chambers(*)')
    .eq('id', params.id)
    .single();

  if (visitError || !visit || visit.doctor_id !== user!.id) {
    notFound();
  }

  const { data: medicines } = await supabase
    .from('visit_medicines')
    .select('*')
    .eq('visit_id', visit.id)
    .order('seq_no', { ascending: true });

  // Decrypt Patient data
  const patientName = decrypt(visit.patients.name_encrypted);
  const patientPhone = decrypt(visit.patients.phone_encrypted);
  const patientEmail = decrypt(visit.patients.email_encrypted);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between">
        <a href="/" className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </a>

        <div className="flex items-center space-x-3">
          <Link
            href={`/api/prescriptions/${visit.id}/pdf`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-9 py-2 px-4 space-x-1.5 shadow"
          >
            <Download className="h-4 w-4" />
            <span>Download Signed PDF</span>
          </Link>
        </div>
      </div>

      {/* Prescription Layout Grid */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-8" id="prescription-print-area">
        {/* Doctor Header Section */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dr. John Doe</h2>
            <p className="text-sm text-gray-500">MBBS, FCPS (Medicine)</p>
            <p className="text-sm text-gray-500">BMDC Reg: {visit.chambers?.bmdc_reg || 'Reg-123456'}</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold text-blue-600">{visit.chambers?.name || 'Private Chamber'}</h3>
            <p className="text-sm text-gray-500">{visit.chambers?.address || 'Clinics & Co'}</p>
            <p className="text-sm text-gray-500">Fee: ৳{visit.chambers?.consultation_fee || 0}</p>
          </div>
        </div>

        {/* Patient Demographics Bar */}
        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border border-gray-100">
          <div>
            <span className="text-gray-400 block text-xs font-semibold">PATIENT NAME</span>
            <span className="font-semibold text-gray-900 flex items-center space-x-1 mt-0.5">
              <User className="h-4 w-4 text-gray-400 inline" />
              <span>{patientName || 'Anonymous'}</span>
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-xs font-semibold">PHONE / CONTACT</span>
            <span className="font-medium text-gray-900 block mt-0.5">{patientPhone || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-xs font-semibold">AGE & BLOOD GROUP</span>
            <span className="font-medium text-gray-900 block mt-0.5">
              {visit.patients.date_of_birth ? `${new Date().getFullYear() - new Date(visit.patients.date_of_birth).getFullYear()} yrs` : 'N/A'} ({visit.patients.blood_group || 'N/A'})
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-xs font-semibold">VISIT DATE</span>
            <span className="font-medium text-gray-900 flex items-center space-x-1 mt-0.5">
              <Calendar className="h-4 w-4 text-gray-400 inline" />
              <span>{new Date(visit.visit_date).toLocaleDateString()}</span>
            </span>
          </div>
        </div>

        {/* Main Clinical Prescription Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Complaints, Vitals, Investigations */}
          <div className="space-y-6 md:border-r md:border-gray-100 md:pr-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-2">CHIEF COMPLAINTS</h4>
              {visit.chief_complaints && visit.chief_complaints.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
                  {visit.chief_complaints.map((c: string, idx: number) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-gray-400 italic">None reported</span>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-2">DIAGNOSIS</h4>
              {visit.diagnosis_text ? (
                <div className="text-sm font-semibold text-gray-900">
                  {visit.diagnosis_text}
                  {visit.diagnosis_icd && (
                    <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                      ICD: {visit.diagnosis_icd}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">None recorded</span>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-2">INVESTIGATIONS RECOMMENDED</h4>
              {visit.investigations && visit.investigations.length > 0 ? (
                <ul className="list-decimal list-inside space-y-1 text-sm text-gray-800">
                  {visit.investigations.map((i: string, idx: number) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-gray-400 italic">None recommended</span>
              )}
            </div>
          </div>

          {/* Right Column: Rx Medicines & Advice */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-blue-600 font-serif mb-4 italic">R𝘹</h3>
              {medicines && medicines.length > 0 ? (
                <div className="space-y-4">
                  {medicines.map((med, idx) => (
                    <div key={med.id} className="border-b border-gray-50 pb-3 last:border-b-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-base font-bold text-gray-900">
                          {idx + 1}. {med.name}
                        </h4>
                        <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex space-x-4">
                        <span>Duration: {med.duration}</span>
                        {med.note && <span>Note: {med.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No medicines prescribed.</p>
              )}
            </div>

            {visit.advice && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-2">GENERAL ADVICE</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{visit.advice}</p>
              </div>
            )}

            {visit.follow_up && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-2">FOLLOW-UP INSTRUCTIONS</h4>
                <p className="text-sm text-gray-900 font-semibold">{visit.follow_up}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer/Signature Area */}
        <div className="border-t border-gray-100 pt-8 flex justify-between items-center text-xs text-gray-400">
          <div>
            <span>Generated securely via Prescriply Monorepo</span>
            <span className="block mt-0.5">ID: {visit.id}</span>
          </div>
          <div className="text-right border-t border-gray-300 pt-2 w-48">
            <span className="font-semibold text-gray-600">Authorized Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
}
