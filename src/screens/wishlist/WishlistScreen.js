import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CaretLeft,
  ShoppingBagOpen,
  X,
  Lightning,
  Heart,
  CheckCircle,
} from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { buildProductRouteParams } from '../../utils/productResolver';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

// Default Wishlist Items (Matching Image 4)
const DEFAULT_WISHLIST_ITEMS = [
  {
    id: 'wish_phone_case',
    name: 'Polka Dots Phone Case',
    price: 290,
    oldPrice: null,
    discount: null,
    badges: ['Fast delivery', 'Trendy'],
    image: require('../../../assets/images/wishlist/wish_1.jpg'),
    swatches: null,
  },
  {
    id: 'wish_buckle_bag',
    name: 'Adjustable Buckle Shoulder...',
    price: 790,
    oldPrice: 1090,
    discount: '28%OFF',
    badges: ['Fast delivery', 'Trendy'],
    image: require('../../../assets/images/wishlist/wish_2.jpg'),
    swatches: ['#772020', '#1E293B', '#EDE9DE', '#4A3B32', '#7BA4D9', '#F4C2C2'],
  },
  {
    id: 'wish_lettuce_set',
    name: 'Lettuce- Edge Lounge Set',
    price: 1190,
    oldPrice: null,
    discount: null,
    offerText: 'Get it for $1,090',
    badges: ['Fast delivery'],
    image: require('../../../assets/images/wishlist/wish_3.jpg'),
    swatches: null,
  },
  {
    id: 'wish_pocket_set',
    name: 'Pocket Lounge Set',
    price: 990,
    oldPrice: null,
    discount: null,
    badges: ['Fast delivery'],
    image: require('../../../assets/images/wishlist/wish_4.jpg'),
    swatches: null,
  },
];

// Recommended Items for "For You" Section
const FOR_YOU_ITEMS = [
  {
    id: 'for_you_1',
    name: 'Silk Blend Shirt',
    price: 1290,
    oldPrice: 1890,
    discount: '30%OFF',
    image: require('../../../assets/images/details/card_1.jpg'),
  },
  {
    id: 'for_you_2',
    name: 'Pleated A-line Skirt',
    price: 990,
    oldPrice: 1320,
    discount: '25%OFF',
    image: require('../../../assets/images/details/card_2.jpg'),
  },
];

