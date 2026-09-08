const fs = require('fs');

const fileContent = `import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  Platform,
  Share,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CaretLeft,
  CaretRight,
  Heart,
  ShoppingBagOpen,
  Cards,
  ShareNetwork,
  Sparkle,
  Truck,
  Money,
  ArrowsClockwise,
  Lightning,
  Star,
  CheckCircle,
  X,
  Check,
  Ruler,
  MagnifyingGlass,
  Plus,
} from 'phosphor-react-native';
import { typography, spacing, radius } from '../../theme';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { resolveProduct, getRelatedMockProducts, buildProductRouteParams } from '../../utils/productResolver';

const { width } = Dimensions.get('window');
const HERO_WIDTH = width;

// ─── Default Color Swatches ──────────────────────────────────────────────────
const COLOR_SWATCHES = [
  { id: 'fuchsia', name: 'Fuchsia', hex: '#BA5392', image: require('../../../assets/images/details/hero_1.jpg') },
  { id: 'amber', name: 'Amber', hex: '#E27B36', image: require('../../../assets/images/details/card_1.jpg') },
  { id: 'blue', name: 'Royal Blue', hex: '#5282EC', image: require('../../../assets/images/details/card_5.jpg') },
  { id: 'maroon', name: 'Deep Maroon', hex: '#772020', image: require('../../../assets/images/details/card_2.jpg') },
];

// ─── Sizes with Stock and Dimensions for Size Chart ──────────────────────────
const SIZES_DATA = [
  { label: 'XS', stock: null, disabled: false, bust: '32-34"', waist: '24-26"', hips: '34-36"', length: '24"' },
  { label: 'S', stock: null, disabled: false, bust: '34-36"', waist: '26-28"', hips: '36-38"', length: '24.5"' },
  { label: 'M', stock: null, disabled: false, bust: '36-38"', waist: '28-30"', hips: '38-40"', length: '25"' },
  { label: 'L', stock: '5 left', disabled: false, bust: '38-40"', waist: '30-32"', hips: '40-42"', length: '25.5"' },
  { label: 'XL', stock: '1 left', disabled: false, bust: '40-42"', waist: '32-34"', hips: '42-44"', length: '26"' },
  { label: 'XXL', stock: null, disabled: true, bust: '42-44"', waist: '34-36"', hips: '44-46"', length: '26.5"' },
];

// ─── Initial Reviews Data ───────────────────────────────────────────────────
const INITIAL_REVIEWS = [
  {
    id: 'rev_1',
    author: 'Neha',
    rating: 5,
    date: 'Jun 19, 2026',
    size: 'Size: XL',
    verified: true,
    comment: 'I recently bought this product on LitchMarketing. The fabric and finish are so premium and the fit is perfect!',
  },
  {
    id: 'rev_2',
    author: 'Aanya Sharma',
    rating: 5,
    date: 'May 28, 2026',
    size: 'Size: L',
    verified: true,
    comment: 'Super chic design! Looks even better in person than the pictures. True to size!',
  },
  {
    id: 'rev_3',
    author: 'Pooja V.',
    rating: 4,
    date: 'May 14, 2026',
    size: 'Size: M',
    verified: true,
    comment: 'High quality tailoring and fast delivery. Very satisfied with my purchase.',
  },
];

export default function ProductDetailsScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { formatPrice } = useCurrency();
  const { id, productId, slug, product: navProduct } = route.params || {};
  const { addItem, items: cartItems } = useCart();
  const { isLiked: checkLiked, toggleWishlist } = useWishlist();

  // Dynamically resolve product data based on selected product params
  const product = useMemo(() => {
    return resolveProduct(productId || id || slug, navProduct);
  }, [productId, id, slug, navProduct]);

  const isLiked = checkLiked(product.id);

  const isBooking = product.categoryId === 'cat_services' || product.categoryId === 'cat_food';

  const days = useMemo(() => {
    const arr = [];
    const dateNames = ['Today', 'Tomorrow'];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const label = i < 2 ? dateNames[i] : d.toLocaleDateString('en-US', { weekday: 'short' });
      const value = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      arr.push({ label, value });
    }
    return arr;
  }, []);

  const slots = [
    '10:00 AM - 11:30 AM',
    '12:00 PM - 01:30 PM',
    '02:00 PM - 03:30 PM',
    '04:00 PM - 05:30 PM',
    '06:00 PM - 07:30 PM',
    '08:00 PM - 09:30 PM',
  ];

  const [selectedBookingDay, setSelectedBookingDay] = useState(days[0]?.value || 'Today');
  const [selectedBookingSlot, setSelectedBookingSlot] = useState(slots[1]);

  const SIMILAR_TOPS = useMemo(() => {
    return getRelatedMockProducts(product.categoryId, product.id, 3);
  }, [product]);

  // States
  const carouselScrollRef = useRef(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0]);
  const [selectedSize, setSelectedSize] = useState('L');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState(product.gallery || [product.image]);

  // Update gallery images when product changes
  useEffect(() => {
    setGalleryImages(product.gallery || [product.image]);
  }, [product]);

  // Modals
  const [sizeChartVisible, setSizeChartVisible] = useState(false);
  const [pincodeModalVisible, setPincodeModalVisible] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState('Delivering to 110001 by Tomorrow, 5 PM');
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);
  const [reviewsList, setReviewsList] = useState(INITIAL_REVIEWS);
  const [writeReviewVisible, setWriteReviewVisible] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewName, setNewReviewName] = useState('');

  const [visualSearchVisible, setVisualSearchVisible] = useState(false);

  // Scroll & Sticky footer measurement states
  const [scrollY, setScrollY] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [infoSectionY, setInfoSectionY] = useState(400);
  const [inlineCtaY, setInlineCtaY] = useState(1000);

  // Determine if sticky CTA should be visible
  const stickyHeight = Platform.OS === 'ios' ? 86 : 74;
  const absoluteCtaY = infoSectionY + inlineCtaY;
  const isStickyCtaVisible = scrollY + containerHeight < absoluteCtaY + stickyHeight;

  // Toast Banner state
  const [toastMessage, setToastMessage] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (msg) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2400),
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  // Color selection effect
  const handleSelectColor = (swatch) => {
    setSelectedColor(swatch);
    setGalleryImages([
      swatch.image,
      require('../../../assets/images/details/card_1.jpg'),
      require('../../../assets/images/details/card_2.jpg'),
      require('../../../assets/images/details/card_3.jpg'),
    ]);
  };

  // Size selection effect
  const handleSelectSize = (sz) => {
    if (sz.disabled) {
      Alert.alert('Out of Stock', 'Size ' + sz.label + ' is currently out of stock. We have added you to the waitlist!');
      return;
    }
    setSelectedSize(sz.label);
  };

  // Add to Bag Action
  const handleAddToCart = async () => {
    try {
      await addItem(product.id, 1, {
        id: product.id,
        name: product.title,
        brand: product.brand,
        price: product.price,
        image: product.image,
        size: isBooking ? '' : selectedSize,
        color: isBooking ? '' : selectedColor.name,
        colorHex: isBooking ? '' : selectedColor.hex,
        isBooking: isBooking,
        bookingDay: isBooking ? selectedBookingDay : null,
        bookingTimeSlot: isBooking ? selectedBookingSlot : null,
      });
      if (isBooking) {
        showToast('Added booking for ' + product.brand + ' (' + selectedBookingDay + ' @ ' + selectedBookingSlot + ')!');
      } else {
        showToast('Added ' + product.brand + ' (Size ' + selectedSize + ', ' + selectedColor.name + ') to Bag!');
      }
    } catch (e) {
      showToast(isBooking ? 'Added booking for ' + product.brand + '!' : 'Added ' + product.brand + ' to Bag!');
    }
  };

  // Buy Now Action
  const handleBuyNow = async () => {
    try {
      await addItem(product.id, 1, {
        id: product.id,
        name: product.title,
        brand: product.brand,
        price: product.price,
        image: product.image,
        size: isBooking ? '' : selectedSize,
        color: isBooking ? '' : selectedColor.name,
        colorHex: isBooking ? '' : selectedColor.hex,
        isBooking: isBooking,
        bookingDay: isBooking ? selectedBookingDay : null,
        bookingTimeSlot: isBooking ? selectedBookingSlot : null,
      });
      navigation.navigate('Cart');
    } catch (e) {
      navigation.navigate('Cart');
    }
  };

  // Share Action
  const handleShare = async () => {
    try {
      await Share.share({
        title: product.brand + ' - ' + product.title,
        message: 'Check out ' + product.brand + ' (' + product.title + ') on LitchMarketing for $' + product.price + ' (' + product.discount + ')!',
      });
    } catch (e) {}
  };

  // Pincode Check
  const handleCheckPincode = () => {
    const code = pincodeInput.trim();
    if (!code || code.length < 5) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit postal pincode.');
      return;
    }
    setDeliveryEstimate('Delivering to ' + code + ' by Tomorrow, 5 PM (Free Express Delivery)');
    setPincodeSuccess(true);
    setPincodeModalVisible(false);
    showToast('Delivery available for ' + code + '!');
  };

  // Submit Review
  const handleSubmitReview = () => {
    if (!newReviewComment.trim()) {
      Alert.alert('Missing Review', 'Please enter your review text.');
      return;
    }

    const reviewObj = {
      id: 'rev_' + Date.now(),
      author: newReviewName.trim() || 'You',
      rating: newReviewRating,
      date: 'Today',
      size: 'Size: ' + selectedSize,
      verified: true,
      comment: newReviewComment.trim(),
    };

    setReviewsList((prev) => [reviewObj, ...prev]);
    setNewReviewComment('');
    setNewReviewName('');
    setWriteReviewVisible(false);
    showToast('Thank you! Your verified review has been submitted.');
  };

  const totalCartCount = cartItems?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Top Header: Back | Centered Crown Logo | Wishlist | Bag ──────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.hdrBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
          activeOpacity={0.7}
        >
          <CaretLeft size={24} color="#1E293B" weight="bold" />
        </TouchableOpacity>

        <View style={styles.centerLogoWrapper}>
          <Image
            source={require('../../../assets/images/crown_logo.png')}
            style={styles.crownLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.hdrRightActions}>
          <TouchableOpacity
            style={styles.hdrBtn}
            onPress={() => navigation.navigate('Wishlist')}
            activeOpacity={0.7}
          >
            <Heart size={24} color={isLiked ? '#E53935' : '#1E293B'} weight={isLiked ? 'fill' : 'regular'} />
          </TouchableOpacity>
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      >
        {/* Hero Image Box Carousel */}
        <View style={styles.heroBoxContainer}>
          <ScrollView
            ref={carouselScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / HERO_WIDTH);
              setActiveImageIndex(idx);
            }}
            contentContainerStyle={styles.carouselContainer}
          >
            {galleryImages.map((imgSrc, idx) => (
              <View key={idx} style={styles.heroSlideWrapper}>
                <Image source={imgSrc} style={styles.heroImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>

          {/* Carousel Left / Right Navigation Chevrons */}
          {galleryImages.length > 1 && (
            <>
              {activeImageIndex > 0 && (
                <TouchableOpacity
                  style={[styles.carouselNavBtn, styles.carouselNavBtnLeft]}
                  onPress={() => {
                    const nextIdx = activeImageIndex - 1;
                    carouselScrollRef.current?.scrollTo({ x: nextIdx * HERO_WIDTH, animated: true });
                    setActiveImageIndex(nextIdx);
                  }}
                  activeOpacity={0.8}
                >
                  <CaretLeft size={16} color="#1E293B" weight="bold" />
                </TouchableOpacity>
              )}

              {activeImageIndex < galleryImages.length - 1 && (
                <TouchableOpacity
                  style={[styles.carouselNavBtn, styles.carouselNavBtnRight]}
                  onPress={() => {
                    const nextIdx = activeImageIndex + 1;
                    carouselScrollRef.current?.scrollTo({ x: nextIdx * HERO_WIDTH, animated: true });
                    setActiveImageIndex(nextIdx);
                  }}
                  activeOpacity={0.8}
                >
                  <CaretRight size={16} color="#1E293B" weight="bold" />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Bottom Center Counter Pill */}
          <View style={styles.imageCounterPill}>
            <Text style={styles.imageCounterPillText}>
              {(activeImageIndex + 1) + '/' + galleryImages.length}
            </Text>
          </View>
        </View>

        {/* Product Information Section */}
        <View
          style={styles.infoSection}
          onLayout={(e) => setInfoSectionY(e.nativeEvent.layout.y)}
        >
          {/* Brand Header Line with Star Rating Badge */}
          <View style={styles.brandHeaderRow}>
            <View style={styles.brandLeftGroup}>
              <View style={styles.brandLogoIcon}>
                <Text style={styles.brandLogoChar}>{(product.brand || 'G').charAt(0)}</Text>
              </View>
              <Text style={styles.brandTitle}>{product.brand || 'Gucci'}</Text>
            </View>
            <View style={styles.ratingBadgeRight}>
              <Star size={13} color="#F59E0B" weight="fill" />
              <Text style={styles.ratingNumberText}>{product.rating || 4.9}</Text>
            </View>
          </View>

          {/* Product Subtitle / Title */}
          <Text style={styles.productSubtitle}>{product.title}</Text>

          {/* Price & Stats Row */}
          <View style={styles.priceRowContainer}>
            <View style={styles.priceLeftGroup}>
              <Text style={styles.priceMain}>{formatPrice(product.price)}</Text>
              {product.oldPrice && (
                <Text style={styles.mrpText}>{formatPrice(product.oldPrice)}</Text>
              )}
              {product.discount && (
                <View style={styles.discountBadgePill}>
                  <Text style={styles.discountBadgeText}>{product.discount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.soldCountText}>380+ Sold</Text>
          </View>

          {/* Inline Size & Color Selectors */}
          {!isBooking && (
            <View style={styles.inlineSelectorsRow}>
              {/* Inline Size Selector */}
              <View style={styles.inlineSizeCol}>
                <Text style={styles.selectorTitleLabel}>Size:</Text>
                <View style={styles.sizePillsRow}>
                  {SIZES_DATA.slice(1, 4).map((sz) => {
                    const isSelected = selectedSize === sz.label;
                    return (
                      <TouchableOpacity
                        key={sz.label}
                        style={[styles.sizePill, isSelected && styles.sizePillActive]}
                        onPress={() => handleSelectSize(sz)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.sizePillText, isSelected && styles.sizePillTextActive]}>
                          {sz.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Inline Color Selector */}
              <View style={styles.inlineColorCol}>
                <Text style={styles.selectorTitleLabel}>Color:</Text>
                <View style={styles.swatchRowCompact}>
                  {COLOR_SWATCHES.map((swatch) => {
                    const isActive = selectedColor.id === swatch.id;
                    return (
                      <TouchableOpacity
                        key={swatch.id}
                        onPress={() => handleSelectColor(swatch)}
                        style={[styles.swatchRingCompact, isActive && styles.swatchRingCompactActive]}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.swatchCircleCompact, { backgroundColor: swatch.hex }]} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* Description Section */}
          <View style={styles.descriptionCardSection}>
            <Text style={styles.descriptionHeadingTitle}>Description</Text>
            <Text
              style={styles.descriptionBodyText}
              numberOfLines={isDescriptionExpanded ? undefined : 2}
            >
              {product.description ||
                'Elevate your daily look with this crafted statement piece. Designed with ultra-soft fabric, modern fit, and seamless stitching for unmatched luxury and comfort.'}
            </Text>
            <TouchableOpacity
              style={styles.readMorePillBtn}
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.readMorePillText}>
                {isDescriptionExpanded ? 'Show less ∧' : 'Read more ∨'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Delivery & Pincode Check Box */}
          <View style={styles.specificationsBox}>
            <View style={styles.deliveryHeaderRow}>
              <View style={styles.deliveryLeftGroup}>
                <Truck size={20} color="#1E293B" weight="bold" />
                <Text style={styles.deliveryHeaderTitle}>Express Delivery</Text>
              </View>
              <TouchableOpacity
                onPress={() => setPincodeModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.changePincodeBtnText}>
                  {pincodeSuccess ? 'Change Pincode' : 'Check Delivery'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.currentDeliveryEstimate}>{deliveryEstimate}</Text>

            <View style={styles.deliveryPerksRow}>
              <View style={styles.perkPillItem}>
                <Money size={15} color="#059669" weight="fill" />
                <Text style={styles.perkPillText}>Cash on Delivery Available</Text>
              </View>
              <View style={styles.perkPillItem}>
                <ArrowsClockwise size={15} color="#2563EB" weight="bold" />
                <Text style={styles.perkPillText}>7 Days Easy Return</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar CTA */}
      <View style={styles.bottomBarFixedContainer}>
        <View style={styles.bottomBarContent}>
          <TouchableOpacity
            style={styles.softOutlineCartBtn}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Text style={styles.softOutlineCartBtnText}>
              {isBooking ? 'Add Booking' : 'Add to cart'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.solidNavyBuyBtn}
            onPress={handleBuyNow}
            activeOpacity={0.8}
          >
            <Text style={styles.solidNavyBuyBtnText}>
              {isBooking ? 'Book Now' : 'Buy now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Top Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  hdrBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLogoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownLogo: {
    width: 28,
    height: 28,
  },
  hdrRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartCountBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E53935',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  scrollContent: {
    paddingBottom: 90,
  },

  // Carousel
  heroBoxContainer: {
    width: '100%',
    height: 380,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContainer: {
    paddingHorizontal: 0,
  },
  heroSlideWrapper: {
    width: HERO_WIDTH,
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  heroImage: {
    width: HERO_WIDTH * 0.85,
    height: 340,
  },
  carouselNavBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  carouselNavBtnLeft: {
    left: 14,
  },
  carouselNavBtnRight: {
    right: 14,
  },
  imageCounterPill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.92)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 3,
    zIndex: 10,
  },
  imageCounterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  // Info Section
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  brandHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoChar: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  ratingBadgeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
  },
  ratingNumberText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  productSubtitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    lineHeight: 24,
  },
  priceRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  priceLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceMain: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  mrpText: {
    fontSize: 13,
    color: '#EF4444',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountBadgePill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  soldCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // Inline Selectors
  inlineSelectorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  inlineSizeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlineColorCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectorTitleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  sizePillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sizePill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizePillActive: {
    backgroundColor: '#1E293B',
  },
  sizePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  sizePillTextActive: {
    color: '#FFFFFF',
  },
  swatchRowCompact: {
    flexDirection: 'row',
    gap: 6,
  },
  swatchRingCompact: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchRingCompactActive: {
    borderColor: '#1E293B',
  },
  swatchCircleCompact: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },

  // Description
  descriptionCardSection: {
    marginTop: 18,
  },
  descriptionHeadingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  descriptionBodyText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 19,
  },
  readMorePillBtn: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  readMorePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },

  // Delivery Box
  specificationsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deliveryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  changePincodeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  currentDeliveryEstimate: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
  deliveryPerksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  perkPillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  perkPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },

  // Bottom Fixed CTA Bar
  bottomBarFixedContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  softOutlineCartBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  softOutlineCartBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  solidNavyBuyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  solidNavyBuyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
`;

fs.writeFileSync('d:/httn-app/src/screens/product/ProductDetailsScreen.js', fileContent, 'utf8');
console.log('Cleaned ProductDetailsScreen.js written!');
