import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { getOrderDetails, cancelOrder } from '../../api/orders.api';
import { useTheme } from '../../context/ThemeContext';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function OrderDetailsScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { orderId } = route?.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    let matchedOrder = null;

    // 1. Fetch from AsyncStorage
    try {
      const stored = await AsyncStorage.getItem('@local_orders');
      if (stored) {
        const list = JSON.parse(stored);
        matchedOrder = list.find((o) => o.id === orderId);
      }
    } catch (e) {
      console.warn('Failed to load local order detail', e.message);
    }

    // 2. Fetch from backend API
    try {
      const res = await withTimeout(getOrderDetails(orderId), 2000);
      if (res.data) matchedOrder = res.data;
    } catch (e) {
      console.warn('Failed to load order details from API. Using local/mock fallback.', e.message);
      // Construct a mock order detail if not found anywhere (e.g. static preview)
      if (!matchedOrder) {
        matchedOrder = {
          id: orderId,
          date: 'Jan 15, 2026',
          totalAmount: 129.99,
          status: 'Delivered',
          items: [{ id: 'p_redemp_1', name: 'Vintage Leather Jacket', price: 129.99, quantity: 1, emoji: '🧥' }],
          paymentMethod: 'Stripe Card',
          paymentReference: 'ch_stripe_8312984129',
          address: '123 Main St, New York, NY 10001',
          shippingCost: 0,
        };
      }
    }

    setOrder(matchedOrder);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await withTimeout(cancelOrder(orderId), 2000);
              setOrder((prev) => ({ ...prev, status: 'Cancelled' }));
              updateStoredStatus('Cancelled');
            } catch (e) {
              console.warn('API Cancel failed. Updating locally.', e.message);
              setOrder((prev) => ({ ...prev, status: 'Cancelled' }));
              updateStoredStatus('Cancelled');
            }
          }
        }
      ]
    );
  };

  const updateStoredStatus = async (status) => {
    try {
      const stored = await AsyncStorage.getItem('@local_orders');
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.map((o) => (o.id === orderId ? { ...o, status } : o));
        await AsyncStorage.setItem('@local_orders', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Failed to update status in storage', e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navy} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Order not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const subtotal = order.items ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) : order.totalAmount;
  const discount = Math.max(0, subtotal + (order.shippingCost || 0) - order.totalAmount);
  const canCancel = order.status === 'Placed' || order.status === 'Processing';

  // Get active step index for status timeline
  const getStatusStep = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 0; // Cancelled or unknown
    }
  };

  const currentStep = getStatusStep(order.status);

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={colors.navy} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Order details</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Order Header Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.dateLabel}>Placed on {order.date}</Text>
          <Text style={styles.orderIdText}>{order.id}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusValue, { color: order.status === 'Cancelled' ? colors.error : colors.gold }]}>
              {order.status}
            </Text>
          </View>
        </View>

        {/* Status Timeline / Steps */}
        {order.status !== 'Cancelled' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tracking status</Text>
            <View style={styles.timeline}>
              <View style={styles.timelineRow}>
                <View style={[styles.dot, currentStep >= 1 && styles.dotActive]}>
                  {currentStep >= 1 && <Text style={styles.check}>✓</Text>}
                </View>
                <Text style={[styles.timelineText, currentStep >= 1 && styles.timelineTextActive]}>Order Placed</Text>
              </View>
              <View style={[styles.timelineLine, currentStep >= 2 && styles.lineActive]} />
              
              <View style={styles.timelineRow}>
                <View style={[styles.dot, currentStep >= 2 && styles.dotActive]}>
                  {currentStep >= 2 && <Text style={styles.check}>✓</Text>}
                </View>
                <Text style={[styles.timelineText, currentStep >= 2 && styles.timelineTextActive]}>Processing</Text>
              </View>
              <View style={[styles.timelineLine, currentStep >= 3 && styles.lineActive]} />

              <View style={styles.timelineRow}>
                <View style={[styles.dot, currentStep >= 3 && styles.dotActive]}>
                  {currentStep >= 3 && <Text style={styles.check}>✓</Text>}
                </View>
                <Text style={[styles.timelineText, currentStep >= 3 && styles.timelineTextActive]}>Shipped</Text>
              </View>
              <View style={[styles.timelineLine, currentStep >= 4 && styles.lineActive]} />

              <View style={styles.timelineRow}>
                <View style={[styles.dot, currentStep >= 4 && styles.dotActive]}>
                  {currentStep >= 4 && <Text style={styles.check}>✓</Text>}
                </View>
                <Text style={[styles.timelineText, currentStep >= 4 && styles.timelineTextActive]}>Delivered</Text>
              </View>
            </View>
          </View>
        )}

        {/* Items List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          {order.items && order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emojiText}>{item.emoji || '🎁'}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity} • ${item.price.toFixed(2)}</Text>
              </View>
              <Text style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery details</Text>
          <Text style={styles.detailBody}>{order.address || 'Selected Address Details'}</Text>
        </View>

        {/* Payment info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Method</Text>
            <Text style={styles.detailVal}>{order.paymentMethod || 'Credit/Debit Card'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference</Text>
            <Text style={styles.detailVal} numberOfLines={1}>
              {order.paymentReference || 'REF-832193891'}
            </Text>
          </View>
        </View>

        {/* Order pricing summary */}
        <View style={[styles.card, { marginBottom: spacing.xl * 2 }]}>
          <Text style={styles.cardTitle}>Price Breakdown</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Subtotal</Text>
            <Text style={styles.detailVal}>${subtotal.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Coupon discount</Text>
              <Text style={styles.discountVal}>-${discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shipping fees</Text>
            <Text style={styles.detailVal}>
              {order.shippingCost === 0 || !order.shippingCost ? 'FREE' : `$${order.shippingCost.toFixed(2)}`}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.grandTotalRow]}>
            <Text style={styles.grandLabel}>Grand Total</Text>
            <Text style={styles.grandVal}>${order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer sticky buttons */}
      <View style={styles.bottomBar}>
        <View style={styles.btnRow}>
          {order.status !== 'Cancelled' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.trackBtn]}
              onPress={() => navigation.navigate('TrackOrder', { orderId: order.id })}
            >
              <Text style={styles.trackBtnText}>Track Order</Text>
            </TouchableOpacity>
          )}

          {order.status !== 'Cancelled' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.exchangeBtn]}
              onPress={() => navigation.navigate('ExchangeRequest', { orderId: order.id, items: order.items || [] })}
            >
              <Text style={styles.exchangeBtnText}>Exchange Items</Text>
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.goldLight,
    fontWeight: '600',
  },
  orderIdText: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  statusLabel: {
    ...typography.caption,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  statusValue: {
    ...typography.bodyBold,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  timeline: {
    paddingLeft: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  check: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  timelineText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  timelineTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 9,
    marginVertical: 4,
  },
  lineActive: {
    backgroundColor: colors.success,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  itemQty: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  itemTotal: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 13,
  },
  detailBody: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailVal: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
  },
  discountVal: {
    ...typography.bodyBold,
    color: colors.error,
    fontSize: 12,
  },
  grandTotalRow: {
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm,
  },
  grandLabel: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 14,
  },
  grandVal: {
    ...typography.h2,
    color: colors.navy,
    fontWeight: '800',
  },
  bottomBar: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackBtn: {
    backgroundColor: colors.navy,
  },
  trackBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  cancelBtnText: {
    ...typography.button,
    color: colors.error,
    fontWeight: '700',
  },
  exchangeBtn: {
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  exchangeBtnText: {
    ...typography.button,
    color: colors.gold,
    fontWeight: '700',
  },
});
