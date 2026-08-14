import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { CURRENCY } from '../../utils/currency';

export default function OrderSuccessScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { orderId, totalAmount, isBooking, selectedItems } = route.params || { orderId: 'ORD-000000', totalAmount: 0.00 };

  const handleContinueShopping = () => {
    // Reset back to CartMain tab and clear CartStack history
    navigation.reset({
      index: 0,
      routes: [{ name: 'CartMain' }],
    });
    navigation.navigate('Home');
  };

  if (isBooking) {
    const bookingItem = selectedItems?.[0] || {
      name: 'Premium Service Booking',
      brand: 'Kings Shoppers Partner',
      bookingDay: 'Today',
      bookingTimeSlot: '12:00 PM - 01:30 PM',
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.bookingTitle}>Booking Confirmed! 🎉</Text>
          <Text style={styles.bookingSubtitle}>Your reservation has been secured. Present this ticket at the venue.</Text>

          {/* Styled Entry Ticket */}
          <View style={styles.ticketCard}>
            {/* Left/Right punched notches */}
            <View style={[styles.ticketNotch, styles.notchLeft]} />
            <View style={[styles.ticketNotch, styles.notchRight]} />

            {/* Ticket Header */}
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketCategory}>OFFICIAL ENTRY TICKET</Text>
              <Text style={styles.ticketBrand}>{bookingItem.brand}</Text>
            </View>

            {/* Ticket Content */}
            <View style={styles.ticketBody}>
              <Text style={styles.ticketItemName}>{bookingItem.name}</Text>
              
              <View style={styles.ticketDetailsRow}>
                <View style={styles.ticketDetailCol}>
                  <Text style={styles.ticketDetailLabel}>DATE</Text>
                  <Text style={styles.ticketDetailVal}>{bookingItem.bookingDay}</Text>
                </View>
                <View style={styles.ticketDetailCol}>
                  <Text style={styles.ticketDetailLabel}>TIME SLOT</Text>
                  <Text style={styles.ticketDetailVal}>{bookingItem.bookingTimeSlot}</Text>
                </View>
              </View>

              <View style={styles.ticketDetailsRow}>
                <View style={styles.ticketDetailCol}>
                  <Text style={styles.ticketDetailLabel}>TICKET NO.</Text>
                  <Text style={styles.ticketDetailVal}>{orderId || 'BKG-098431'}</Text>
                </View>
                <View style={styles.ticketDetailCol}>
                  <Text style={styles.ticketDetailLabel}>STATUS</Text>
                  <Text style={[styles.ticketDetailVal, { color: '#16A34A', fontWeight: '800' }]}>CONFIRMED</Text>
                </View>
              </View>

              <View style={styles.ticketDetailsRow}>
                <View style={styles.ticketDetailCol}>
                  <Text style={styles.ticketDetailLabel}>TOTAL PAID</Text>
                  <Text style={styles.ticketDetailVal}>{CURRENCY.format(totalAmount)}</Text>
                </View>
              </View>
            </View>

            {/* Dashed Perforated Divider */}
            <View style={styles.ticketDividerPattern} />

            {/* Barcode Section */}
            <View style={styles.barcodeSection}>
              <View style={styles.barcodeLines}>
                {[1, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1].map((w, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: w * 2.2,
                      height: 44,
                      backgroundColor: '#1E293B',
                      marginHorizontal: 1.5,
                    }}
                  />
                ))}
              </View>
              <Text style={styles.barcodeText}>{orderId || 'BKG-098431'}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinueShopping}
              activeOpacity={0.8}
            >
              <Text style={styles.continueBtnText}>Explore More Services</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'CartMain' }],
                });
                navigation.navigate('Profile');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.trackBtnText}>My Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.grandValue}>{CURRENCY.format(totalAmount)}</Text>
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

const getStyles = (colors) => StyleSheet.create({
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
  bookingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#06132F',
    textAlign: 'center',
  },
  bookingSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 20,
    paddingHorizontal: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    overflow: 'hidden',
  },
  ticketNotch: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FAF9F5',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    zIndex: 5,
  },
  notchLeft: {
    left: -12,
    top: '73%',
  },
  notchRight: {
    right: -12,
    top: '73%',
  },
  ticketHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    alignItems: 'center',
  },
  ticketCategory: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#A8824B',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  ticketBrand: {
    fontSize: 18,
    fontWeight: '900',
    color: '#06132F',
    marginTop: 4,
  },
  ticketBody: {
    paddingVertical: 16,
  },
  ticketItemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 16,
  },
  ticketDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketDetailCol: {
    flex: 1,
  },
  ticketDetailLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  ticketDetailVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#06132F',
    marginTop: 2,
  },
  ticketDividerPattern: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 1,
    width: '100%',
    marginVertical: 10,
  },
  barcodeSection: {
    alignItems: 'center',
    paddingTop: 12,
  },
  barcodeLines: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 3,
    marginTop: 6,
    textTransform: 'uppercase',
  },
});
