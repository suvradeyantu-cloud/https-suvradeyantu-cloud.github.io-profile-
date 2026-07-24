import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../lib/supabase-native';
import { useRouter } from 'expo-router';
import { LogOut, Settings, Info } from 'lucide-react-native';

export default function MobileSettings() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/(auth)/login');
    } catch (e) {
      Alert.alert('Sign out error', 'Could not terminate the session');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Settings size={28} color="#2563eb" />
        <Text style={styles.title}>Mobile Settings</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Info size={18} color="#4b5563" />
          <Text style={styles.rowText}>Version 1.0.0 (Production)</Text>
        </View>
        <View style={styles.row}>
          <Info size={18} color="#4b5563" />
          <Text style={styles.rowText}>AES-256 Application Layer Active</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <LogOut size={18} color="#dc2626" />
        <Text style={styles.signOutText}>Secure Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  rowText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 10,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fca5a5',
    borderWidth: 1,
    backgroundColor: '#fef2f2',
    height: 48,
    borderRadius: 8,
  },
  signOutText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
});
