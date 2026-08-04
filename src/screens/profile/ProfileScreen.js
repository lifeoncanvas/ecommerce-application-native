import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const menuItems = [
    {
      id: 'edit_profile',
      title: 'Edit Profile',
      subtitle: 'Manage your name, email, and phone number',
      icon: '👤',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'my_orders',
      title: 'My Orders',
      subtitle: 'Track, cancel, or view order history',
      icon: '📦',
      onPress: () => navigation.navigate('MyOrders'),
    },
    user?.isVendor ? {
      id: 'vendor_dashboard',
      title: 'Seller Dashboard',
      subtitle: 'Manage your store orders and inventory stats',
      icon: '📈',
      onPress: () => navigation.navigate('VendorDashboard'),
    } : {
      id: 'become_vendor',
      title: 'Become a Seller',
      subtitle: 'Register your store and list premium items',
      icon: '🏪',
      onPress: () => navigation.navigate('BecomeVendor'),
    },
    {
      id: 'change_password',
      title: 'Change Password',
      subtitle: 'Update your account login password',
      icon: '🔒',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      id: 'exchanges',
      title: 'Product Exchanges',
      subtitle: 'Track and manage your item exchange requests',
      icon: '🔄',
      onPress: () => navigation.navigate('ExchangeList'),
    },
    {
      id: 'support',
      title: 'Help & Support',
      subtitle: 'Open support cases and ask technical queries',
      icon: '☎️',
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: 'loyalty',
      title: 'Loyalty Rewards',
      subtitle: 'Earn points and redeem discount coupons',
      icon: '🪙',
      onPress: () => navigation.navigate('Loyalty'),
    },
    {
      id: 'contact',
      title: 'Contact Us',
      subtitle: 'Official channels and direct support messages',
      icon: '📞',
      onPress: () => navigation.navigate('Contact'),
    },
    {
      id: 'about',
      title: 'About Us',
      subtitle: 'Read our story, mission, and release details',
      icon: 'ℹ️',
      onPress: () => navigation.navigate('About'),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'How we safely collect and protect user data',
      icon: '🛡️',
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      subtitle: 'User agreements, purchases, and refund policies',
      icon: '📄',
      onPress: () => navigation.navigate('TermsConditions'),
    },
    {
      id: 'settings',
      title: 'App Settings',
      subtitle: 'Configure alert and layout preferences',
      icon: '⚙️',
      onPress: () => navigation.navigate('Settings'),
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
        <TouchableOpacity
          style={styles.avatarSection}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.8}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{user?.avatar || '👤'}</Text>
          </View>
          <Text style={styles.profileEmail}>{user?.fullName || user?.name || 'Guest User'}</Text>
          <Text style={styles.profileRole}>{user?.email || 'guest@kingsshoppers.com'}</Text>
        </TouchableOpacity>

        {/* Menu Items List */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuRow}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuEmoji}>{item.icon}</Text>
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Svg width="16" height="16" viewBox="0 0 24 24" style={styles.chevron}>
                <Path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill={colors.textSecondary} />
              </Svg>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutWrapper}>
          <Button
            title="Sign Out of Account"
            variant="secondary"
            onPress={logout}
            style={styles.logoutBtn}
          />
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  profileEmail: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
    marginTop: spacing.md,
  },
  profileRole: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  menuList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuEmoji: {
    fontSize: 20,
  },
  menuTextCol: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  logoutWrapper: {
    width: '100%',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  logoutBtn: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
});
