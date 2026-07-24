"use client";

import { useState, useRef } from 'react';
import { Mic, Square, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@prescriply/ui';

interface VoiceRecorderWebProps {
  onScribeResult: (structuredData: any) => void;
}

export default function VoiceRecorderWeb({ onScribeResult }: VoiceRecorderWebProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err: any) {
      console.error('Error starting audio recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleAudioUpload = async (blob: Blob) => {
    setProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'scribe_audio.webm');

      const response = await fetch('/api/ai-scribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Transcription failed');
      }

      const result = await response.json();
      if (result.success && result.structuredData) {
        onScribeResult(result.structuredData);
      } else {
        throw new Error(result.error || 'Could not parse structured data');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error processing AI Scribe transcription.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-blue-700 font-semibold text-sm">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>AI Clinical Scribe (Whisper + GPT-4o)</span>
        </div>
        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded font-medium">HIPAA Compliant</span>
      </div>

      <p className="text-xs text-blue-600">
        Click to record consultation details. Simply speak symptoms, diagnosis, and medications naturally.
      </p>

      <div className="flex items-center space-x-3">
        {!recording ? (
          <Button
            type="button"
            variant="primary"
            onClick={startRecording}
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <Mic className="h-4 w-4" />
            <span>{processing ? 'Processing Scribe...' : 'Record Scribe'}</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="danger"
            onClick={stopRecording}
            className="flex items-center space-x-2"
          >
            <Square className="h-4 w-4" />
            <span>Stop Recording</span>
          </button>
        )}

        {recording && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-1.5 text-red-600 text-xs mt-1">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
