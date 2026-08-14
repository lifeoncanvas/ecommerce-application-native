import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    comment: 'I recently bought this product on KingsShoppers. The fabric and finish are so premium and the fit is perfect!',
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
  // It is visible if the inline cta row has not reached the bottom viewport boundary yet.
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
      Alert.alert('Out of Stock', `Size ${sz.label} is currently out of stock. We've added you to the waitlist!`);
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
        showToast(`Added booking for ${product.brand} (${selectedBookingDay} @ ${selectedBookingSlot})!`);
      } else {
        showToast(`Added ${product.brand} (Size ${selectedSize}, ${selectedColor.name}) to Bag!`);
      }
    } catch (e) {
      showToast(isBooking ? `Added booking for ${product.brand}!` : `Added ${product.brand} to Bag!`);
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
        title: `${product.brand} - ${product.title}`,
        message: `Check out ${product.brand} (${product.title}) on KingsShoppers for ₹${product.price} (${product.discount})!`,
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
    setDeliveryEstimate(`Delivering to ${code} by Tomorrow, 5 PM (Free Express Delivery)`);
    setPincodeSuccess(true);
    setPincodeModalVisible(false);
    showToast(`Delivery available for ${code}!`);
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
      size: `Size: ${selectedSize}`,
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
            onPress={() => {
              toggleWishlist(product.id);
              showToast(isLiked ? 'Removed from Wishlist' : 'Saved to Wishlist!');
            }}
            activeOpacity={0.7}
          >
            <Heart
              size={22}
              color={isLiked ? '#E53935' : '#1E293B'}
              weight={isLiked ? 'fill' : 'regular'}
            />
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
        onScroll={(e) => {
          setScrollY(e.nativeEvent.contentOffset.y);
        }}
        onLayout={(e) => {
          setContainerHeight(e.nativeEvent.layout.height);
        }}
        scrollEventThrottle={16}
      >
        {/* ─── Hero Image Carousel ────────────────────────────────────────── */}
        <ScrollView
          horizontal
          decelerationRate="fast"
          snapToInterval={HERO_WIDTH}
          snapToAlignment="start"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          onScroll={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / HERO_WIDTH);
            setActiveImageIndex(idx);
          }}
          scrollEventThrottle={16}
        >
          {galleryImages.map((imgSrc, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.95}
              onPress={() => setVisualSearchVisible(true)}
              style={styles.heroSlideWrapper}
            >
              <Image source={imgSrc} style={styles.heroImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ─── Action Buttons Strip (Visual Search | Wishlist | Share) ────── */}
        <View style={styles.actionStripContainer}>
          <View style={styles.actionStrip}>
            <TouchableOpacity
              style={styles.stripBtn}
              onPress={() => setVisualSearchVisible(true)}
              activeOpacity={0.7}
            >
              <Cards size={18} color="#475569" weight="regular" />
            </TouchableOpacity>

            <View style={styles.stripDivider} />

            <TouchableOpacity
              style={styles.stripBtn}
              onPress={() => {
                toggleWishlist(product.id);
                showToast(isLiked ? 'Removed from Wishlist' : 'Saved to Wishlist!');
              }}
              activeOpacity={0.7}
            >
              <Heart
                size={18}
                color={isLiked ? '#E53935' : '#475569'}
                weight={isLiked ? 'fill' : 'regular'}
              />
            </TouchableOpacity>

            <View style={styles.stripDivider} />

            <TouchableOpacity
              style={styles.stripBtn}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <ShareNetwork size={18} color="#475569" weight="regular" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Product Header Information ─────────────────────────────────── */}
        <View 
          style={styles.infoSection}
          onLayout={(e) => {
            const y = e.nativeEvent.layout.y;
            if (y > 0) setInfoSectionY(y);
          }}
        >
          <Text style={styles.brandTitle}>{product.brand}</Text>
          <Text style={styles.productSubtitle}>{product.title}</Text>

          {/* Rating Pill */}
          <TouchableOpacity
            style={styles.ratingPill}
            onPress={() => setReviewsModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.ratingNumber}>{product.rating}</Text>
            <Star size={11} color="#1E293B" weight="fill" style={{ marginHorizontal: 3 }} />
            <Text style={styles.ratingPipe}>|</Text>
            <Text style={styles.ratingsCountText}>{reviewsList.length * 29} Ratings</Text>
          </TouchableOpacity>

          {/* Pricing Row */}
          <View style={styles.priceRow}>
            <Text style={styles.priceMain}>₹{product.price}</Text>
            <Text style={styles.mrpText}>MRP ₹{product.mrp}</Text>
            <Text style={styles.discountLabel}>{product.discount}</Text>
          </View>
          <Text style={styles.taxNote}>inclusive of all taxes</Text>

          {/* ─── Color & Size Selection OR Booking Slots Selector ────────── */}
          {isBooking ? (
            <View style={styles.bookingSection}>
              {/* Day Selector */}
              <Text style={styles.sectionHeaderTitle}>SELECT DATE</Text>
              <View style={styles.daySelectorRow}>
                {days.map((d) => {
                  const isSelected = selectedBookingDay === d.value;
                  return (
                    <TouchableOpacity
                      key={d.value}
                      style={[styles.dayCard, isSelected && styles.dayCardActive]}
                      onPress={() => setSelectedBookingDay(d.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{d.label}</Text>
                      <Text style={[styles.dayValue, isSelected && styles.dayValueActive]}>{d.value}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Time Slots Selector */}
              <Text style={[styles.sectionHeaderTitle, { marginTop: 20 }]}>AVAILABLE TIME SLOTS</Text>
              <View style={styles.slotsGrid}>
                {slots.map((s) => {
                  const isSelected = selectedBookingSlot === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.slotBtn, isSelected && styles.slotBtnActive]}
                      onPress={() => setSelectedBookingSlot(s)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            <>
              {/* ─── Color Swatches ────────────────────────────────────────────── */}
              <View style={styles.colorSection}>
                <Text style={styles.colorLabel}>
                  COLOR: <Text style={styles.colorValue}>{selectedColor.name}</Text>
                </Text>
                <View style={styles.swatchRow}>
                  {COLOR_SWATCHES.map((swatch) => {
                    const isSelected = selectedColor.id === swatch.id;
                    return (
                      <TouchableOpacity
                        key={swatch.id}
                        style={[styles.swatchRing, isSelected && styles.swatchRingActive]}
                        onPress={() => handleSelectColor(swatch)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.swatchCircle, { backgroundColor: swatch.hex }]} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* ─── Size Selector ─────────────────────────────────────────────── */}
              <View style={styles.sizeSection}>
                <View style={styles.sizeHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>SELECT SIZE</Text>
                  <TouchableOpacity
                    onPress={() => setSizeChartVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sizeChartLink}>SIZE CHART</Text>
                  </TouchableOpacity>
                </View>

                {/* Smart Size Recommendation Pill */}
                <View style={styles.recommendationBox}>
                  <Sparkle size={16} color="#1E293B" weight="fill" />
                  <Text style={styles.recommendationText}>
                    Size <Text style={{ fontWeight: '800' }}>L</Text> recommended for you
                  </Text>
                </View>

                {/* Size Buttons Grid */}
                <View style={styles.sizesGrid}>
                  {SIZES_DATA.map((sz) => {
                    const isSelected = selectedSize === sz.label;
                    return (
                      <TouchableOpacity
                        key={sz.label}
                        style={[
                          styles.sizeBtn,
                          isSelected && styles.sizeBtnActive,
                          sz.disabled && styles.sizeBtnDisabled,
                        ]}
                        onPress={() => handleSelectSize(sz)}
                        activeOpacity={0.8}
                      >
                        {sz.stock && (
                          <View style={styles.stockBadge}>
                            <Text style={styles.stockBadgeText}>{sz.stock}</Text>
                          </View>
                        )}
                        <Text
                          style={[
                            styles.sizeBtnText,
                            isSelected && styles.sizeBtnTextActive,
                            sz.disabled && styles.sizeBtnTextDisabled,
                          ]}
                        >
                          {sz.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* ─── Delivery & Services Box ───────────────────────────────────── */}
          <TouchableOpacity
            style={styles.deliveryBox}
            onPress={() => setPincodeModalVisible(true)}
            activeOpacity={0.9}
          >
            <View style={styles.deliveryRow}>
              <Truck size={18} color="#1E293B" weight="bold" />
              <Text style={styles.deliveryTitle}>DELIVERY & SERVICES</Text>
              <Text style={styles.changePincodeText}>Change Pincode</Text>
            </View>

            <Text style={styles.currentDeliveryEstimate}>
              {deliveryEstimate}
            </Text>

            <View style={styles.deliveryFeatureRow}>
              <Money size={16} color="#1E293B" weight="regular" />
              <Text style={styles.deliveryFeatureText}>Pay on Delivery available</Text>
            </View>

            <View style={styles.deliveryFeatureRow}>
              <ArrowsClockwise size={16} color="#1E293B" weight="regular" />
              <Text style={styles.deliveryFeatureText}>Hassle free 14 days Return & Exchange</Text>
            </View>
          </TouchableOpacity>

          {/* ─── CTA Action Buttons (Add to Bag & Buy Now) ────────────────── */}
          <View 
            style={[styles.ctaButtonsRow, { opacity: isStickyCtaVisible ? 0 : 1 }]}
            onLayout={(e) => {
              const y = e.nativeEvent.layout.y;
              if (y > 0) setInlineCtaY(y);
            }}
          >
            <TouchableOpacity
              style={styles.addBagBtn}
              onPress={handleAddToCart}
              activeOpacity={0.85}
            >
              <ShoppingBagOpen size={20} color="#1E293B" weight="bold" />
              <Text style={styles.addBagText}>{isBooking ? 'ADD TO BOOKINGS' : 'ADD TO BAG'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={handleBuyNow}
              activeOpacity={0.85}
            >
              <Lightning size={20} color="#FFFFFF" weight="fill" />
              <Text style={styles.buyNowText}>{isBooking ? 'BOOK NOW' : 'BUY NOW'}</Text>
            </TouchableOpacity>
          </View>

          {/* ─── Similar Tops Grid (Image 2) ──────────────────────────────── */}
          <View style={styles.similarSection}>
            <View style={styles.similarGrid}>
              {getRelatedMockProducts(product.categoryId, product.id, 2).map((top) => (
                <View key={top.id} style={styles.similarCard}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.push('ProductDetails', buildProductRouteParams(top))}
                    style={styles.similarPhotoWrapper}
                  >
                    <Image source={top.image} style={styles.similarPhoto} resizeMode="cover" />
                    <View style={styles.similarRatingBadge}>
                      <Text style={styles.similarRatingText}>{top.rating} ★</Text>
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.similarBrand}>{top.brand}</Text>
                  <Text style={styles.similarName} numberOfLines={1}>{top.name}</Text>
                  <View style={styles.similarPriceRow}>
                    <Text style={styles.similarPrice}>₹{top.price}</Text>
                    <Text style={styles.similarDiscount}>{top.discount}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.similarAddBagBtn}
                    onPress={() => {
                      addItem(top.id, 1, top);
                      showToast(`Added ${top.brand} (${top.name}) to Bag!`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.similarAddBagText}>ADD TO BAG</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* ─── Ratings & Reviews Section (Image 2) ──────────────────────── */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>RATINGS & REVIEWS</Text>
              <TouchableOpacity
                onPress={() => setReviewsModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.sizeChartLink}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            {/* Overall Rating Header */}
            <View style={styles.overallRatingRow}>
              <View style={styles.bigRatingBadge}>
                <Text style={styles.bigRatingNumber}>{product.rating}</Text>
                <Star size={14} color="#FFFFFF" weight="fill" style={{ marginLeft: 3 }} />
              </View>
              <Text style={styles.overallRatingSub}>
                <Text style={{ fontWeight: '800' }}>{product.ratingsCount} Ratings</Text> | {reviewsList.length} Reviews
              </Text>
            </View>

            {/* Customer Review Card (First review in list) */}
            {reviewsList[0] && (
              <View style={styles.reviewCard}>
                <View style={styles.reviewCardHeader}>
                  <View style={styles.reviewStarBadge}>
                    <Text style={styles.reviewStarNum}>{reviewsList[0].rating}</Text>
                    <Star size={10} color="#1E293B" weight="fill" style={{ marginLeft: 2 }} />
                  </View>
                  <Text style={styles.reviewDate}>{reviewsList[0].date}</Text>
                  <View style={styles.reviewSizeBadge}>
                    <Text style={styles.reviewSizeText}>{reviewsList[0].size}</Text>
                  </View>
                </View>

                <Text style={styles.reviewBodyText}>
                  {reviewsList[0].comment}
                </Text>

                <View style={styles.verifiedBuyerRow}>
                  <CheckCircle size={15} color="#4D6B28" weight="fill" />
                  <Text style={styles.verifiedBuyerName}>{reviewsList[0].author}</Text>
                </View>
              </View>
            )}

            {/* Write a Review Button */}
            <TouchableOpacity
              style={styles.writeReviewTriggerBtn}
              onPress={() => setWriteReviewVisible(true)}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#1E293B" weight="bold" />
              <Text style={styles.writeReviewTriggerText}>Write a Customer Review</Text>
            </TouchableOpacity>
          </View>

          {/* ─── Products You May Like Grid (Image 3) ─────────────────────── */}
          <View style={styles.youMayLikeSection}>
            <Text style={styles.sectionHeaderTitle}>PRODUCTS YOU MAY LIKE</Text>

            <View style={styles.recGrid}>
              {getRelatedMockProducts(product.categoryId, product.id, 4).map((item) => {
                const likedItem = checkLiked(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recCard}
                    onPress={() => navigation.push('ProductDetails', buildProductRouteParams(item))}
                    activeOpacity={0.9}
                  >
                    <View style={styles.recPhotoWrapper}>
                      <Image source={item.image} style={styles.recPhoto} resizeMode="cover" />
                      <TouchableOpacity
                        style={styles.recHeartBtn}
                        onPress={() => {
                          toggleWishlist(item.id);
                          showToast(likedItem ? 'Removed from Wishlist' : 'Saved to Wishlist!');
                        }}
                        activeOpacity={0.7}
                      >
                        <Heart
                          size={16}
                          color={likedItem ? '#E53935' : '#1E293B'}
                          weight={likedItem ? 'fill' : 'regular'}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.recBrand}>{item.brand}</Text>
                    <Text style={styles.recName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.recPriceRow}>
                      <Text style={styles.recPrice}>₹{item.price}</Text>
                      <Text style={styles.recDiscount}>{item.discount}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Animated Floating Notification Toast ────────────────────────── */}
      <Animated.View
        style={[
          styles.toastContainer,
          {
            opacity: toastAnim,
            transform: [
              {
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [60, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents={toastMessage ? 'auto' : 'none'}
      >
        <View style={styles.toastContent}>
          <CheckCircle size={20} color="#4D6B28" weight="fill" />
          <Text style={styles.toastText} numberOfLines={2}>
            {toastMessage}
          </Text>
          <TouchableOpacity
            style={styles.toastActionBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.toastActionText}>View Bag</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ─── Size Chart Modal ────────────────────────────────────────────── */}
      <Modal
        visible={sizeChartVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSizeChartVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ruler size={22} color="#1E293B" weight="bold" />
                <Text style={styles.modalTitle}>Size Guide & Measurements</Text>
              </View>
              <TouchableOpacity onPress={() => setSizeChartVisible(false)}>
                <X size={22} color="#1E293B" weight="bold" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingVertical: 12 }}>
              <Text style={styles.sizeChartSubtitle}>
                Garment measurements in inches. Tap any size to select.
              </Text>

              {/* Table Header */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeadCell, { flex: 1.2 }]}>Size</Text>
                <Text style={styles.tableHeadCell}>Bust</Text>
                <Text style={styles.tableHeadCell}>Waist</Text>
                <Text style={styles.tableHeadCell}>Hips</Text>
                <Text style={styles.tableHeadCell}>Length</Text>
              </View>

              {/* Table Rows */}
              {SIZES_DATA.map((sz) => {
                const isSelected = selectedSize === sz.label;
                return (
                  <TouchableOpacity
                    key={sz.label}
                    style={[styles.tableRow, isSelected && styles.tableRowSelected]}
                    onPress={() => {
                      if (!sz.disabled) {
                        setSelectedSize(sz.label);
                        setSizeChartVisible(false);
                        showToast(`Selected Size ${sz.label}`);
                      }
                    }}
                  >
                    <View style={[{ flex: 1.2, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                      <Text style={[styles.tableCell, isSelected && styles.tableCellActive, sz.disabled && { color: '#94A3B8' }]}>
                        {sz.label}
                      </Text>
                      {isSelected && <Check size={14} color="#1E293B" weight="bold" />}
                    </View>
                    <Text style={styles.tableCell}>{sz.bust}</Text>
                    <Text style={styles.tableCell}>{sz.waist}</Text>
                    <Text style={styles.tableCell}>{sz.hips}</Text>
                    <Text style={styles.tableCell}>{sz.length}</Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.measuringTipBox}>
                <Text style={styles.measuringTipTitle}>💡 Measuring Tip</Text>
                <Text style={styles.measuringTipBody}>
                  Measure across the fullest part of your bust and waist while keeping the tape comfortably loose. If between sizes, we recommend sizing up.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Pincode / Delivery Modal ────────────────────────────────────── */}
      <Modal
        visible={pincodeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPincodeModalVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.centerModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Check Delivery Location</Text>
              <TouchableOpacity onPress={() => setPincodeModalVisible(false)}>
                <X size={20} color="#1E293B" weight="bold" />
              </TouchableOpacity>
            </View>

            <Text style={styles.pincodePrompt}>
              Enter your 6-digit postal pincode to check exact delivery timeline and availability:
            </Text>

            <View style={styles.pincodeInputRow}>
              <TextInput
                style={styles.pincodeTextInput}
                placeholder="e.g. 110001"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
                value={pincodeInput}
                onChangeText={setPincodeInput}
              />
              <TouchableOpacity
                style={styles.pincodeCheckBtn}
                onPress={handleCheckPincode}
              >
                <Text style={styles.pincodeCheckBtnText}>Check</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Ratings & Reviews Full Modal ────────────────────────────────── */}
      <Modal
        visible={reviewsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customer Reviews ({reviewsList.length})</Text>
              <TouchableOpacity onPress={() => setReviewsModalVisible(false)}>
                <X size={22} color="#1E293B" weight="bold" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingVertical: 10 }}>
              {/* Score breakdown */}
              <View style={styles.ratingSummaryCard}>
                <View style={styles.bigScoreBox}>
                  <Text style={styles.bigScoreNum}>{product.rating}</Text>
                  <View style={{ flexDirection: 'row', gap: 2, marginVertical: 4 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} color="#1E293B" weight="fill" />
                    ))}
                  </View>
                  <Text style={styles.ratingCountSub}>{reviewsList.length * 29} verified ratings</Text>
                </View>

                <View style={styles.ratingBarsCol}>
                  {[
                    { star: '5★', pct: '74%' },
                    { star: '4★', pct: '18%' },
                    { star: '3★', pct: '5%' },
                    { star: '2★', pct: '2%' },
                    { star: '1★', pct: '1%' },
                  ].map((bar) => (
                    <View key={bar.star} style={styles.ratingBarRow}>
                      <Text style={styles.barLabel}>{bar.star}</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: bar.pct }]} />
                      </View>
                      <Text style={styles.barPct}>{bar.pct}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Reviews List */}
              {reviewsList.map((rev) => (
                <View key={rev.id} style={styles.fullReviewItem}>
                  <View style={styles.reviewCardHeader}>
                    <View style={styles.reviewStarBadge}>
                      <Text style={styles.reviewStarNum}>{rev.rating}</Text>
                      <Star size={10} color="#1E293B" weight="fill" style={{ marginLeft: 2 }} />
                    </View>
                    <Text style={styles.reviewDate}>{rev.date}</Text>
                    <View style={styles.reviewSizeBadge}>
                      <Text style={styles.reviewSizeText}>{rev.size}</Text>
                    </View>
                  </View>

                  <Text style={styles.reviewBodyText}>{rev.comment}</Text>

                  <View style={styles.verifiedBuyerRow}>
                    <CheckCircle size={14} color="#4D6B28" weight="fill" />
                    <Text style={styles.verifiedBuyerName}>{rev.author}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.writeReviewModalBtn}
                onPress={() => {
                  setReviewsModalVisible(false);
                  setWriteReviewVisible(true);
                }}
              >
                <Plus size={18} color="#FFFFFF" weight="bold" />
                <Text style={styles.writeReviewModalBtnText}>Write a Review</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Write a Review Modal ────────────────────────────────────────── */}
      <Modal
        visible={writeReviewVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWriteReviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setWriteReviewVisible(false)}>
                <X size={22} color="#1E293B" weight="bold" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingVertical: 14 }}>
              <Text style={styles.formLabel}>Your Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Priya"
                placeholderTextColor="#94A3B8"
                value={newReviewName}
                onChangeText={setNewReviewName}
              />

              <Text style={[styles.formLabel, { marginTop: 14 }]}>Your Rating</Text>
              <View style={styles.starPickerRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setNewReviewRating(s)}
                    style={styles.starPickBtn}
                  >
                    <Star
                      size={28}
                      color="#1E293B"
                      weight={s <= newReviewRating ? 'fill' : 'regular'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.formLabel, { marginTop: 14 }]}>Your Review</Text>
              <TextInput
                style={[styles.formInput, { height: 90, textAlignVertical: 'top' }]}
                placeholder="How does it fit? How is the fabric and stitching?"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={newReviewComment}
                onChangeText={setNewReviewComment}
              />

              <TouchableOpacity
                style={styles.submitReviewBtn}
                onPress={handleSubmitReview}
              >
                <Text style={styles.submitReviewBtnText}>Submit Verified Review</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Visual Search / Similar Styles Modal ────────────────────────── */}
      <Modal
        visible={visualSearchVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisualSearchVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.centerModalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Cards size={20} color="#1E293B" weight="bold" />
                <Text style={styles.modalTitle}>Visual Search</Text>
              </View>
              <TouchableOpacity onPress={() => setVisualSearchVisible(false)}>
                <X size={20} color="#1E293B" weight="bold" />
              </TouchableOpacity>
            </View>

            <Text style={styles.pincodePrompt}>
              Matching tops and styles similar to this silhouette:
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              {SIMILAR_TOPS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{ flex: 1 }}
                  onPress={() => {
                    setVisualSearchVisible(false);
                    navigation.push('ProductDetails', { id: item.id, product: item });
                  }}
                >
                  <Image source={item.image} style={{ width: '100%', height: 130, borderRadius: 12 }} resizeMode="cover" />
                  <Text style={[styles.similarBrand, { fontSize: 11 }]}>{item.brand}</Text>
                  <Text style={styles.similarPrice}>₹{item.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Sticky Bottom CTA Buttons Row ────────────────────────────── */}
      {isStickyCtaVisible && (
        <View style={styles.stickyCtaContainer}>
          <TouchableOpacity
            style={styles.addBagBtn}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <ShoppingBagOpen size={20} color="#1E293B" weight="bold" />
            <Text style={styles.addBagText}>{isBooking ? 'ADD TO BOOKINGS' : 'ADD TO BAG'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyNowBtn}
            onPress={handleBuyNow}
            activeOpacity={0.85}
          >
            <Lightning size={20} color="#FFFFFF" weight="fill" />
            <Text style={styles.buyNowText}>{isBooking ? 'BOOK NOW' : 'BUY NOW'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white background
  },

  // Header Bar
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 10 : 4,
    paddingBottom: 8,
  },
  hdrBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerLogoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownLogo: {
    width: 34,
    height: 34,
  },
  hdrRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartCountBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  // Carousel
  carouselContainer: {
    paddingHorizontal: 0,
    gap: 0,
    paddingVertical: 0,
  },
  heroSlideWrapper: {
    width: HERO_WIDTH,
    height: 400,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#EDE9DE',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // Action Strip (Visual Search | Wishlist | Share)
  actionStripContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  actionStrip: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stripBtn: {
    paddingHorizontal: 22,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stripDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
  },

  // Info Section
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  productSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },

  // Rating Pill
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
  },
  ratingNumber: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  ratingPipe: {
    fontSize: 11,
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  ratingsCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // Pricing
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 14,
    gap: 8,
  },
  priceMain: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  mrpText: {
    fontSize: 13.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  taxNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },

  // Colors
  colorSection: {
    marginTop: 18,
  },
  colorLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  colorValue: {
    fontWeight: '600',
    color: '#64748B',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  swatchRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchRingActive: {
    borderColor: '#1E293B',
  },
  swatchCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  // Size Selector
  sizeSection: {
    marginTop: 20,
  },
  sizeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.8,
  },
  sizeChartLink: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF6E2', // Warm light cream
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
    gap: 8,
  },
  recommendationText: {
    fontSize: 12.5,
    color: '#1E293B',
    fontWeight: '600',
  },
  sizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  sizeBtn: {
    width: (width - 70) / 4,
    height: 46,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sizeBtnActive: {
    backgroundColor: '#FBF6E2',
    borderColor: '#1E293B',
    borderWidth: 2,
  },
  sizeBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  sizeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  sizeBtnTextActive: {
    color: '#1E293B',
    fontWeight: '800',
  },
  sizeBtnTextDisabled: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  stockBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: '#991B1B',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  stockBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Delivery & Services Box
  deliveryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  deliveryTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.6,
  },
  changePincodeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 'auto',
    textDecorationLine: 'underline',
  },
  currentDeliveryEstimate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F766E',
    marginTop: -4,
  },
  deliveryFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deliveryFeatureText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },

  stickyCtaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 999,
  },

  // CTA Action Buttons
  ctaButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  addBagBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addBagText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.6,
  },
  buyNowBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  buyNowText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },

  // Similar Tops Section (Image 2)
  similarSection: {
    marginTop: 28,
  },
  similarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  similarCard: {
    flex: 1,
  },
  similarPhotoWrapper: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EDE9DE',
    position: 'relative',
  },
  similarPhoto: {
    width: '100%',
    height: '100%',
  },
  similarRatingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  similarRatingText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  similarBrand: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
  },
  similarName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  similarPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 3,
  },
  similarPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  similarDiscount: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  similarAddBagBtn: {
    marginTop: 8,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  similarAddBagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.4,
  },

  // Ratings & Reviews Section (Image 2)
  reviewsSection: {
    marginTop: 30,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    marginBottom: 16,
  },
  bigRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  bigRatingNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  overallRatingSub: {
    fontSize: 12,
    color: '#475569',
  },
  reviewCard: {
    backgroundColor: '#FBF6E2', // App exact review card background
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(107, 91, 30, 0.12)',
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewStarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reviewStarNum: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  reviewDate: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  reviewSizeBadge: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  reviewSizeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#475569',
  },
  reviewBodyText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 19,
  },
  verifiedBuyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  verifiedBuyerName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  writeReviewTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 14,
    backgroundColor: '#F8FAFC',
  },
  writeReviewTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },

  // Products You May Like Grid (Image 3)
  youMayLikeSection: {
    marginTop: 32,
  },
  recGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginTop: 14,
  },
  recCard: {
    width: (width - 54) / 2,
  },
  recPhotoWrapper: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EDE9DE',
    position: 'relative',
  },
  recPhoto: {
    width: '100%',
    height: '100%',
  },
  recHeartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recBrand: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
  },
  recName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  recPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 3,
  },
  recPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  recDiscount: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E293B',
  },

  // Floating Toast Notification
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  toastActionBtn: {
    backgroundColor: '#FBF6E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  toastActionText: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '800',
  },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centerModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  sizeChartSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tableHeadCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
    alignItems: 'center',
  },
  tableRowSelected: {
    backgroundColor: '#FBF6E2',
    borderRadius: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 11.5,
    color: '#475569',
    textAlign: 'center',
  },
  tableCellActive: {
    fontWeight: '800',
    color: '#1E293B',
  },
  measuringTipBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  measuringTipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  measuringTipBody: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  // Pincode Modal
  pincodePrompt: {
    fontSize: 12.5,
    color: '#475569',
    marginTop: 10,
    lineHeight: 18,
  },
  pincodeInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  pincodeTextInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  pincodeCheckBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  pincodeCheckBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  // Full Reviews Modal
  ratingSummaryCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bigScoreBox: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  bigScoreNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
  },
  ratingCountSub: {
    fontSize: 9.5,
    color: '#64748B',
  },
  ratingBarsCol: {
    flex: 1,
    paddingLeft: 14,
    gap: 4,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    width: 20,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 3,
  },
  barPct: {
    fontSize: 9.5,
    color: '#64748B',
    width: 24,
    textAlign: 'right',
  },
  fullReviewItem: {
    backgroundColor: '#FBF6E2',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  writeReviewModalBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  writeReviewModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  // Form
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1E293B',
  },
  starPickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  starPickBtn: {
    padding: 4,
  },
  submitReviewBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  bookingSection: {
    marginTop: 20,
    backgroundColor: '#FAF9F5',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.15)',
  },
  daySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  dayCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  dayCardActive: {
    borderColor: '#C9A84C',
    backgroundColor: '#FAF6EC',
    borderWidth: 1.5,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayLabelActive: {
    color: '#A8824B',
    fontWeight: '800',
  },
  dayValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
  },
  dayValueActive: {
    color: '#1E293B',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  slotBtn: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  slotBtnActive: {
    borderColor: '#C9A84C',
    backgroundColor: '#FAF6EC',
    borderWidth: 1.5,
  },
  slotText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  slotTextActive: {
    color: '#A8824B',
    fontWeight: '800',
  },
});
