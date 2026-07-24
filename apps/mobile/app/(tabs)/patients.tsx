import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput } from 'react-native';
import BiometricGate from '../../components/BiometricGate';
import { supabase } from '../../lib/supabase-native';
import { Users, Search } from 'lucide-react-native';

export default function PatientsScreen() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (data) setPatients(data);
    } catch (e) {
      console.warn('Failed to load patient records (Offline active)');
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter(p => 
    p.reg_no?.toLowerCase().includes(search.toLowerCase()) ||
    p.blood_group?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <BiometricGate>
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search by ID or blood group..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} />
        ) : filtered.length > 0 ? (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.iconCircle}>
                  <Users size={20} color="#2563eb" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.patientId}>ID: {item.id.substring(0, 8)}</Text>
                  <Text style={styles.regNo}>Reg No: {item.reg_no || 'N/A'}</Text>
                </View>
                <Text style={styles.bloodBadge}>{item.blood_group || 'O+'}</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No patient records loaded or matches found.</Text>
          </View>
        )}
      </View>
    </BiometricGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  patientId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  regNo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  bloodBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
