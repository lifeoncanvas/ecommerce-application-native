import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'my_orders',
      title: 'My Orders',
      subtitle: 'Track, cancel, or view order history',
      icon: '📦',
      onPress: () => navigation.navigate('MyOrders'),
    },
    {
      id: 'addresses',
      title: 'Delivery Addresses',
      subtitle: 'Manage saved checkout locations',
      icon: '📍',
      onPress: () => {},
    },
    {
      id: 'payment_methods',
      title: 'Payment Cards',
      subtitle: 'Manage Stripe & PayPal configurations',
      icon: '💳',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Profile Avatar Card */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.profileEmail}>{user?.email ?? 'guest@httn.shop'}</Text>
          <Text style={styles.profileRole}>E-Commerce Guest Member</Text>
        </View>

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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
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
    color: colors.navy,
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
    flex: 1,
    gap: spacing.md,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
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
    marginBottom: spacing.md,
  },
  logoutBtn: {
    borderColor: colors.error,
    borderWidth: 1,
  },
});
