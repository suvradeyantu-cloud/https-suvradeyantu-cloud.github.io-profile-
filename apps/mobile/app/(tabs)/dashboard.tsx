import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useSyncStore } from '../../lib/sync';
import { supabase } from '../../lib/supabase-native';
import { CloudOff, Layers, Users, ShieldAlert } from 'lucide-react-native';

export default function MobileDashboard() {
  const offlineQueue = useSyncStore((state) => state.queue);
  const loadQueue = useSyncStore((state) => state.loadQueue);
  const syncAll = useSyncStore((state) => state.syncAll);

  const [refreshing, setRefreshing] = useState(false);
  const [patientCount, setPatientCount] = useState(0);
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [pRes, vRes] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }).eq('doctor_id', user.id),
        supabase.from('visits').select('*', { count: 'exact', head: true }).eq('doctor_id', user.id),
      ]);

      setPatientCount(pRes.count || 0);
      setPrescriptionsCount(vRes.count || 0);
    } catch (e) {
      console.warn('Could not fetch remote statistics (Offline mode active)');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await syncAll();
    await fetchStats();
  };

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Welcome, Doctor</Text>
        <Text style={styles.bannerText}>Pull down to force-sync and refresh stats.</Text>
      </View>

      {offlineQueue.length > 0 && (
        <View style={styles.offlineAlert}>
          <CloudOff size={20} color="#9a3412" />
          <View style={styles.offlineTextContainer}>
            <Text style={styles.offlineAlertTitle}>You have {offlineQueue.length} unsynced drafts</Text>
            <Text style={styles.offlineAlertSub}>Connect to the internet and refresh to auto-sync with cloud database.</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.grid}>
          <View style={[styles.card, styles.primaryCard]}>
            <Users size={24} color="#2563eb" />
            <Text style={styles.cardValue}>{patientCount}</Text>
            <Text style={styles.cardLabel}>Patients Registered</Text>
          </View>

          <View style={[styles.card, styles.successCard]}>
            <Layers size={24} color="#16a34a" />
            <Text style={styles.cardValue}>{prescriptionsCount}</Text>
            <Text style={styles.cardLabel}>Prescriptions Signed</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  banner: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#2563eb',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerText: {
    color: '#eff6ff',
    fontSize: 13,
  },
  offlineAlert: {
    flexDirection: 'row',
    backgroundColor: '#ffedd5',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  offlineTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  offlineAlertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9a3412',
  },
  offlineAlertSub: {
    fontSize: 12,
    color: '#c2410c',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 0.48,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  primaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});
