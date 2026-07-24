import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { getCoupons, applyCoupon } from '../../api/coupons.api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CartScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const {
    items,
    loading,
    refreshCart,
    updateItem,
    removeItem,
    clear,
    applyPromoCoupon,
    couponCode,
    discountAmount,
    couponError,
    setCouponError,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [couponsModalVisible, setCouponsModalVisible] = useState(false);
  const [coupons, setCoupons] = useState([]);

  const handleOpenCouponsModal = async () => {
    let apiCoupons = [];
    let localCoupons = [];

    try {
      const stored = await AsyncStorage.getItem('@local_coupons');
      if (stored) localCoupons = JSON.parse(stored);
    } catch (err) {}

    try {
      const res = await getCoupons();
      apiCoupons = res.data || [];
    } catch (e) {
      console.warn('GET /api/coupons failed. Loading mock coupons.', e.message);
      apiCoupons = [
        { code: 'TECH20', description: 'Get 20% off on electronics and gadget orders', value: 20 },
        { code: 'FREESHIP', description: 'Free shipping on orders above $30', value: 5.99 },
        { code: 'HTTN10', description: 'Get a flat 10% discount on food orders', value: 10 }
      ];
    }

    const merged = [...localCoupons, ...apiCoupons];
    const unique = merged.filter((v, i, a) => a.findIndex(t => t.code === v.code) === i);
    setCoupons(unique);
    setCouponsModalVisible(true);
  };

  const handleSelectCoupon = async (code) => {
    setCouponsModalVisible(false);
    try {
      await applyCoupon(code);
      setPromoInput(code);
      applyPromoCoupon(code);
      Alert.alert('Success', `Promo code "${code}" applied successfully!`);
    } catch (e) {
      console.warn('POST /api/cart/apply-coupon failed. Applying locally.', e.message);
      setPromoInput(code);
      applyPromoCoupon(code);
      Alert.alert('Success', `Promo code "${code}" applied (Offline Mode).`);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleApplyCoupon = () => {
    if (!promoInput.trim()) return;
    applyPromoCoupon(promoInput);
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

        {/* Quantity Controls */}
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateItem(item.id, item.quantity - 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateItem(item.id, item.quantity + 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeItem(item.id)}
          activeOpacity={0.7}
        >
          <Svg width="18" height="18" viewBox="0 0 24 24">
            <Path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              fill={colors.error}
            />
          </Svg>
        </TouchableOpacity>
      </View>
    );
  };

  const subtotal = calculateSubtotal();
  const shipping = 0; // Free shipping
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <Text style={styles.headerSubtitle}>{items.length} items</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={clear} style={styles.clearAllBtn} activeOpacity={0.7}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
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
              <TouchableOpacity
                style={styles.shopBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.shopBtnText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={renderCartItem}
      />

      {/* Checkout Footer & Coupon */}
      {items.length > 0 && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.footerContainer}
        >
          {/* Coupon Input Box */}
          <View style={styles.couponHeaderRow}>
            <Text style={styles.fieldLabel}>Promo Code</Text>
            <TouchableOpacity onPress={handleOpenCouponsModal}>
              <Text style={styles.viewCouponsText}>View Available Coupons 🏷️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.couponWrapper}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter Promo Code (e.g. DISCOUNT10)"
              placeholderTextColor={colors.textSecondary}
              value={promoInput}
              onChangeText={(txt) => {
                setPromoInput(txt);
                setCouponError('');
              }}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.couponApplyBtn}
              onPress={handleApplyCoupon}
              activeOpacity={0.8}
            >
              <Text style={styles.couponApplyText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {couponError ? (
            <Text style={styles.errorText}>{couponError}</Text>
          ) : couponCode ? (
            <Text style={styles.successText}>Promo code "{couponCode}" applied successfully!</Text>
          ) : null}

          {/* Pricing Breakdowns */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
            </View>
            
            {discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount ({couponCode})</Text>
                <Text style={[styles.totalValue, styles.discountValue]}>-${discountAmount.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated Shipping</Text>
              <Text style={styles.shippingValue}>FREE</Text>
            </View>

            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandLabel}>Total Amount</Text>
              <Text style={styles.grandValue}>${total.toFixed(2)}</Text>
            </View>

            <View style={styles.btnWrapper}>
              <Button
                title="Proceed to Checkout"
                onPress={() => navigation.navigate('Checkout')}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Available Coupons Modal */}
      <Modal
        visible={couponsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCouponsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Coupons</Text>
              <TouchableOpacity onPress={() => setCouponsModalVisible(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
              {coupons.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={styles.couponCard}
                  onPress={() => handleSelectCoupon(c.code)}
                  activeOpacity={0.8}
                >
                  <View style={styles.couponCardHeader}>
                    <Text style={styles.couponCodeText}>{c.code}</Text>
                    <Text style={styles.couponValueTag}>SAVE ${c.value}</Text>
                  </View>
                  <Text style={styles.couponDescText}>{c.description}</Text>
                  <Text style={styles.applyHint}>Tap to apply promo code</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Close" variant="secondary" onPress={() => setCouponsModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  clearAllBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  clearAllText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
    fontSize: 13,
  },
  price: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
    height: 32,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 16,
  },
  qtyText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
    marginHorizontal: spacing.xs,
  },
  removeBtn: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  shopBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  shopBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footerContainer: {
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingTop: spacing.md,
  },
  couponWrapper: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: 4,
  },
  couponInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    ...typography.caption,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  couponApplyBtn: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponApplyText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    fontSize: 10,
    paddingHorizontal: spacing.lg,
    marginTop: 2,
    fontWeight: '600',
  },
  successText: {
    ...typography.caption,
    color: colors.success,
    fontSize: 10,
    paddingHorizontal: spacing.lg,
    marginTop: 2,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
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
  discountValue: {
    ...typography.bodyBold,
    color: colors.error,
  },
  shippingValue: {
    ...typography.bodyBold,
    color: colors.success,
    fontSize: 13,
  },
  grandTotalRow: {
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm,
  },
  grandLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  grandValue: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  btnWrapper: {
    marginTop: spacing.md,
  },
  couponHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  viewCouponsText: {
    ...typography.caption,
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    height: '65%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  modalCloseIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  modalList: {
    flex: 1,
  },
  modalListContent: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  couponCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  couponCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponCodeText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  couponValueTag: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '800',
    fontSize: 11,
  },
  couponDescText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  applyHint: {
    ...typography.caption,
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
});
