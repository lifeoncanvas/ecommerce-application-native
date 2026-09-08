import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { CaretLeft, Money, CreditCard } from 'phosphor-react-native';
import { getAdminPayments } from '../../api/admin.api';

export default function AdminPaymentsScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await getAdminPayments(0, 50);
      if (res?.data?.content) setPayments(res.data.content);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={S.root}>
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#1E293B" weight="bold" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Global Payments</Text>
      </View>

      {loading ? (
        <View style={S.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={S.card}>
              <View style={S.cardRow}>
                <View style={S.iconBox}>
                  <CreditCard size={24} color="#16A34A" weight="fill" />
                </View>
                <View style={S.info}>
                  <Text style={S.amount}>₦{Number(item.amount || 0).toLocaleString('en-NG')}</Text>
                  <Text style={S.method}>Stripe • {item.currency}</Text>
                  <Text style={S.date}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
                <View style={[S.statusBadge, { backgroundColor: item.status === 'SUCCEEDED' ? '#DCFCE7' : item.status === 'FAILED' ? '#FEE2E2' : '#FEF9C3' }]}>
                  <Text style={[S.statusText, { color: item.status === 'SUCCEEDED' ? '#16A34A' : item.status === 'FAILED' ? '#DC2626' : '#CA8A04' }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8' }}>No payments found.</Text>
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
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  amount: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  method: { fontSize: 13, fontWeight: '600', color: '#64748B', marginTop: 4 },
  date: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
});
