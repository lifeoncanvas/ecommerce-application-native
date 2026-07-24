import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';

export default function OrderSuccessScreen({ route, navigation }) {
  const { orderId, totalAmount } = route.params || { orderId: 'ORD-000000', totalAmount: 0.00 };

  const handleContinueShopping = () => {
    // Reset back to HomeMain tab and clear CartStack history
    navigation.reset({
      index: 0,
      routes: [{ name: 'CartMain' }],
    });
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Green Circle Check SVG */}
        <View style={styles.iconContainer}>
          <Svg width="100" height="100" viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="46" fill={colors.surface} stroke={colors.success} strokeWidth="4" />
            <Path
              d="M32 50 L44 62 L68 36"
              fill="none"
              stroke={colors.success}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>Thank you for your purchase. Your order has been registered.</Text>

        {/* Order Details box */}
        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.value}>{orderId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>Processed Offline</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount Paid</Text>
            <Text style={styles.grandValue}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Shipping details */}
        <View style={styles.shippingNotice}>
          <Text style={styles.noticeEmoji}>🚚</Text>
          <View style={styles.noticeTextCol}>
            <Text style={styles.noticeTitle}>Estimated Delivery</Text>
            <Text style={styles.noticeSub}>Arrival in 3 - 5 business days</Text>
          </View>
        </View>

        {/* Action Button Row */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinueShopping}
            activeOpacity={0.8}
          >
            <Text style={styles.continueBtnText}>Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => {
              // Reset navigation stack to Cart tab main screen first
              navigation.reset({
                index: 0,
                routes: [{ name: 'CartMain' }],
              });
              // Then switch to Profile tab
              navigation.navigate('Profile');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.trackBtnText}>View My Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.navy,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  grandValue: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  shippingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    width: '100%',
    gap: spacing.md,
  },
  noticeEmoji: {
    fontSize: 24,
  },
  noticeTextCol: {
    flex: 1,
  },
  noticeTitle: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 13,
  },
  noticeSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    width: '100%',
    marginTop: spacing.xl * 1.5,
    gap: spacing.md,
  },
  continueBtn: {
    width: '100%',
    height: 50,
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  trackBtn: {
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  trackBtnText: {
    ...typography.button,
    color: colors.navy,
    fontWeight: '700',
  },
});
