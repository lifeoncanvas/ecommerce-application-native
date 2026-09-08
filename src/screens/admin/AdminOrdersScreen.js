import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput } from 'react-native';
import { CaretLeft, MagnifyingGlass, ShoppingBag } from 'phosphor-react-native';
import { getAdminOrders } from '../../api/admin.api';

export default function AdminOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getAdminOrders(0, 50);
      if (res?.data?.content) setOrders(res.data.content);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(search) || 
    (o.orderNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={S.root}>
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#1E293B" weight="bold" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Order Management</Text>
      </View>

      <View style={S.searchBox}>
        <MagnifyingGlass size={18} color="#94A3B8" />
        <TextInput 
          style={S.searchInput}
          placeholder="Search orders by ID..."
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
          data={filteredOrders}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={S.orderCard}>
              <View style={S.orderRow}>
                <View style={S.iconBox}>
                  <ShoppingBag size={24} color="#2563EB" weight="fill" />
                </View>
                <View style={S.orderInfo}>
                  <Text style={S.orderId}>Order #{item.id}</Text>
                  <Text style={S.orderDate}>{new Date(item.createdAt).toLocaleString()}</Text>
                  <Text style={S.orderTotal}>Total: ₦{Number(item.totalAmount || 0).toLocaleString('en-NG')}</Text>
                </View>
                <View style={[S.statusBadge, { backgroundColor: item.status === 'DELIVERED' ? '#DCFCE7' : item.status === 'CANCELLED' ? '#FEE2E2' : '#EFF6FF' }]}>
                  <Text style={[S.statusText, { color: item.status === 'DELIVERED' ? '#16A34A' : item.status === 'CANCELLED' ? '#DC2626' : '#2563EB' }]}>
                    {item.status}
                  </Text>
                </View>
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
  orderCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  orderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  orderInfo: { flex: 1, marginLeft: 12 },
  orderId: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  orderDate: { fontSize: 12, color: '#64748B', marginTop: 2 },
  orderTotal: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
});
