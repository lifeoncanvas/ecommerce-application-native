import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { typography, spacing, radius } from '../../theme';
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
  ChartLineUp
} from 'phosphor-react-native';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [points, setPoints] = useState(250);
  const [orderCount, setOrderCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      if (!user) return;
      setLoadingStats(true);
      try {
        const pointsRes = await getLoyaltyStatus();
        if (isMounted && pointsRes.data && pointsRes.data.points !== undefined) {
          setPoints(pointsRes.data.points);
        }
      } catch (e) {
        console.warn('Loyalty points fetch failed in ProfileScreen:', e.message);
      }
      try {
        const ordersRes = await getOrders();
        if (isMounted && ordersRes.data && Array.isArray(ordersRes.data)) {
          // Count orders that are not delivered or cancelled
          const active = ordersRes.data.filter(
            (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
          ).length;
          setOrderCount(active);
        }
      } catch (e) {
        console.warn('Orders fetch failed in ProfileScreen:', e.message);
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
          iconBg: colors.blue50,
          iconColor: colors.blue700,
          onPress: () => navigation.navigate('MyOrders'),
        },
        {
          id: 'exchanges',
          title: 'Product Exchanges',
          subtitle: 'Track and manage your item exchange requests',
          Icon: ArrowsCounterClockwise,
          iconBg: colors.blue50,
          iconColor: colors.blue700,
          onPress: () => navigation.navigate('ExchangeList'),
        },
        {
          id: 'loyalty',
          title: 'Loyalty Rewards',
          subtitle: 'Earn points and redeem discount coupons',
          Icon: Crown,
          iconBg: colors.gold50,
          iconColor: colors.gold600,
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
          iconBg: colors.blue50,
          iconColor: colors.blue700,
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'change_password',
          title: 'Change Password',
          subtitle: 'Update your account login password',
          Icon: Key,
          iconBg: colors.blue50,
          iconColor: colors.blue700,
          onPress: () => navigation.navigate('ChangePassword'),
        },
        {
          id: 'settings',
          title: 'App Settings',
          subtitle: 'Configure alert and layout preferences',
          Icon: Gear,
          iconBg: colors.surface,
          iconColor: colors.grey600,
          onPress: () => navigation.navigate('Settings'),
        },
      ],
    },
    {
      title: 'Seller Corner',
      items: [
        user?.isVendor ? {
          id: 'vendor_dashboard',
          title: 'Seller Dashboard',
          subtitle: 'Manage your store orders and inventory stats',
          Icon: ChartLineUp,
          iconBg: colors.gold50,
          iconColor: colors.gold600,
          onPress: () => navigation.navigate('VendorDashboard'),
        } : {
          id: 'become_vendor',
          title: 'Become a Seller',
          subtitle: 'Register your store and list premium items',
          Icon: Storefront,
          iconBg: colors.gold50,
          iconColor: colors.gold600,
          onPress: () => navigation.navigate('BecomeVendor'),
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
          iconBg: colors.blue50,
          iconColor: colors.blue700,
          onPress: () => navigation.navigate('Support'),
        },
        {
          id: 'contact',
          title: 'Contact Us',
          subtitle: 'Official channels and direct support messages',
          Icon: Phone,
          iconBg: colors.blue50,
          iconColor: colors.blue700,
          onPress: () => navigation.navigate('Contact'),
        },
        {
          id: 'about',
          title: 'About Us',
          subtitle: 'Read our story, mission, and release details',
          Icon: Info,
          iconBg: colors.surface,
          iconColor: colors.grey600,
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
          iconBg: colors.surface,
          iconColor: colors.grey600,
          onPress: () => navigation.navigate('PrivacyPolicy'),
        },
        {
          id: 'terms',
          title: 'Terms & Conditions',
          subtitle: 'User agreements, purchases, and refund policies',
          Icon: FileText,
          iconBg: colors.surface,
          iconColor: colors.grey600,
          onPress: () => navigation.navigate('TermsConditions'),
        },
      ],
    },
  ];

  return (
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
              <Text style={styles.userEmail}>{user?.email || 'guest@kingsshoppers.com'}</Text>
              
              {/* Loyalty membership badge */}
              <View style={styles.membershipBadge}>
                <Crown size={11} color={colors.gold} weight="fill" />
                <Text style={styles.membershipText}>
                  {points >= 500 ? 'Platinum Member' : points >= 200 ? 'Gold Member' : 'Loyalty Member'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.profileDivider} />
          
          <View style={styles.statsRow}>
            <TouchableOpacity 
              style={styles.statCol}
              onPress={() => navigation.navigate('Loyalty')}
              activeOpacity={0.7}
            >
              <Crown size={20} color={colors.gold} weight="fill" style={styles.statIcon} />
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
              <Package size={20} color={colors.blue500Alt || '#2952CC'} weight="regular" style={styles.statIcon} />
              <View>
                <Text style={styles.statLabel}>Active Orders</Text>
                <Text style={styles.statValue}>
                  {loadingStats ? (
                    <ActivityIndicator size="small" color={colors.textPrimary} style={{ height: 16 }} />
                  ) : (
                    `${orderCount} ${orderCount === 1 ? 'Order' : 'Orders'}`
                  )}
                </Text>
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
                      <CaretRight size={16} color={colors.textSecondary} weight="bold" style={styles.chevron} />
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
            <SignOut size={18} color={colors.error} weight="bold" />
            <Text style={styles.customLogoutBtnText}>Sign Out of Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  // Profile Card
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg || 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
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
  avatarWrapper: {
    position: 'relative',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.blue50 || '#E6EBF2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  avatarText: {
    fontSize: 34,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.blue500Alt || '#2952CC',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold50 || '#FEF6E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  membershipText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: colors.gold800 || '#7A4F00',
    fontWeight: '600',
  },
  profileDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
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
    marginRight: spacing.sm,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: colors.textSecondary,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  
  // Section List
  sectionContainer: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md || 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuRowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 36 + spacing.md, // Align divider with text instead of edge-to-edge
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.sm || 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextCol: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13.5,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  
  // Logout Button
  logoutWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    paddingHorizontal: 4,
  },
  customLogoutBtn: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radius.md || 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.background,
  },
  customLogoutBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
});
