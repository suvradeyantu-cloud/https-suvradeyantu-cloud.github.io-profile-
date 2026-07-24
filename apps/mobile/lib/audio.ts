import { Audio } from 'expo-av';

export async function startClinicalRecording(): Promise<Audio.Recording | null> {
  try {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      console.warn('Microphone permission not granted');
      return null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    return recording;
  } catch (error) {
    console.error('Failed to start audio recording:', error);
    return null;
  }
}

export async function stopClinicalRecordingAndUpload(
  recording: Audio.Recording,
  mobileApiUrl: string
): Promise<any | null> {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (!uri) return null;

    // Prepare upload
    const filename = uri.split('/').pop() || 'dictation.m4a';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `audio/${match[1]}` : `audio/m4a`;

    const formData = new FormData();
    // @ts-ignore
    formData.append('audio', { uri, name: filename, type });

    const endpoint = `${mobileApiUrl}/api/ai-scribe`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Scribe server returned error status');
    }

    const result = await response.json();
    return result.success ? result.structuredData : null;
  } catch (err) {
    console.error('Failed to stop and upload clinical recording:', err);
    return null;
  }
}
