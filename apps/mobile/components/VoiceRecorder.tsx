import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Mic, Square, Sparkles } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { startClinicalRecording, stopClinicalRecordingAndUpload } from '../lib/audio';

interface VoiceRecorderProps {
  onStructuredResult: (data: any) => void;
  mobileApiUrl: string;
}

export default function VoiceRecorder({ onStructuredResult, mobileApiUrl }: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    const rec = await startClinicalRecording();
    if (rec) setRecording(rec);
  };

  const handleStop = async () => {
    if (!recording) return;
    setLoading(true);
    const data = await stopClinicalRecordingAndUpload(recording, mobileApiUrl);
    setRecording(null);
    setLoading(false);

    if (data) {
      onStructuredResult(data);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={16} color="#1d4ed8" />
        <Text style={styles.headerText}>AI Clinical Scribe (Mobile)</Text>
      </View>

      <Text style={styles.info}>Dictate the consult. OpenAI Whisper + GPT-4o will prefill variables.</Text>

      <View style={styles.controls}>
        {!recording ? (
          <TouchableOpacity 
            style={[styles.button, styles.recordButton]} 
            onPress={handleStart}
            disabled={loading}
          >
            <Mic size={18} color="#ffffff" />
            <Text style={styles.buttonText}>{loading ? 'Transcribing...' : 'Record Consult'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.stopButton]} 
            onPress={handleStop}
          >
            <Square size={18} color="#ffffff" />
            <Text style={styles.buttonText}>Stop & Extract</Text>
          </TouchableOpacity>
        )}

        {loading && <ActivityIndicator color="#2563eb" style={styles.loader} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginLeft: 6,
  },
  info: {
    fontSize: 12,
    color: '#1e3a8a',
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 12,
  },
  recordButton: {
    backgroundColor: '#2563eb',
  },
  stopButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  loader: {
    marginLeft: 4,
  },
});
