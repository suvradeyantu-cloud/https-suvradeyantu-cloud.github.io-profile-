import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import PrescriptionForm from '../../components/PrescriptionForm';
import BiometricGate from '../../components/BiometricGate';
import { supabase } from '../../lib/supabase-native';

export default function NewPrescriptionScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Read environment variable safely
  const mobileApiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <BiometricGate>
      <View style={styles.container}>
        <PrescriptionForm doctorUserId={userId || ''} mobileApiUrl={mobileApiUrl} />
      </View>
    </BiometricGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
