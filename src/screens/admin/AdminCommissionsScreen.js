import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput } from 'react-native';
import { CaretLeft, Percent, PencilSimple } from 'phosphor-react-native';
import { getAdminCommissions, updateAdminCommission } from '../../api/admin.api';

export default function AdminCommissionsScreen({ navigation }) {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const res = await getAdminCommissions();
      if (Array.isArray(res?.data)) setCommissions(res.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  const initNgCommission = async () => {
    try {
      setLoading(true);
      await updateAdminCommission('NG', 0.1, 'Default Nigeria Commission (10%)');
      await loadCommissions();
      Alert.alert('Success', 'Nigeria commission initialized to 10%');
    } catch (e) {
      Alert.alert('Error', 'Failed to initialize NG commission');
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    Alert.prompt(
      'Update Commission',
      `Enter new rate for ${item.countryCode} (e.g. 0.15 for 15%)`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: async (newRate) => {
            const rateNum = parseFloat(newRate);
            if (isNaN(rateNum) || rateNum < 0 || rateNum > 1) {
              Alert.alert('Invalid', 'Rate must be between 0 and 1');
              return;
            }
            try {
              await updateAdminCommission(item.countryCode, rateNum, `Updated by Admin`);
              setCommissions(prev => prev.map(c => c.id === item.id ? { ...c, commissionRate: rateNum } : c));
              Alert.alert('Success', 'Commission rate updated');
            } catch (e) {
              Alert.alert('Error', 'Failed to update rate');
            }
          }
        }
      ],
      'plain-text',
      item.commissionRate.toString()
    );
  };

  return (
    <SafeAreaView style={S.root}>
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#1E293B" weight="bold" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Global Commissions</Text>
      </View>

      {loading ? (
        <View style={S.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={commissions}
          keyExtractor={item => item.id?.toString() || item.countryCode}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={S.card}>
              <View style={S.cardRow}>
                <View style={S.iconBox}>
                  <Percent size={24} color="#2563EB" weight="fill" />
                </View>
                <View style={S.info}>
                  <Text style={S.country}>{item.countryCode}</Text>
                  <Text style={S.rate}>Rate: {(item.commissionRate * 100).toFixed(1)}%</Text>
                  <Text style={S.desc}>{item.description || 'Standard rate'}</Text>
                </View>
                <TouchableOpacity style={S.editBtn} onPress={() => handleEdit(item)}>
                  <PencilSimple size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8', marginBottom: 16 }}>No commission configs found.</Text>
              <TouchableOpacity 
                style={{ backgroundColor: '#16A34A', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
                onPress={initNgCommission}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Initialize NG Commission</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  country: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  rate: { fontSize: 14, fontWeight: '700', color: '#2563EB', marginTop: 2 },
  desc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  editBtn: { padding: 10 },
});
