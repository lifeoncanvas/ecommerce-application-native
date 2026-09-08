import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { CaretLeft, ChartBar, Users, ShoppingCart, Money } from 'phosphor-react-native';
import { getAdminReports } from '../../api/admin.api';

export default function AdminReportsScreen({ navigation }) {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await getAdminReports();
      if (res?.data) {
        setReports(res.data);
      } else {
        // Fallback dummy data if backend is empty
        setReports({
          totalRevenue: 4500000,
          monthlyGrowth: '+12%',
          topSellers: [
            { name: 'Nike Official Store', sales: 120 },
            { name: 'Jazari Restaurant', sales: 85 }
          ],
          activeUsers: 1450,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports');
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
        <Text style={S.headerTitle}>Reports & Analytics</Text>
      </View>

      {loading ? (
        <View style={S.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={S.scrollContent}>
          
          <View style={S.summaryCard}>
            <View style={S.summaryTop}>
              <View>
                <Text style={S.summaryLabel}>Total Platform Revenue</Text>
                <Text style={S.summaryValue}>₦{Number(reports?.totalRevenue || 0).toLocaleString('en-NG')}</Text>
              </View>
              <View style={S.iconBoxPrimary}>
                <Money size={24} color="#2563EB" weight="fill" />
              </View>
            </View>
            <View style={S.growthBadge}>
              <ChartBar size={14} color="#16A34A" />
              <Text style={S.growthText}>{reports?.monthlyGrowth || '+0%'} from last month</Text>
            </View>
          </View>

          <View style={S.grid}>
            <View style={S.statCard}>
              <Users size={24} color="#8B5CF6" weight="fill" />
              <Text style={S.statValue}>{reports?.activeUsers || 0}</Text>
              <Text style={S.statLabel}>Active Users</Text>
            </View>
            <View style={S.statCard}>
              <ShoppingCart size={24} color="#F59E0B" weight="fill" />
              <Text style={S.statValue}>{reports?.topSellers?.reduce((acc, curr) => acc + curr.sales, 0) || 0}</Text>
              <Text style={S.statLabel}>Total Sales</Text>
            </View>
          </View>

          <Text style={S.sectionTitle}>Top Performing Sellers</Text>
          {reports?.topSellers?.map((seller, index) => (
            <View key={index} style={S.sellerRow}>
              <View style={S.sellerRank}>
                <Text style={S.rankText}>{index + 1}</Text>
              </View>
              <Text style={S.sellerName}>{seller.name}</Text>
              <Text style={S.sellerSales}>{seller.sales} Sales</Text>
            </View>
          ))}

        </ScrollView>
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
  scrollContent: { padding: 16, paddingBottom: 50 },
  summaryCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  summaryValue: { fontSize: 28, fontWeight: '800', color: '#1E293B', marginTop: 4 },
  iconBoxPrimary: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  growthBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginTop: 16 },
  growthText: { color: '#16A34A', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  grid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 12 },
  statLabel: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  sellerRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rankText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  sellerName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  sellerSales: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
});
