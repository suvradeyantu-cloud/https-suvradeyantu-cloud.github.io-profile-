import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSyncStore } from '../lib/sync';
import { supabase } from '../lib/supabase-native';
import VoiceRecorder from './VoiceRecorder';
import { Plus, Trash, CheckCircle } from 'lucide-react-native';

interface PrescriptionFormProps {
  doctorUserId: string;
  mobileApiUrl: string;
}

export default function PrescriptionForm({ doctorUserId, mobileApiUrl }: PrescriptionFormProps) {
  const addDraftToQueue = useSyncStore((state) => state.addDraft);

  // Patient Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // Diagnosis
  const [diagnosisText, setDiagnosisText] = useState('');

  // Lists
  const [complaints, setComplaints] = useState<string[]>(['']);
  const [medicines, setMedicines] = useState<Array<{ name: string; dosage: string; duration: string; note: string }>>([
    { name: '', dosage: '1+0+1', duration: '7 days', note: '' },
  ]);

  const handleAIResult = (data: any) => {
    if (data.chiefComplaints && data.chiefComplaints.length > 0) {
      setComplaints(data.chiefComplaints);
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
  };

  const handleSave = async (status: 'draft' | 'final' = 'draft') => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Patient name is required.');
      return;
    }

    const visitData = {
      id: Math.random().toString(36).substring(7),
      doctor_id: doctorUserId,
      patient_data_raw: { name, phone, email, dob, bloodGroup },
      diagnosis_text: diagnosisText,
      chief_complaints: complaints.filter(c => c.trim() !== ''),
      medicines: medicines.filter(m => m.name.trim() !== ''),
      status,
    };

    try {
      // Attempt to save online immediately
      const { error } = await supabase.from('visits').insert({
        doctor_id: doctorUserId,
        visit_type: 'new',
        diagnosis_text: diagnosisText,
        chief_complaints: complaints.filter(c => c.trim() !== ''),
        status,
      });

      if (error) throw error;
      Alert.alert('Success', `Prescription saved online as ${status}!`);
    } catch (err) {
      // Save offline draft if network fails or DB fails
      await addDraftToQueue({
        id: visitData.id,
        data: visitData,
      });
      Alert.alert('Offline Mode', `Prescription queued as offline draft. Will auto-sync when online.`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <VoiceRecorder onStructuredResult={handleAIResult} mobileApiUrl={mobileApiUrl} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Patient Demographics</Text>
        <TextInput
          style={styles.input}
          placeholder="Patient Name *"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Diagnosis Description</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Essential Hypertension"
          value={diagnosisText}
          onChangeText={setDiagnosisText}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>3. Chief Complaints</Text>
          <TouchableOpacity onPress={() => setComplaints([...complaints, ''])}>
            <Plus size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {complaints.map((comp, idx) => (
          <View key={idx} style={styles.listRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="e.g. Chest pain for 2 days"
              value={comp}
              onChangeText={(txt) => {
                const next = [...complaints];
                next[idx] = txt;
                setComplaints(next);
              }}
            />
            {complaints.length > 1 && (
              <TouchableOpacity onPress={() => {
                const next = [...complaints];
                next.splice(idx, 1);
                setComplaints(next);
              }} style={styles.trashBtn}>
                <Trash size={16} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>4. Medicines & Rx</Text>
          <TouchableOpacity onPress={() => setMedicines([...medicines, { name: '', dosage: '1+0+1', duration: '7 days', note: '' }])}>
            <Plus size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {medicines.map((med, idx) => (
          <View key={idx} style={styles.medCard}>
            <TextInput
              style={styles.input}
              placeholder="Drug Name (e.g. Tab. Paracetamol)"
              value={med.name}
              onChangeText={(txt) => {
                const next = [...medicines];
                next[idx].name = txt;
                setMedicines(next);
              }}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Dosage (e.g. 1+0+1)"
                value={med.dosage}
                onChangeText={(txt) => {
                  const next = [...medicines];
                  next[idx].dosage = txt;
                  setMedicines(next);
                }}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Duration (e.g. 5 days)"
                value={med.duration}
                onChangeText={(txt) => {
                  const next = [...medicines];
                  next[idx].duration = txt;
                  setMedicines(next);
                }}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.draftBtn]} onPress={() => handleSave('draft')}>
          <Text style={styles.btnTextDraft}>Save Draft</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.finalBtn]} onPress={() => handleSave('final')}>
          <CheckCircle size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.btnTextFinal}>Finalize Rx</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trashBtn: {
    padding: 10,
    marginLeft: 8,
  },
  medCard: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  draftBtn: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  finalBtn: {
    backgroundColor: '#16a34a',
  },
  btnTextDraft: {
    color: '#374151',
    fontWeight: '600',
  },
  btnTextFinal: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
