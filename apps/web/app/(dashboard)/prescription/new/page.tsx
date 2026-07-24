import PrescriptionBuilder from '@/components/PrescriptionBuilder';

export default function NewPrescriptionPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">New Prescription</h1>
        <p className="text-gray-500 text-sm">Author secure prescriptions with AI pre-fill, templates, and safety locks.</p>
      </div>

      <PrescriptionBuilder />
    </div>
  );
}
