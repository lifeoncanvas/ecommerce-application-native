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
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { getOrders, cancelOrder } from '../../api/orders.api';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch orders from API and merge with local AsyncStorage orders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    let apiOrders = [];
    let localOrders = [];

    // 1. Fetch from AsyncStorage (orders placed in this session)
    try {
      const stored = await AsyncStorage.getItem('@local_orders');
      if (stored) localOrders = JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load local orders from storage', e.message);
    }

    // 2. Fetch from backend API
    try {
      const res = await withTimeout(getOrders(), 2000);
      apiOrders = res.data || [];
    } catch (e) {
      console.warn('Failed to fetch orders from API. Using local & mock fallbacks.', e.message);
      // Mock history to populate the list if completely empty
      if (localOrders.length === 0) {
        localOrders = [
          {
            id: 'ORD-984321',
            date: 'Jan 15, 2026',
            totalAmount: 129.99,
            status: 'Delivered',
            items: [{ id: 'p_redemp_1', name: 'Vintage Leather Jacket', price: 129.99, quantity: 1, emoji: '🧥' }],
            paymentMethod: 'Stripe Card'
          },
          {
            id: 'ORD-723910',
            date: 'Jan 02, 2026',
            totalAmount: 45.50,
            status: 'Cancelled',
            items: [{ id: 'p_jazari_1', name: 'Jazari Special Rice Platter', price: 22.75, quantity: 2, emoji: '🍛' }],
            paymentMethod: 'PayPal'
          }
        ];
      }
    }

    // Merge and set
    const merged = [...localOrders, ...apiOrders];
    // De-duplicate by ID
    const unique = merged.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    setOrders(unique);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Handle Order Cancellation
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
              // Update state
              setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o))
              );
              // Update AsyncStorage
              const stored = await AsyncStorage.getItem('@local_orders');
              if (stored) {
                const list = JSON.parse(stored);
                const updated = list.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o));
                await AsyncStorage.setItem('@local_orders', JSON.stringify(updated));
              }
            } catch (e) {
              console.warn('API Cancel failed. Executing locally.', e.message);
              // Fallback local update
              setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o))
              );
              const stored = await AsyncStorage.getItem('@local_orders');
              if (stored) {
                const list = JSON.parse(stored);
                const updated = list.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o));
                await AsyncStorage.setItem('@local_orders', JSON.stringify(updated));
              }
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
      case 'shipped':
        return colors.navyLight;
      default:
        return colors.gold;
    }
  };

  const renderOrderItem = ({ item }) => {
    const itemCount = item.items ? item.items.reduce((sum, i) => sum + i.quantity, 0) : 1;
    const canCancel = item.status === 'Placed' || item.status === 'Processing';

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>{item.id}</Text>
          <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.orderDate}>Placed on: {item.date}</Text>
        <Text style={styles.orderSummary}>{itemCount} items • ${item.totalAmount.toFixed(2)}</Text>

        <View style={styles.divider} />

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
          >
            <Text style={styles.detailsBtnText}>View Details</Text>
          </TouchableOpacity>

          {canCancel && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancelOrder(item.id)}
            >
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={colors.navy} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={loadOrders}>
          <Text style={styles.refreshEmoji}>🔄</Text>
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
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySub}>When you place an order, it will appear here.</Text>
              <Button
                title="Start Shopping"
                onPress={() => navigation.navigate('Home')}
                style={{ marginTop: spacing.lg }}
              />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  refreshEmoji: {
    fontSize: 18,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.lg,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderId: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 14,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  statusText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  orderSummary: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsBtn: {
    paddingVertical: spacing.xs,
  },
  detailsBtnText: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  cancelBtn: {
    backgroundColor: colors.error + '10',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  cancelBtnText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
    fontSize: 11,
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