export default function WishlistScreen({ navigation }) {
  const { colors } = useTheme();
  const { formatPrice } = useCurrency();
  const { wishlistItems: contextWishlist, toggleWishlist } = useWishlist();
  const { addItem, items: cartItems } = useCart();

  // Local state for removed items to allow immediate optimistic UI updates
  const [removedIds, setRemovedIds] = useState([]);
  const [activeWishlistTab, setActiveWishlistTab] = useState('products');

  const isBookingItem = (item) => {
    if (item.categoryId) {
      return item.categoryId === 'cat_food' || item.categoryId === 'cat_services';
    }
    return false;
  };

  // Load removed default items on mount
  useEffect(() => {
    async function loadRemovedIds() {
      try {
        const stored = await AsyncStorage.getItem('@removed_wishlist_ids');
        if (stored) {
          setRemovedIds(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to load removed wishlist IDs:', e);
      }
    }
    loadRemovedIds();
  }, []);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState('');
  const toastAnim = React.useRef(new Animated.Value(0)).current;

  const showToast = (msg) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  // Combine items
  const activeWishlistItems = useMemo(() => {
    const defaultFiltered = DEFAULT_WISHLIST_ITEMS.filter((item) => !removedIds.includes(item.id));
    const contextMapped = contextWishlist
      .filter((item) => !DEFAULT_WISHLIST_ITEMS.some((d) => d.id === item.id) && !removedIds.includes(item.id))
      .map((item) => ({
        id: item.id,
        name: item.name || 'Fashion Item',
        price: Number(item.price) || 899,
        oldPrice: item.oldPrice,
        discount: item.discount,
        badges: ['Fast delivery', 'Trendy'],
        image: item.image || require('../../../assets/images/details/card_1.jpg'),
        swatches: null,
      }));

    return [...defaultFiltered, ...contextMapped];
  }, [removedIds, contextWishlist]);

  const filteredWishlistItems = useMemo(() => {
    return activeWishlistItems.filter((item) => {
      const isBook = isBookingItem(item);
      return activeWishlistTab === 'products' ? !isBook : isBook;
    });
  }, [activeWishlistItems, activeWishlistTab]);

  // Remove from Wishlist
  const handleRemoveWishlist = async (itemId, itemName) => {
    const updatedRemovedIds = [...removedIds, itemId];
    setRemovedIds(updatedRemovedIds);
    try {
      await AsyncStorage.setItem('@removed_wishlist_ids', JSON.stringify(updatedRemovedIds));
    } catch (e) {
      console.warn('Failed to save removed wishlist IDs:', e);
    }
    toggleWishlist(itemId);
    showToast(`Removed from Wishlist`);
  };

  // Add to Bag from Wishlist
  const handleAddToBag = (item) => {
    addItem(item.id, 1, {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: 'M',
      color: 'Default',
    });
    showToast(`Added ${item.name} to your Bag!`);
  };

  const totalCartCount = cartItems?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0;

  const renderWishlistCard = ({ item }) => {
    return (
      <View style={styles.cardWrapper}>
        {/* Photo Container */}
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => navigation.navigate('ProductDetails', buildProductRouteParams(item))}
          activeOpacity={0.9}
        >
          <Image source={item.image} style={styles.productPhoto} resizeMode="cover" />

          {/* Discount Badge on Top-Left */}
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{item.discount}</Text>
            </View>
          )}

          {/* Remove X Button on Top-Right */}
          <TouchableOpacity
            style={styles.removeCircleBtn}
            onPress={() => handleRemoveWishlist(item.id, item.name)}
            activeOpacity={0.8}
          >
            <X size={14} color="#1E293B" weight="bold" />
          </TouchableOpacity>

          {/* Quick Add to Bag Floating Button on Bottom-Right */}
          <TouchableOpacity
            style={styles.addBagFloatingBtn}
            onPress={() => handleAddToBag(item)}
            activeOpacity={0.85}
          >
            <ShoppingBagOpen size={17} color="#1E293B" weight="bold" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Content Below Photo */}
        <View style={styles.infoCol}>
          {/* Fast Delivery Badge */}
          <View style={styles.fastDeliveryRow}>
            <Lightning size={11} color="#1E293B" weight="fill" />
            <Text style={styles.fastDeliveryText}>Fast delivery</Text>
          </View>

          {/* Title */}
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>{formatPrice(item.price.toLocaleString('en-NG'))}</Text>
            {item.oldPrice && (
              <Text style={styles.itemOldPrice}>{formatPrice(item.oldPrice.toLocaleString('en-NG'))}</Text>
            )}
          </View>

          {/* Offer text e.g. "Get it for ${formatPrice('1,090')}" */}
          {item.offerText && (
            <Text style={styles.offerText}>{item.offerText}</Text>
          )}

          {/* Color Swatches if available */}
          {item.swatches && (
            <View style={styles.swatchesRow}>
              {item.swatches.map((colorHex, idx) => (
                <View key={idx} style={[styles.swatchDot, { backgroundColor: colorHex }]} />
              ))}
            </View>
          )}

          {/* Trendy Badge */}
          {item.badges?.includes('Trendy') && (
            <View style={styles.trendyPill}>
              <Text style={styles.trendyText}>Trendy</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Top Header: Back | Wishlist | Bag Icon with Badge ───────────── */}
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

        <Text style={styles.headerTitle}>Wishlist</Text>

        <TouchableOpacity
          style={styles.hdrBtn}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.7}
        >
          <ShoppingBagOpen size={22} color="#1E293B" weight="regular" />
          {totalCartCount > 0 && (
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{totalCartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Wishlist Navigation Tabs ────────────────────────────────────── */}
      <View style={styles.wishlistTabsContainer}>
        <TouchableOpacity
          style={[styles.wishlistTabBtn, activeWishlistTab === 'products' && styles.wishlistTabBtnActive]}
          onPress={() => setActiveWishlistTab('products')}
          activeOpacity={0.8}
        >
          <Text style={[styles.wishlistTabText, activeWishlistTab === 'products' && styles.wishlistTabTextActive]}>
            Products ({activeWishlistItems.filter(i => !isBookingItem(i)).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.wishlistTabBtn, activeWishlistTab === 'services' && styles.wishlistTabBtnActive]}
          onPress={() => setActiveWishlistTab('services')}
          activeOpacity={0.8}
        >
          <Text style={[styles.wishlistTabText, activeWishlistTab === 'services' && styles.wishlistTabTextActive]}>
            Services ({activeWishlistItems.filter(i => isBookingItem(i)).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Wishlist Items Grid ─────────────────────────────────────────── */}
      <FlatList
        data={filteredWishlistItems}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderWishlistCard}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          filteredWishlistItems.length > 0 ? (
            <View style={styles.forYouSection}>
              <Text style={styles.forYouTitle}>For you</Text>
              <View style={styles.forYouGrid}>
                {FOR_YOU_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.forYouCard}
                    onPress={() => navigation.navigate('ProductDetails', buildProductRouteParams(item))}
                    activeOpacity={0.9}
                  >
                    <View style={styles.forYouPhotoWrapper}>
                      <Image source={item.image} style={styles.forYouPhoto} resizeMode="cover" />
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>{item.discount}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ height: 40 }} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{activeWishlistTab === 'products' ? '❤️' : '📅'}</Text>
            <Text style={styles.emptyTitle}>
              {activeWishlistTab === 'products' ? 'Your Wishlist is Empty' : 'No Services Saved'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeWishlistTab === 'products'
                ? 'Explore our trending collections and save your favorite styles here.'
                : 'Explore services, restaurants & fast food, and save your favorites here.'}
            </Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate(activeWishlistTab === 'products' ? 'Home' : 'Categories')}
              activeOpacity={0.8}
            >
              <Text style={styles.shopNowText}>
                {activeWishlistTab === 'products' ? 'Start Shopping' : 'Explore Services'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* ─── Toast Notification Banner ──────────────────────────────────── */}
      <Animated.View
        style={[
          styles.toastContainer,
          {
            opacity: toastAnim,
            transform: [
              {
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents={toastMessage ? 'auto' : 'none'}
      >
        <View style={styles.toastContent}>
          <CheckCircle size={18} color="#4D6B28" weight="fill" />
          <Text style={styles.toastText} numberOfLines={1}>{toastMessage}</Text>
          <TouchableOpacity
            style={styles.toastBagBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.toastBagText}>View Bag</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white
  },

  // Header
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
    position: 'relative',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#5C1D38', // Deep wine/plum title matching Image 4
    letterSpacing: -0.2,
  },
  cartCountBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E11D48',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartCountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },

  // Grid
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },

  // Photo
  photoContainer: {
    width: '100%',
    height: 225,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  productPhoto: {
    width: '100%',
    height: '100%',
  },

  // Discount Badge Top-Left
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // Remove X Button Top-Right
  removeCircleBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Add to Bag Floating Button Bottom-Right
  addBagFloatingBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  // Info Column
  infoCol: {
    paddingTop: 8,
  },
  fastDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  fastDeliveryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  itemOldPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  offerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
    marginTop: 2,
  },

  // Swatches
  swatchesRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 6,
  },
  swatchDot: {
    width: 11,
    height: 11,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.15)',
  },

  // Trendy Pill
  trendyPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginTop: 6,
  },
  trendyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },

  // "For you" Section
  forYouSection: {
    marginTop: 16,
  },
  forYouTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  forYouGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forYouCard: {
    width: CARD_WIDTH,
  },
  forYouPhotoWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
    marginBottom: 6,
  },
  forYouPhoto: {
    width: '100%',
    height: '100%',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
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

  // Toast
  toastContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  toastText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  toastBagBtn: {
    backgroundColor: '#FBF6E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toastBagText: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '800',
  },
  wishlistTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#FAF9F5',
  },
  wishlistTabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  wishlistTabBtnActive: {
    borderColor: '#A8824B',
  },
  wishlistTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  wishlistTabTextActive: {
    color: '#1E293B',
    fontWeight: '800',
  },
});
