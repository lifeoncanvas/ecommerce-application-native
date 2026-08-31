import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CaretLeft,
  Heart,
  Check,
  CaretDown,
  Truck,
  ShieldCheck,
  Trash,
  Plus,
  Minus,
  Lightning,
} from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { buildProductRouteParams } from '../../utils/productResolver';

// Default initial items removed per user instruction
const DEFAULT_CART_ITEMS = [];

export default function CartScreen({ navigation }) {
  const { colors } = useTheme();
  const { items: contextItems, updateItem, removeItem, clear } = useCart();
  const { toggleWishlist } = useWishlist();

  // Merge context cart items with default rich mockup items
  const [selectedMap, setSelectedMap] = useState({
    cart_item_1: true,
    cart_item_2: true,
    cart_item_3: true,
  });

  // Quantity map for custom items
  const [qtyMap, setQtyMap] = useState({
    cart_item_1: 1,
    cart_item_2: 1,
    cart_item_3: 1,
  });

  // Local state for removed items to allow immediate optimistic UI updates
  const [removedCartIds, setRemovedCartIds] = useState([]);
  const [activeCartTab, setActiveCartTab] = useState('products');

  // Load removed default cart items on mount
  useEffect(() => {
    async function loadRemovedIds() {
      try {
        const stored = await AsyncStorage.getItem('@removed_cart_ids');
        if (stored) {
          setRemovedCartIds(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to load removed cart IDs:', e);
      }
    }
    loadRemovedIds();
  }, []);

  // Size / Variant selection modal
  const [variantModalItem, setVariantModalItem] = useState(null);
  const [editSize, setEditSize] = useState('M');
  const [editQty, setEditQty] = useState(1);

  // Active items list
  const allCartItems = useMemo(() => {
    // Filter out removed default items
    const filteredDefault = DEFAULT_CART_ITEMS.filter((item) => !removedCartIds.includes(item.id));

    // If context has new added items, append them
    const mappedContext = contextItems
      .filter((ci) => !DEFAULT_CART_ITEMS.some((di) => di.id === ci.id) && !removedCartIds.includes(String(ci.id)))
      .map((ci) => ({
        id: String(ci.id),
        name: ci.name || 'Textured Top',
        brand: ci.brand || 'Vero Moda',
        price: Number(ci.price) || 999,
        oldPrice: ci.oldPrice || 2499,
        discount: ci.discount || '60%OFF',
        colorName: ci.color || 'Fuchsia',
        colorHex: ci.colorHex || '#BA5392',
        size: ci.size || 'L',
        quantity: ci.quantity || 1,
        image: ci.image || require('../../../assets/images/details/hero_1.jpg'),
        badges: ['Fast delivery', 'Trendy'],
        selected: selectedMap[ci.id] !== false,
        isBooking: !!ci.isBooking,
        bookingDay: ci.bookingDay || null,
        bookingTimeSlot: ci.bookingTimeSlot || null,
      }));

    return [
      ...filteredDefault.map((item) => ({
        ...item,
        quantity: qtyMap[item.id] || item.quantity,
        selected: selectedMap[item.id] !== false,
      })),
      ...mappedContext,
    ];
  }, [contextItems, selectedMap, qtyMap, removedCartIds]);

  // Toggle single item selection
  const toggleItemSelect = (id) => {
    setSelectedMap((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  // Get items matching the active tab
  const activeItems = useMemo(() => {
    return allCartItems.filter((item) => {
      if (activeCartTab === 'products') {
        return !item.isBooking;
      } else {
        return !!item.isBooking;
      }
    });
  }, [allCartItems, activeCartTab]);

  // Toggle select all inside active tab
  const allSelected = activeItems.length > 0 && activeItems.every((item) => selectedMap[item.id] !== false);
  const toggleSelectAll = () => {
    const nextState = !allSelected;
    const newMap = { ...selectedMap };
    activeItems.forEach((item) => {
      newMap[item.id] = nextState;
    });
    setSelectedMap(newMap);
  };

  // Calculate totals for selected items in active tab
  const selectedItems = activeItems.filter((i) => selectedMap[i.id] !== false);
  const selectedCount = selectedItems.length;

  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const totalOldPrice = selectedItems.reduce(
    (sum, item) => sum + (item.oldPrice || item.price * 1.3) * (item.quantity || 1),
    0
  );

  const totalSavings = Math.max(0, Math.round(totalOldPrice - totalPrice));

  // Change quantity
  const handleUpdateQty = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setQtyMap((prev) => ({ ...prev, [itemId]: newQty }));
    if (contextItems.some((ci) => String(ci.id) === String(itemId))) {
      updateItem(itemId, newQty);
    }
  };

  // Remove item
  const handleRemoveItem = async (itemId) => {
    const updatedRemoved = [...removedCartIds, itemId];
    setRemovedCartIds(updatedRemoved);
    try {
      await AsyncStorage.setItem('@removed_cart_ids', JSON.stringify(updatedRemoved));
    } catch (e) {
      console.warn('Failed to save removed cart IDs:', e);
    }
    setQtyMap((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setSelectedMap((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    removeItem(itemId);
  };

  const renderCartRow = ({ item }) => {
    const isChecked = selectedMap[item.id] !== false;

    return (
      <View style={styles.itemRow}>
        {/* Checkbox */}
        <TouchableOpacity
          style={[styles.checkbox, isChecked && styles.checkboxActive]}
          onPress={() => toggleItemSelect(item.id)}
          activeOpacity={0.7}
        >
          {isChecked && <Check size={14} color="#FFFFFF" weight="bold" />}
        </TouchableOpacity>

        {/* Product Photo */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetails', buildProductRouteParams(item))}
          activeOpacity={0.9}
          style={styles.photoContainer}
        >
          {item.image ? (
            <Image
              source={
                typeof item.image === 'string' && (item.image.startsWith('http') || item.image.startsWith('data:'))
                  ? { uri: item.image }
                  : item.image
              }
              style={styles.productPhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productPhoto, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' }]}>
              <Text style={{ fontSize: 24 }}>🎁</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.detailsCol}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductDetails', buildProductRouteParams(item))}
            activeOpacity={0.8}
          >
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>

          {/* Color & Size Dropdown Pill OR Booking Slot Badge */}
          {item.isBooking ? (
            <View style={styles.bookingSlotBadge}>
              <Text style={styles.bookingSlotText}>
                📅 {item.bookingDay} • 🕒 {item.bookingTimeSlot}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.variantPill}
              onPress={() => {
                setVariantModalItem(item);
                setEditSize(item.size);
                setEditQty(item.quantity);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.colorSquare, { backgroundColor: item.colorHex || '#BA5392' }]} />
              <Text style={styles.variantSlash}>/</Text>
              <Text style={styles.variantText}>{item.size}</Text>
              <CaretDown size={12} color="#1E293B" weight="bold" />
            </TouchableOpacity>
          )}

          {/* Pricing Row */}
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>₦{item.price.toLocaleString('en-NG')}</Text>
            {item.oldPrice && (
              <Text style={styles.itemOldPrice}>₦{item.oldPrice.toLocaleString('en-NG')}</Text>
            )}
            {item.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{item.discount}</Text>
              </View>
            )}
          </View>

          {/* Tags / Badges */}
          <View style={styles.badgesRow}>
            {item.badges?.map((badge, idx) => (
              <View
                key={idx}
                style={[
                  styles.badgePill,
                  badge === 'Fast delivery' && styles.fastDeliveryBadge,
                  badge === 'Best selling' && styles.bestSellingBadge,
                  badge === 'Trendy' && styles.trendyBadge,
                  badge === 'New-in' && styles.newInBadge,
                ]}
              >
                {badge === 'Fast delivery' && (
                  <Lightning size={10} color="#1E293B" weight="fill" style={{ marginRight: 2 }} />
                )}
                <Text
                  style={[
                    styles.badgeText,
                    badge === 'Best selling' && styles.bestSellingText,
                    badge === 'New-in' && styles.newInText,
                  ]}
                >
                  {badge}
                </Text>
              </View>
            ))}
          </View>

          {/* Quantity Selector Pill & Bin Icon Row (Bottom right of card) */}
          <View style={styles.qtyActionsRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => {
                setVariantModalItem(item);
                setEditSize(item.size);
                setEditQty(item.quantity);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyLabel}>x{item.quantity}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.trashIconBtn}
              onPress={() => handleRemoveItem(item.id)}
              activeOpacity={0.7}
            >
              <Trash size={17} color="#94A3B8" weight="regular" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Top Header: Back | My Bag (3) | Edit/Heart ───────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.hdrBtn}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('Home');
          }}
          activeOpacity={0.7}
        >
          <CaretLeft size={24} color="#1E293B" weight="bold" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Bag ({allCartItems.length})</Text>

        <View style={styles.hdrRightActions}>
          <TouchableOpacity
            style={styles.hdrBtn}
            onPress={() => navigation.navigate('Wishlist')}
            activeOpacity={0.7}
          >
            <Heart size={22} color="#1E293B" weight="regular" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Cart Navigation Tabs ─────────────────────────────────────────── */}
      <View style={styles.cartTabsContainer}>
        <TouchableOpacity
          style={[styles.cartTabBtn, activeCartTab === 'products' && styles.cartTabBtnActive]}
          onPress={() => setActiveCartTab('products')}
          activeOpacity={0.8}
        >
          <Text style={[styles.cartTabText, activeCartTab === 'products' && styles.cartTabTextActive]}>
            Shopping Bag ({allCartItems.filter(i => !i.isBooking).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cartTabBtn, activeCartTab === 'bookings' && styles.cartTabBtnActive]}
          onPress={() => setActiveCartTab('bookings')}
          activeOpacity={0.8}
        >
          <Text style={[styles.cartTabText, activeCartTab === 'bookings' && styles.cartTabTextActive]}>
            My Bookings ({allCartItems.filter(i => i.isBooking).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Top Free Shipping Banner ─────────────────────────────────────── */}
      {activeCartTab === 'products' && (
        <View style={styles.topShippingBanner}>
          <Text style={styles.topShippingBannerText}>Free shipping on the order.</Text>
        </View>
      )}

      {/* ─── Cart Items List ──────────────────────────────────────────────── */}
      <FlatList
        data={activeItems}
        keyExtractor={(item) => item.id}
        renderItem={renderCartRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          activeItems.length > 0 ? (
            <View style={styles.footerContainer}>
              {/* Ticked Items Order Summary Breakdown Card */}
              <View style={styles.orderSummaryCard}>
                <Text style={styles.summaryCardTitle}>ORDER SUMMARY</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Selected Items ({selectedCount})</Text>
                  <Text style={styles.summaryValue}>₦{totalOldPrice.toLocaleString('en-NG')}</Text>
                </View>

                {totalSavings > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Bag Discount</Text>
                    <Text style={[styles.summaryValue, { color: '#16A34A', fontWeight: '800' }]}>
                      -₦{totalSavings.toLocaleString('en-NG')}
                    </Text>
                  </View>
                )}

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{activeCartTab === 'products' ? 'Delivery Fee' : 'Booking Fee'}</Text>
                  <Text style={[styles.summaryValue, { color: '#16A34A', fontWeight: '800' }]}>FREE</Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                  <Text style={styles.summaryTotalValue}>₦{totalPrice.toLocaleString('en-NG')}</Text>
                </View>
              </View>

              {/* Free Shipping & Security Info */}
              <View style={styles.footerFeatures}>
                {activeCartTab === 'products' && (
                  <View style={styles.featureRow}>
                    <Truck size={20} color="#1E293B" weight="regular" />
                    <Text style={styles.featureText}>Free Shipping for orders ₦990</Text>
                  </View>
                )}

                <View style={styles.featureRow}>
                  <ShieldCheck size={20} color="#1E293B" weight="regular" />
                  <Text style={styles.featureText}>Secured Payment & Checkout</Text>
                </View>
              </View>

              {/* Extra spacing so everything is 100% visible and scrollable above checkout bar & navbar */}
              <View style={{ height: 180 }} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{activeCartTab === 'products' ? '🛍️' : '📅'}</Text>
            <Text style={styles.emptyTitle}>
              {activeCartTab === 'products' ? 'Your Bag is Empty' : 'No Bookings Found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeCartTab === 'products'
                ? 'Explore our latest collections and add items to your bag.'
                : 'Explore services, restaurants & fast food, and book slots!'}
            </Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate(activeCartTab === 'products' ? 'Home' : 'Categories')}
              activeOpacity={0.8}
            >
              <Text style={styles.shopNowText}>
                {activeCartTab === 'products' ? 'Shop Now' : 'Explore Services'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* ─── Sticky Bottom Checkout Bar (Image 2) ────────────────────────── */}
      {activeItems.length > 0 && (
        <View style={styles.stickyCheckoutBar}>
          {/* Select All Checkbox */}
          <TouchableOpacity
            style={styles.selectAllRow}
            onPress={toggleSelectAll}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxSmall, allSelected && styles.checkboxActive]}>
              {allSelected && <Check size={13} color="#FFFFFF" weight="bold" />}
            </View>
            <Text style={styles.selectAllText}>All</Text>
          </TouchableOpacity>

          {/* Pricing Summary */}
          <View style={styles.totalSummaryCol}>
            <Text style={styles.totalPriceMain}>₦{totalPrice.toLocaleString('en-NG')}</Text>
            {totalSavings > 0 && (
              <View style={styles.savingsRow}>
                <Text style={styles.savingsText}>-₦{totalSavings.toLocaleString('en-NG')}</Text>
                <CaretDown size={11} color="#64748B" weight="bold" />
              </View>
            )}
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            style={[
              styles.checkoutBtn,
              selectedCount === 0 && styles.checkoutBtnDisabled,
            ]}
            onPress={() => {
              if (selectedCount === 0) {
                Alert.alert('Selection Required', 'Please select at least one item to proceed.');
                return;
              }
              navigation.navigate('Checkout', {
                totalAmount: totalPrice,
                selectedItems: selectedItems,
                isBooking: activeCartTab === 'bookings',
              });
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutBtnText}>CHECKOUT ({selectedCount})</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Variant & Quantity Edit Modal ───────────────────────────────── */}
      <Modal
        visible={!!variantModalItem}
        transparent
        animationType="slide"
        onRequestClose={() => setVariantModalItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Size & Quantity</Text>
              <TouchableOpacity onPress={() => setVariantModalItem(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {variantModalItem && (
              <View style={{ paddingVertical: 12 }}>
                {/* Size Selection */}
                <Text style={styles.modalSectionLabel}>SIZE</Text>
                <View style={styles.modalSizesRow}>
                  {['XS', 'S', 'M', 'L', 'XL', 'One-Size'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.modalSizePill, editSize === s && styles.modalSizePillActive]}
                      onPress={() => setEditSize(s)}
                    >
                      <Text
                        style={[
                          styles.modalSizeText,
                          editSize === s && styles.modalSizeTextActive,
                        ]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Quantity Stepper */}
                <Text style={[styles.modalSectionLabel, { marginTop: 18 }]}>QUANTITY</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setEditQty(Math.max(1, editQty - 1))}
                  >
                    <Minus size={18} color="#1E293B" weight="bold" />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{editQty}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setEditQty(editQty + 1)}
                  >
                    <Plus size={18} color="#1E293B" weight="bold" />
                  </TouchableOpacity>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={() => {
                    handleUpdateQty(variantModalItem.id, editQty);
                    setVariantModalItem(null);
                  }}
                >
                  <Text style={styles.modalConfirmBtnText}>Update Bag</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white
  },

  // Header Bar
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 10 : 4,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  hdrBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  hdrRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Top Shipping Banner
  topShippingBanner: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  topShippingBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 60,
  },

  // Row Item (Matching Image 2)
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },

  // Custom Checkbox
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginRight: 12,
  },
  checkboxSmall: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },

  // Photo
  photoContainer: {
    width: 100,
    height: 125,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    marginRight: 14,
  },
  productPhoto: {
    width: '100%',
    height: '100%',
  },

  // Details Column
  detailsCol: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 125,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },

  // Color / Size Dropdown Pill
  variantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 2,
  },
  colorSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  variantSlash: {
    fontSize: 12,
    color: '#94A3B8',
  },
  variantText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 2,
  },

  // Pricing
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 6,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  itemOldPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Badges
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
  },
  fastDeliveryBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bestSellingBadge: {
    backgroundColor: '#FFEDD5',
  },
  trendyBadge: {
    backgroundColor: '#FEF3C7',
  },
  newInBadge: {
    backgroundColor: '#E0E7FF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  bestSellingText: {
    color: '#C2410C',
  },
  newInText: {
    color: '#4338CA',
  },

  // Quantity Pill & Trash Icon Row
  qtyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  qtyBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FFFFFF',
  },
  qtyLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  trashIconBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Footer Container
  footerContainer: {
    marginTop: 18,
  },

  // Order Summary Card in List
  orderSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  summaryCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
  },

  // Footer Features
  footerFeatures: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
  },
  shopNowBtn: {
    marginTop: 20,
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  // Sticky Bottom Checkout Bar (Image 2)
  stickyCheckoutBar: {
    position: 'absolute',
    bottom: 58, // Sits perfectly above the 58px bottom navbar!
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 6,
  },
  totalSummaryCol: {
    flex: 1,
    justifyContent: 'center',
  },
  totalPriceMain: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EF4444', // Red accent as in Image 2
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  savingsText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  checkoutBtn: {
    backgroundColor: '#F59E0B', // Bright Gold/Yellow as in Image 2
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  checkoutBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748B',
  },
  modalSectionLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalSizesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalSizePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  modalSizePillActive: {
    backgroundColor: '#FBF6E2',
    borderColor: '#1E293B',
    borderWidth: 1.5,
  },
  modalSizeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalSizeTextActive: {
    color: '#1E293B',
    fontWeight: '800',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalConfirmBtn: {
    marginTop: 24,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  cartTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#FAF9F5',
  },
  cartTabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  cartTabBtnActive: {
    borderColor: '#A8824B',
  },
  cartTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  cartTabTextActive: {
    color: '#1E293B',
    fontWeight: '800',
  },
  bookingSlotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF6EC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
    alignSelf: 'flex-start',
  },
  bookingSlotText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#A8824B',
  },
});
