import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput } from 'react-native';
import { CaretLeft, MagnifyingGlass, Storefront, Prohibit, CheckCircle } from 'phosphor-react-native';
import { getAdminVendors, updateAdminVendorStatus } from '../../api/admin.api';

export default function AdminSellersScreen({ navigation }) {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const res = await getAdminVendors(0, 50);
      if (res?.data?.content) setSellers(res.data.content);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (seller, newStatus) => {
    try {
      await updateAdminVendorStatus(seller.id, newStatus);
      setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, status: newStatus } : s));
      Alert.alert('Success', `Seller status updated to ${newStatus}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to update seller status');
    }
  };

  const filteredSellers = sellers.filter(s => 
    (s.storeName || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.businessEmail || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={S.root}>
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#1E293B" weight="bold" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Seller Management</Text>
      </View>

      <View style={S.searchBox}>
        <MagnifyingGlass size={18} color="#94A3B8" />
        <TextInput 
          style={S.searchInput}
          placeholder="Search stores by name or email..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={S.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredSellers}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={S.sellerCard}>
              <View style={S.sellerRow}>
                <Storefront size={40} color="#94A3B8" weight="fill" />
                <View style={S.sellerInfo}>
                  <Text style={S.storeName}>{item.storeName || 'Unnamed Store'}</Text>
                  <Text style={S.ownerEmail}>{item.businessEmail}</Text>
                  <Text style={S.regDate}>Joined: {new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={[S.statusBadge, { backgroundColor: item.status === 'APPROVED' ? '#DCFCE7' : item.status === 'PENDING' ? '#FEF9C3' : '#FEE2E2' }]}>
                  <Text style={[S.statusText, { color: item.status === 'APPROVED' ? '#16A34A' : item.status === 'PENDING' ? '#CA8A04' : '#DC2626' }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={S.actions}>
                {item.status !== 'APPROVED' && (
                  <TouchableOpacity style={S.actionBtnSuccess} onPress={() => handleUpdateStatus(item, 'APPROVED')}>
                    <CheckCircle size={16} color="#16A34A" />
                    <Text style={S.actionBtnSuccessText}>Approve Store</Text>
                  </TouchableOpacity>
                )}
                {item.status !== 'SUSPENDED' && item.status !== 'REJECTED' && (
                  <TouchableOpacity style={S.actionBtnDanger} onPress={() => handleUpdateStatus(item, 'SUSPENDED')}>
                    <Prohibit size={16} color="#DC2626" />
                    <Text style={S.actionBtnDangerText}>Suspend Store</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
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
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sellerCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  sellerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  sellerInfo: { flex: 1, marginLeft: 12 },
  storeName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  ownerEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  regDate: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: '#F1F5F9' },
  actionBtnDanger: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  actionBtnDangerText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  actionBtnSuccess: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  actionBtnSuccessText: { color: '#16A34A', fontSize: 13, fontWeight: '600' },
});
