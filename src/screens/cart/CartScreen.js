import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';

export default function CartScreen({ navigation }) {
  const { items, loading, refreshCart } = useCart();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const renderCartItem = ({ item }) => {
    return (
      <View style={styles.row}>
        {/* Emoji Icon container */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emojiText}>{item.emoji || '🎁'}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoCol}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        </View>

        {/* Quantity control */}
        <View style={styles.qtyBadge}>
          <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
        </View>

        {/* Total Item Price */}
        <Text style={styles.itemTotal}>
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <Text style={styles.headerSubtitle}>{items.length} items</Text>
      </View>

      {/* Cart List */}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.empty}>Your cart is empty</Text>
              <Text style={styles.emptySubtext}>Add products to your cart to see them here.</Text>
            </View>
          )
        }
        renderItem={renderCartItem}
      />

      {/* Checkout Footer */}
      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${calculateSubtotal().toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated Shipping</Text>
            <Text style={styles.shippingValue}>FREE</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: spacing.xs, borderTopWidth: 1, borderColor: colors.border, paddingTop: spacing.sm }]}>
            <Text style={styles.grandLabel}>Total Amount</Text>
            <Text style={styles.grandValue}>${calculateSubtotal().toFixed(2)}</Text>
          </View>
          <View style={styles.btnWrapper}>
            <Button
              title="Proceed to Checkout"
              onPress={() => alert('Order Placed Successfully! Thank you.')}
            />
          </View>
        </View>
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
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  infoCol: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  price: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  qtyBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  qtyText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 10,
  },
  itemTotal: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 14,
    width: 70,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  empty: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  shippingValue: {
    ...typography.bodyBold,
    color: colors.success,
    fontSize: 13,
  },
  grandLabel: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 15,
  },
  grandValue: {
    ...typography.h2,
    color: colors.navy,
    fontWeight: '800',
  },
  btnWrapper: {
    marginTop: spacing.md,
  },
});
