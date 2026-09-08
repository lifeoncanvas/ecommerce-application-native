import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  CaretLeft,
  Users,
  Storefront,
  Package,
  ShoppingBag,
  ListDashes,
  Money,
  Star,
  Bell,
  Gear,
} from 'phosphor-react-native';
import { getAdminDashboardStats } from '../../api/admin.api';

export default function AdminDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalVendors: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getAdminDashboardStats();
      if (res?.data) {
        setStats(res.data);
      }
    } catch (e) {
      console.log('Failed to load admin stats', e);
    }
  };

  const menuItems = [
    { title: 'Customers', icon: Users, route: 'AdminUsers', desc: 'Manage user accounts', count: stats.totalUsers },
    { title: 'Sellers', icon: Storefront, route: 'AdminSellers', desc: 'Approve & suspend stores', count: stats.totalVendors },
    { title: 'Products', icon: Package, route: 'AdminProducts', desc: 'Global catalog control', count: stats.totalProducts },
    { title: 'Orders', icon: ShoppingBag, route: 'AdminOrders', desc: 'View all orders', count: stats.totalOrders },
    { title: 'Categories', icon: ListDashes, route: null, desc: 'Manage taxonomy', count: null },
    { title: 'Payments', icon: Money, route: null, desc: 'Financial transactions', count: null },
    { title: 'Reviews', icon: Star, route: null, desc: 'Moderate feedback', count: null },
    { title: 'Settings', icon: Gear, route: null, desc: 'Platform config', count: null },
  ];

  return (
    <SafeAreaView style={S.root}>
      {/* Top Header */}
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#010E2A" weight="bold" />
        </TouchableOpacity>
        <View style={S.headerTitleWrapper}>
          <Text style={S.headerTitle}>Super Admin Portal</Text>
          <Text style={S.headerSubTitle}>{user?.email || 'Admin'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.scrollContent}>
        <View style={S.banner}>
          <Text style={S.bannerTitle}>Platform Overview</Text>
          <Text style={S.bannerSub}>Select a module below to manage the platform.</Text>
        </View>

        <View style={S.grid}>
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={idx}
                style={[S.gridItem, !item.route && { opacity: 0.5 }]}
                onPress={() => item.route ? navigation.navigate(item.route) : null}
                disabled={!item.route}
              >
                <View style={S.iconCircle}>
                  <Icon size={24} color="#2563EB" weight="fill" />
                </View>
                <Text style={S.itemTitle}>{item.title}</Text>
                <Text style={S.itemDesc}>{item.desc}</Text>
                {item.count !== null && item.count !== undefined && (
                  <View style={S.badge}>
                    <Text style={S.badgeText}>{item.count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, marginRight: 12 },
  headerTitleWrapper: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#010E2A' },
  headerSubTitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  scrollContent: { padding: 16, paddingBottom: 50 },
  banner: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, marginBottom: 20 },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  bannerSub: { color: '#94A3B8', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 4 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  itemDesc: { fontSize: 12, color: '#64748B' },
  badge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
});
