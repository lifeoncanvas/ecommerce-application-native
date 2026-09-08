import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { getOrders, cancelOrder } from '../../api/orders.api';
import { sendLocalNotification } from '../../utils/notificationManager';
import { useTheme } from '../../context/ThemeContext';
import { products as mockProducts } from '../../data/mockData';
import { ALL_FEED_PRODUCTS } from '../../data/mockProductsData';
import {
  CaretLeft,
  ArrowsCounterClockwise,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  Package,
  CaretRight,
  Gift,
} from 'phosphor-react-native';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function MyOrdersScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    let apiOrders = [];
    let localOrders = [];

    try {
      const stored = await AsyncStorage.getItem('@local_orders');
      if (stored) localOrders = JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load local orders from storage', e.message);
    }

    try {
      const res = await withTimeout(getOrders(), 2000);
      apiOrders = res.data || [];
    } catch (e) {
      console.warn('Failed to fetch orders from API. Using local & mock fallbacks.', e.message);
    }

    let merged = [...localOrders, ...apiOrders];

    const hasDelivered = merged.some(o => o.status?.toLowerCase() === 'delivered');
    if (!hasDelivered) {
      const demoDeliveredOrder = {
        id: 'ORD-984321',
        date: 'Jan 23, 2026',
        totalAmount: 1290,
        status: 'Delivered',
        items: [{ id: 'p_redemp_1', name: 'DISHWA FASHION Kurtas', price: 1290, quantity: 1, emoji: '👗', size: 'S' }],
        paymentMethod: 'Stripe Card',
        statusSubtext: 'On Thu, 23 Jan, 1:57 PM'
      };
      
      merged = [demoDeliveredOrder, ...merged];
      
      try {
        await AsyncStorage.setItem('@local_orders', JSON.stringify(merged));
      } catch (err) {
        console.warn('Failed to save seeded delivered order to AsyncStorage', err);
      }
    }

    const unique = merged.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    setOrders(unique);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCancelOrder = (orderId) => {
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
              setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled', statusSubtext: 'This order was cancelled' } : o))
              );
              const stored = await AsyncStorage.getItem('@local_orders');
              if (stored) {
                const list = JSON.parse(stored);
                const updated = list.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled', statusSubtext: 'This order was cancelled' } : o));
                await AsyncStorage.setItem('@local_orders', JSON.stringify(updated));
              }
              sendLocalNotification(
                'Order Cancelled 🛑',
                `Your order #${orderId} has been successfully cancelled.`
              );
              Alert.alert('Order Cancelled 🛑', `Order #${orderId} has been successfully cancelled.`);
            } catch (e) {
              console.warn('API Cancel failed. Executing locally.', e.message);
              setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled', statusSubtext: 'This order was cancelled' } : o))
              );
              const stored = await AsyncStorage.getItem('@local_orders');
              if (stored) {
                const list = JSON.parse(stored);
                const updated = list.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled', statusSubtext: 'This order was cancelled' } : o));
                await AsyncStorage.setItem('@local_orders', JSON.stringify(updated));
              }
              sendLocalNotification(
                'Order Cancelled (Offline) 🛑',
                `Your order #${orderId} has been successfully cancelled locally.`
              );
              Alert.alert('Order Cancelled 🛑', `Order #${orderId} has been successfully cancelled (Offline Mode).`);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return colors.success;
      case 'cancelled':
        return colors.error;
      case 'in transit':
      case 'shipped':
        return colors.blue500Alt || colors.info;
      default:
        return colors.gold600;
    }
  };

  const renderStatusIcon = (status) => {
    const iconSize = 15;
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={iconSize} color={colors.success} weight="fill" />;
      case 'cancelled':
        return <XCircle size={iconSize} color={colors.error} weight="fill" />;
      case 'in transit':
      case 'shipped':
        return <Truck size={iconSize} color={colors.blue500Alt || colors.info} weight="fill" />;
      case 'placed':
      case 'processing':
        return <Clock size={iconSize} color={colors.gold600} weight="fill" />;
      default:
        return <Package size={iconSize} color={colors.grey600} weight="fill" />;
    }
  };

  const renderOrderItem = ({ item }) => {
    const isDelivered = item.status?.toLowerCase() === 'delivered';
    const isTransit = item.status?.toLowerCase() === 'in transit' || item.status?.toLowerCase() === 'shipped';
    const isPlaced = item.status?.toLowerCase() === 'placed' || item.status?.toLowerCase() === 'processing';
    const isCancelled = item.status?.toLowerCase() === 'cancelled';
    const statusColor = getStatusColor(item.status);

    return (
      <View style={[styles.orderCard, { borderLeftColor: statusColor }]}>
        {/* Status Line */}
        <View style={styles.cardHeader}>
          <View style={styles.statusInfoRow}>
            <View style={[styles.statusIconBox, { backgroundColor: statusColor + '10', borderColor: statusColor + '30' }]}>
              {renderStatusIcon(item.status)}
            </View>
            <View style={styles.statusTexts}>
              <View style={[styles.statusPill, { backgroundColor: statusColor + '15' }]}>
                <Text style={[styles.statusLabel, { color: statusColor }]}>
                  {item.status || 'Placed'}
                </Text>
              </View>
              <Text style={styles.statusSubtext}>{item.statusSubtext || 'Placed'}</Text>
            </View>
          </View>
          <Text style={styles.orderId}>#{item.id}</Text>
        </View>

        {/* Items List inside card */}
        {item.items && item.items.map((prod, idx) => {
          const resolved = [...mockProducts, ...ALL_FEED_PRODUCTS].find(
            (p) => String(p.id) === String(prod.id) || String(p.id) === String(prod.productId)
          );

          return (
            <TouchableOpacity
              key={idx}
              style={styles.productRow}
              onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
              activeOpacity={0.7}
            >
              <View style={styles.productPhotoBox}>
                {resolved?.image ? (
                  <Image source={resolved.image} style={styles.productPhoto} resizeMode="cover" />
                ) : (
                  <Gift size={20} color={colors.grey600} weight="regular" />
                )}
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={1}>{prod.name}</Text>
                <Text style={styles.productMeta}>Size: {prod.size || 'M'} • Qty: {prod.quantity || 1}</Text>
              </View>
              <CaretRight size={16} color={colors.grey400} weight="bold" />
            </TouchableOpacity>
          );
        })}

        <View style={styles.divider} />

        {/* Action buttons */}
        <View style={styles.actionRow}>
          {isDelivered && (
            <>
              <TouchableOpacity style={styles.actionButtonSecondary}>
                <Text style={styles.actionBtnTextSecondary}>Size Exchange</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonPrimary}
                onPress={() => navigation.navigate('Return', { orderId: item.id, items: item.items })}
              >
                <Text style={styles.actionBtnTextPrimary}>Return Item</Text>
              </TouchableOpacity>
            </>
          )}

          {isTransit && (
            <>
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={() => navigation.navigate('TrackOrder', { orderId: item.id })}
              >
                <Text style={styles.actionBtnTextSecondary}>Track Item</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={() => handleCancelOrder(item.id)}
              >
                <Text style={styles.actionBtnTextSecondary}>Cancel Item</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={() => navigation.navigate('Support')}
              >
                <Text style={styles.actionBtnTextSecondary}>Need Help?</Text>
              </TouchableOpacity>
            </>
          )}

          {isPlaced && (
            <>
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={() => handleCancelOrder(item.id)}
              >
                <Text style={styles.actionBtnTextSecondary}>Cancel Item</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={() => navigation.navigate('Support')}
              >
                <Text style={styles.actionBtnTextSecondary}>Need Help?</Text>
              </TouchableOpacity>
            </>
          )}

          {isCancelled && (
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('Support')}
            >
              <Text style={styles.actionBtnTextSecondary}>Need Help?</Text>
            </TouchableOpacity>
          )}

          {!isDelivered && !isTransit && !isPlaced && !isCancelled && (
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('Support')}
            >
              <Text style={styles.actionBtnTextSecondary}>Need Help?</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color={colors.navy} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={loadOrders}>
          <ArrowsCounterClockwise size={20} color={colors.navy} weight="bold" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderOrderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛍️</Text>
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySub}>When you buy items, they will show up here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Sleek background color for listing
  },
  header: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 17,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderLeftWidth: 4.5, // Color stripe matching status
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statusTexts: {
    justifyContent: 'center',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusLabel: {
    ...typography.bodyBold,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  orderId: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  productPhotoBox: {
    width: 48,
    height: 48,
    borderRadius: radius.xs,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productPhoto: {
    width: '100%',
    height: '100%',
  },
  productDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  productName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  productMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  actionButtonPrimary: {
    backgroundColor: colors.navy,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.navy,
  },
  actionBtnTextPrimary: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnTextSecondary: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  emptySub: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontSize: 13,
  },
});
