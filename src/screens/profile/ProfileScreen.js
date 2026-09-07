import React, { useState, useEffect, Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: 'red', marginBottom: 10 }}>Profile Screen Crashed!</Text>
          <Text style={{ fontSize: 12, color: '#333' }}>{this.state.error?.toString()}</Text>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getLoyaltyStatus } from '../../api/loyalty.api';
import { getOrders } from '../../api/orders.api';
import {
  User,
  Package,
  Storefront,
  Key,
  ArrowsCounterClockwise,
  Headset,
  Crown,
  Phone,
  Info,
  ShieldCheck,
  FileText,
  Gear,
  SignOut,
  CaretRight,
  ChartLineUp,
} from 'phosphor-react-native';

export default function ProfileScreen({ navigation, route }) {
  const { user, logout } = useAuth();
  const themeContext = useTheme();
  const colors = themeContext?.colors || {};

  const [points, setPoints] = useState(250);
  const [orderCount, setOrderCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  // Auto-open Vendor Dashboard if this is a vendor login
  useEffect(() => {
    const isVendor =
      user?.isVendor ||
      user?.role === 'STORE_OWNER' ||
      user?.email?.includes('@store.com') ||
      user?.email?.includes('@vendor.com');
    if (isVendor && route?.params?.openVendorDashboard) {
      const timer = setTimeout(() => {
        navigation.navigate('VendorDashboard');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [route?.params?.openVendorDashboard, user]);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      if (!user) return;
      setLoadingStats(true);
      try {
        const pointsRes = await getLoyaltyStatus();
        if (isMounted && pointsRes?.data && pointsRes.data.points !== undefined) {
          setPoints(pointsRes.data.points);
        }
      } catch (e) {
        console.warn('Loyalty points fetch failed:', e.message);
      }
      try {
        const ordersRes = await getOrders();
        if (isMounted && ordersRes?.data && Array.isArray(ordersRes.data)) {
          const active = ordersRes.data.filter(
            (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
          ).length;
          setOrderCount(active);
        }
      } catch (e) {
        console.warn('Orders fetch failed:', e.message);
      }
      if (isMounted) setLoadingStats(false);
    }
    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const sections = [
    {
      title: 'Shopping & Loyalty',
      items: [
        {
          id: 'my_orders',
          title: 'My Orders',
          subtitle: 'Track, cancel, or view order history',
          Icon: Package,
          iconBg: '#EFF6FF',
          iconColor: '#1D4ED8',
          onPress: () => navigation.navigate('MyOrders'),
        },
        {
          id: 'exchanges',
          title: 'Product Exchanges',
          subtitle: 'Track and manage your item exchange requests',
          Icon: ArrowsCounterClockwise,
          iconBg: '#EFF6FF',
          iconColor: '#1D4ED8',
          onPress: () => navigation.navigate('ExchangeList'),
        },
        {
          id: 'loyalty',
          title: 'Loyalty Rewards',
          subtitle: 'Earn points and redeem discount coupons',
          Icon: Crown,
          iconBg: '#FFFBEB',
          iconColor: '#D97706',
          onPress: () => navigation.navigate('Loyalty'),
        },
      ],
    },
    {
      title: 'Account Settings',
      items: [
        {
          id: 'edit_profile',
          title: 'Edit Profile',
          subtitle: 'Manage your name, email, and phone number',
          Icon: User,
          iconBg: '#EFF6FF',
          iconColor: '#1D4ED8',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'change_password',
          title: 'Change Password',
          subtitle: 'Update your account login password',
          Icon: Key,
          iconBg: '#EFF6FF',
          iconColor: '#1D4ED8',
          onPress: () => navigation.navigate('ChangePassword'),
        },
        {
          id: 'settings',
          title: 'App Settings',
          subtitle: 'Configure alert and layout preferences',
          Icon: Gear,
          iconBg: '#F3F4F6',
          iconColor: '#4B5563',
          onPress: () => navigation.navigate('Settings'),
        },
      ],
    },
    {
      title: 'Seller & Store Portal',
      items: [
        user?.isVendor ||
        user?.role === 'STORE_OWNER' ||
        user?.email?.includes('@store.com') ||
        user?.email?.includes('@vendor.com')
          ? {
              id: 'vendor_dashboard',
              title: 'Store Management Portal 🏬',
              subtitle: 'Add/remove products, edit prices, images & orders',
              Icon: ChartLineUp,
              iconBg: '#FFFBEB',
              iconColor: '#D97706',
              onPress: () => navigation.navigate('VendorDashboard'),
            }
          : {
              id: 'become_vendor',
              title: 'Become a Seller / Store Owner 🏬',
              subtitle: 'Register your store and access Vendor Portal',
              Icon: Storefront,
              iconBg: '#FFFBEB',
              iconColor: '#D97706',
              onPress: () => navigation.navigate('BecomeVendor'),
            },
      ],
    },
    {
      title: 'Platform Administration',
      items: [
        {
          id: 'admin_portal',
          title: 'Admin User & Store Management 🛡️',
          subtitle: 'Manage admins, approve/suspend sellers, ban/unban customers',
          Icon: ShieldCheck,
          iconBg: '#F3E8FF',
          iconColor: '#7E22CE',
          onPress: () => navigation.navigate('AdminDashboard'),
        },
      ],
    },
    {
      title: 'Support & Info',
      items: [
        {
          id: 'support',
          title: 'Help & Support',
          subtitle: 'Open support cases and ask technical queries',
          Icon: Headset,
          iconBg: '#EFF6FF',
          iconColor: '#1D4ED8',
          onPress: () => navigation.navigate('Support'),
        },
        {
          id: 'contact',
          title: 'Contact Us',
          subtitle: 'Official channels and direct support messages',
          Icon: Phone,
          iconBg: '#EFF6FF',
          iconColor: '#1D4ED8',
          onPress: () => navigation.navigate('Contact'),
        },
        {
          id: 'about',
          title: 'About Us',
          subtitle: 'Read our story, mission, and release details',
          Icon: Info,
          iconBg: '#F3F4F6',
          iconColor: '#4B5563',
          onPress: () => navigation.navigate('About'),
        },
      ],
    },
    {
      title: 'Legal Agreements',
      items: [
        {
          id: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'How we safely collect and protect user data',
          Icon: ShieldCheck,
          iconBg: '#F3F4F6',
          iconColor: '#4B5563',
          onPress: () => navigation.navigate('PrivacyPolicy'),
        },
        {
          id: 'terms',
          title: 'Terms & Conditions',
          subtitle: 'User agreements, purchases, and refund policies',
          Icon: FileText,
          iconBg: '#F3F4F6',
          iconColor: '#4B5563',
          onPress: () => navigation.navigate('TermsConditions'),
        },
      ],
    },
  ];

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safeContainer}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Avatar Card */}
          <View style={styles.profileCard}>
            <View style={styles.userInfoRow}>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.fullName || user?.name || 'Guest User'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'guest@litemarket.com'}</Text>

                {/* Loyalty membership badge */}
                <View style={styles.membershipBadge}>
                  <Crown size={11} color="#F59E0B" weight="fill" />
                  <Text style={styles.membershipText}>
                    {points >= 500 ? 'Platinum Member' : points >= 200 ? 'Gold Member' : 'Loyalty Member'}
                  </Text>
                </View>

                {/* Store Owner Quick Portal Shortcut Button */}
                {(user?.isVendor ||
                  user?.role === 'STORE_OWNER' ||
                  user?.email?.includes('@store.com') ||
                  user?.email?.includes('@vendor.com')) && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#1E293B',
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      marginTop: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => navigation.navigate('VendorDashboard')}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>
                      🏬 Open Store Portal
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.profileDivider} />

            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statCol}
                onPress={() => navigation.navigate('Loyalty')}
                activeOpacity={0.7}
              >
                <Crown size={20} color="#F59E0B" weight="fill" style={styles.statIcon} />
                <View>
                  <Text style={styles.statLabel}>Loyalty Balance</Text>
                  <Text style={styles.statValue}>{points} PTS</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              <TouchableOpacity
                style={styles.statCol}
                onPress={() => navigation.navigate('MyOrders')}
                activeOpacity={0.7}
              >
                <Package size={20} color="#2952CC" weight="regular" style={styles.statIcon} />
                <View>
                  <Text style={styles.statLabel}>Active Orders</Text>
                  {loadingStats ? (
                    <ActivityIndicator size="small" color="#111827" style={{ height: 16, marginTop: 4, alignSelf: 'flex-start' }} />
                  ) : (
                    <Text style={styles.statValue}>
                      {`${orderCount} ${orderCount === 1 ? 'Order' : 'Orders'}`}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Grouped Menu List */}
          {sections.map((section) => (
            <View key={section.title} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionCard}>
                {section.items.map((item, index) => {
                  const ItemIcon = item.Icon;
                  return (
                    <View key={item.id}>
                      <TouchableOpacity
                        style={styles.menuRow}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.menuIconContainer, { backgroundColor: item.iconBg }]}>
                          <ItemIcon size={20} color={item.iconColor} weight="regular" />
                        </View>
                        <View style={styles.menuTextCol}>
                          <Text style={styles.menuTitle}>{item.title}</Text>
                          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </View>
                        <CaretRight size={16} color="#9CA3AF" weight="bold" style={styles.chevron} />
                      </TouchableOpacity>
                      {index < section.items.length - 1 && <View style={styles.menuRowDivider} />}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Custom Logout Button */}
          <View style={styles.logoutWrapper}>
            <TouchableOpacity
              style={styles.customLogoutBtn}
              onPress={logout}
              activeOpacity={0.8}
            >
              <SignOut size={18} color="#DC2626" weight="bold" />
              <Text style={styles.customLogoutBtnText}>Sign Out of Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF6E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  membershipText: {
    fontSize: 10,
    color: '#7A4F00',
    fontWeight: '600',
  },
  profileDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statIcon: {
    marginRight: 8,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuRowDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 68,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextCol: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 13.5,
    color: '#111827',
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
  logoutWrapper: {
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  customLogoutBtn: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
  },
  customLogoutBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});

