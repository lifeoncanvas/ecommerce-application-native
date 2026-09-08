import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { CaretLeft, Bank, CheckCircle, Prohibit, Clock } from 'phosphor-react-native';
import { getAdminPayouts, approveAdminPayout, processAdminPayout, failAdminPayout } from '../../api/admin.api';

export default function AdminPayoutsScreen({ navigation }) {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const res = await getAdminPayouts(0, 50);
      if (res?.data?.content) setPayouts(res.data.content);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (item, action) => {
    try {
      if (action === 'approve') {
        await approveAdminPayout(item.id);
        setPayouts(prev => prev.map(p => p.id === item.id ? { ...p, status: 'APPROVED' } : p));
        Alert.alert('Success', 'Payout approved');
      } else if (action === 'process') {
        await processAdminPayout(item.id);
        setPayouts(prev => prev.map(p => p.id === item.id ? { ...p, status: 'PAID' } : p));
        Alert.alert('Success', 'Payout processed and marked as paid');
      } else if (action === 'fail') {
        Alert.prompt('Fail Payout', 'Enter reason for failing this payout:', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Fail', style: 'destructive', onPress: async (reason) => {
              await failAdminPayout(item.id, reason || 'Admin rejected');
              setPayouts(prev => prev.map(p => p.id === item.id ? { ...p, status: 'FAILED' } : p));
            } 
          }
        ]);
      }
    } catch (e) {
      Alert.alert('Error', `Failed to ${action} payout`);
    }
  };

  return (
    <SafeAreaView style={S.root}>
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#1E293B" weight="bold" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Seller Payout Requests</Text>
      </View>

      {loading ? (
        <View style={S.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={payouts}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={S.card}>
              <View style={S.cardRow}>
                <View style={S.iconBox}>
                  <Bank size={24} color="#8B5CF6" weight="fill" />
                </View>
                <View style={S.info}>
                  <Text style={S.amount}>₦{Number(item.amount || 0).toLocaleString('en-NG')}</Text>
                  <Text style={S.vendor}>Vendor ID: {item.vendor?.id || 'Unknown'}</Text>
                  <Text style={S.date}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
                <View style={[S.statusBadge, { 
                  backgroundColor: item.status === 'PAID' ? '#DCFCE7' : item.status === 'FAILED' ? '#FEE2E2' : item.status === 'APPROVED' ? '#DBEAFE' : '#FEF9C3' 
                }]}>
                  <Text style={[S.statusText, { 
                    color: item.status === 'PAID' ? '#16A34A' : item.status === 'FAILED' ? '#DC2626' : item.status === 'APPROVED' ? '#2563EB' : '#CA8A04' 
                  }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={S.actions}>
                {item.status === 'PENDING' && (
                  <TouchableOpacity style={S.actionBtnApprove} onPress={() => handleAction(item, 'approve')}>
                    <CheckCircle size={16} color="#2563EB" />
                    <Text style={S.actionBtnApproveText}>Approve</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'APPROVED' && (
                  <TouchableOpacity style={S.actionBtnProcess} onPress={() => handleAction(item, 'process')}>
                    <Clock size={16} color="#16A34A" />
                    <Text style={S.actionBtnProcessText}>Mark as Paid</Text>
                  </TouchableOpacity>
                )}
                {(item.status === 'PENDING' || item.status === 'APPROVED') && (
                  <TouchableOpacity style={S.actionBtnReject} onPress={() => handleAction(item, 'fail')}>
                    <Prohibit size={16} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8' }}>No payout requests found.</Text>
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
  iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  amount: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  vendor: { fontSize: 13, fontWeight: '600', color: '#64748B', marginTop: 4 },
  date: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: '#F1F5F9' },
  actionBtnApprove: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: '#DBEAFE', paddingVertical: 10, borderRadius: 8 },
  actionBtnApproveText: { color: '#2563EB', fontSize: 13, fontWeight: '700' },
  actionBtnProcess: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: '#DCFCE7', paddingVertical: 10, borderRadius: 8 },
  actionBtnProcessText: { color: '#16A34A', fontSize: 13, fontWeight: '700' },
  actionBtnReject: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 16, borderRadius: 8 },
});
