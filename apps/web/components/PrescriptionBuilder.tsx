"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash, Sparkles, FileText, CheckCircle, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@prescriply/ui';
import VoiceRecorderWeb from './VoiceRecorderWeb';
import { BLOOD_GROUPS, VISIT_TYPES, COMMON_DOSAGES, COMMON_DURATIONS } from '@prescriply/shared';
import { useRouter } from 'next/navigation';

interface Chamber {
  id: string;
  name: string;
}

export default function PrescriptionBuilder() {
  const router = useRouter();
  const supabase = createClient();

  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [patientBloodGroup, setPatientBloodGroup] = useState('O+');
  const [patientRegNo, setPatientRegNo] = useState('');

  // Visit Info
  const [chamberId, setChamberId] = useState('');
  const [visitType, setVisitType] = useState<'new' | 'follow_up' | 'telemedicine'>('new');
  const [diagnosisIcd, setDiagnosisIcd] = useState('');
  const [diagnosisText, setDiagnosisText] = useState('');
  
  // Array Lists
  const [chiefComplaints, setChiefComplaints] = useState<string[]>(['']);
  const [investigations, setInvestigations] = useState<string[]>(['']);
  const [advice, setAdvice] = useState('');
  const [followUp, setFollowUp] = useState('');

  // Medicines
  const [medicines, setMedicines] = useState<Array<{
    name: string;
    dosage: string;
    duration: string;
    note: string;
  }>>([{ name: '', dosage: '1+0+1', duration: '7 days', note: '' }]);

  // Fetch initial configuration (e.g. chambers)
  useEffect(() => {
    const fetchChambers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('chambers')
        .select('id, name')
        .eq('doctor_id', user.id);

      if (data) {
        setChambers(data);
        if (data.length > 0) setChamberId(data[0].id);
      }
    };
    fetchChambers();
  }, []);

  // Handle AI Scribe Auto-Fill
  const handleScribeResult = (data: any) => {
    if (data.chiefComplaints && data.chiefComplaints.length > 0) {
      setChiefComplaints(data.chiefComplaints);
    }
    if (data.diagnosis) {
      setDiagnosisText(data.diagnosis);
    }
    if (data.medicines && data.medicines.length > 0) {
      setMedicines(data.medicines.map((m: any) => ({
        name: m.name || '',
        dosage: m.dosage || '1+0+1',
        duration: m.duration || '7 days',
        note: m.note || '',
      })));
    }
    if (data.advice) {
      setAdvice(data.advice);
    }
    if (data.investigations && data.investigations.length > 0) {
      setInvestigations(data.investigations);
    }
  };

  // List management helpers
  const handleAddComplaint = () => setChiefComplaints([...chiefComplaints, '']);
  const handleRemoveComplaint = (index: number) => {
    const next = [...chiefComplaints];
    next.splice(index, 1);
    setChiefComplaints(next);
  };
  const handleComplaintChange = (val: string, index: number) => {
    const next = [...chiefComplaints];
    next[index] = val;
    setChiefComplaints(next);
  };

  const handleAddInvestigation = () => setInvestigations([...investigations, '']);
  const handleRemoveInvestigation = (index: number) => {
    const next = [...investigations];
    next.splice(index, 1);
    setInvestigations(next);
  };
  const handleInvestigationChange = (val: string, index: number) => {
    const next = [...investigations];
    next[index] = val;
    setInvestigations(next);
  };

  const handleAddMedicine = () => setMedicines([...medicines, { name: '', dosage: '1+0+1', duration: '7 days', note: '' }]);
  const handleRemoveMedicine = (index: number) => {
    const next = [...medicines];
    next.splice(index, 1);
    setMedicines(next);
  };
  const handleMedicineChange = (field: string, val: string, index: number) => {
    const next = [...medicines];
    next[index] = { ...next[index], [field]: val };
    setMedicines(next);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'final' = 'draft') => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated');

      // 1. Create Patient using secure API route (performs application-layer encryption)
      const patientResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: patientName || 'Anonymous Patient',
          phone: patientPhone,
          email: patientEmail,
          regNo: patientRegNo,
          dob: patientDob || null,
          bloodGroup: patientBloodGroup,
        }),
      });

      if (!patientResponse.ok) {
        throw new Error('Failed to securely register patient.');
      }

      const patientData = await patientResponse.json();
      const patientId = patientData.patient.id;

      // 2. Create Visit
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .insert({
          patient_id: patientId,
          chamber_id: chamberId || null,
          doctor_id: user.id,
          visit_type: visitType,
          diagnosis_icd: diagnosisIcd || null,
          diagnosis_text: diagnosisText,
          chief_complaints: chiefComplaints.filter(c => c.trim() !== ''),
          investigations: investigations.filter(i => i.trim() !== ''),
          advice,
          follow_up: followUp,
          status,
        })
        .select()
        .single();

      if (visitError) throw visitError;

      // 3. Add Medicines
      const medInserts = medicines
        .filter(m => m.name.trim() !== '')
        .map((m, idx) => ({
          visit_id: visit.id,
          name: m.name,
          dosage: m.dosage,
          duration: m.duration,
          note: m.note || null,
          seq_no: idx,
        }));

      if (medInserts.length > 0) {
        const { error: medError } = await supabase
          .from('visit_medicines')
          .insert(medInserts);
        if (medError) throw medError;
      }

      setSuccessMsg(`Prescription successfully saved as ${status}!`);
      
      // Reset form on success or redirect
      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (err: any) {
      alert(err.message || 'An error occurred while saving the prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Scribe Voice Assistant widget */}
      <VoiceRecorderWeb onScribeResult={handleScribeResult} />

      <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-8">
        {/* Patient Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>1. Patient Information</CardTitle>
            <CardDescription>PII is securely encrypted on-the-fly before storing in database.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Patient Name *</label>
              <Input
                required
                placeholder="Jane Doe"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Contact Number</label>
              <Input
                type="tel"
                placeholder="+8801XXXXXXXXX"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <Input
                type="email"
                placeholder="patient@email.com"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Date of Birth</label>
              <Input
                type="date"
                value={patientDob}
                onChange={(e) => setPatientDob(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Blood Group</label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={patientBloodGroup}
                onChange={(e) => setPatientBloodGroup(e.target.value)}
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Hospital/Reg No.</label>
              <Input
                placeholder="REG-98765"
                value={patientRegNo}
                onChange={(e) => setPatientRegNo(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Clinical Info / Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>2. Clinical Details</CardTitle>
            <CardDescription>Select clinic/chamber and diagnosis details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Chamber *</label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={chamberId}
                  onChange={(e) => setChamberId(e.target.value)}
                >
                  <option value="">Select Chamber</option>
                  {chambers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Visit Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value as any)}
                >
                  {VISIT_TYPES.map((vt) => (
                    <option key={vt.value} value={vt.value}>{vt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">ICD-10 Code</label>
                <Input
                  placeholder="E11.9 (Type 2 Diabetes)"
                  value={diagnosisIcd}
                  onChange={(e) => setDiagnosisIcd(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Diagnosis Description</label>
              <Input
                placeholder="Primary Hypertension / Moderate chronic kidney disease"
                value={diagnosisText}
                onChange={(e) => setDiagnosisText(e.target.value)}
              />
            </div>

            {/* Complaints */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">Chief Complaints</label>
                <Button type="button" variant="outline" onClick={handleAddComplaint} className="h-8 py-1 px-2 text-xs">
                  + Add Complaint
                </Button>
              </div>
              <div className="space-y-2">
                {chiefComplaints.map((complaint, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="e.g. Fever for 3 days"
                      value={complaint}
                      onChange={(e) => handleComplaintChange(e.target.value, index)}
                    />
                    {chiefComplaints.length > 1 && (
                      <Button type="button" variant="ghost" onClick={() => handleRemoveComplaint(index)} className="h-10 text-red-600 hover:bg-red-50">
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medicines */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>3. Medicines & Rx</CardTitle>
                <CardDescription>Prescribe list of drugs and frequencies.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={handleAddMedicine} className="h-9 py-1 px-3 text-xs flex items-center space-x-1">
                <Plus className="h-4 w-4" />
                <span>Add Drug</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicines.map((med, index) => (
              <div key={index} className="p-4 bg-gray-50 border border-gray-100 rounded-lg space-y-3 relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-semibold text-gray-500">Medicine Name</label>
                    <Input
                      placeholder="e.g. Tab. Paracetamol 500mg"
                      value={med.name}
                      onChange={(e) => handleMedicineChange('name', e.target.value, index)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Dosage</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange('dosage', e.target.value, index)}
                    >
                      {COMMON_DOSAGES.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Duration</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange('duration', e.target.value, index)}
                    >
                      {COMMON_DURATIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="space-y-1 col-span-3">
                    <label className="text-xs font-semibold text-gray-500">Additional Instructions</label>
                    <Input
                      placeholder="e.g. After meals"
                      value={med.note}
                      onChange={(e) => handleMedicineChange('note', e.target.value, index)}
                    />
                  </div>
                  <div className="flex justify-end pt-5">
                    {medicines.length > 1 && (
                      <Button type="button" variant="outline" onClick={() => handleRemoveMedicine(index)} className="border-red-200 text-red-600 hover:bg-red-50 flex items-center space-x-1">
                        <Trash className="h-4 w-4" />
                        <span>Remove</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Advice and Investigations */}
        <Card>
          <CardHeader>
            <CardTitle>4. Additional Recommendations</CardTitle>
            <CardDescription>Advise general habits, diets, tests, and follow-ups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">Investigations / Lab Tests</label>
                <Button type="button" variant="outline" onClick={handleAddInvestigation} className="h-8 py-1 px-2 text-xs">
                  + Add Test
                </Button>
              </div>
              <div className="space-y-2">
                {investigations.map((inv, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="e.g. CBC with ESR, Serum Creatinine"
                      value={inv}
                      onChange={(e) => handleInvestigationChange(e.target.value, index)}
                    />
                    {investigations.length > 1 && (
                      <Button type="button" variant="ghost" onClick={() => handleRemoveInvestigation(index)} className="h-10 text-red-600 hover:bg-red-50">
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">General Advice</label>
              <textarea
                className="flex w-full min-h-[80px] rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Walk 30 mins daily, Avoid high sodium foods..."
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Follow-up Instructions</label>
              <Input
                placeholder="Repeat Serum Creatinine and review in 1 month"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {successMsg && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center space-x-2 text-sm">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="submit"
            variant="outline"
            disabled={submitting}
            className="flex items-center space-x-1.5"
          >
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={(e) => handleSubmit(e, 'final')}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 flex items-center space-x-1.5"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Finalize & Sign Rx</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
