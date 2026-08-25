import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  Bell,
  Heart,
  User,
  MagnifyingGlass,
  CaretDown,
  ShoppingBagOpen,
  X,
  Compass,
  MapPin,
  CheckCircle,
} from 'phosphor-react-native';
import { colors as staticColors, typography, spacing, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { useTabBarVisibility } from '../../context/TabBarVisibilityContext';
import { categories as mockCategories, vendors, products as mockProducts } from '../../data/mockData';
import { ALL_FEED_PRODUCTS } from '../../data/mockProductsData';
import {
  getBanners,
  getHomeCategories,
  getFeatured,
  getFlashSale,
  getHomeLatest,
  getHomePopular,
  getHomeRecommended,
} from '../../api/products.api';
import { buildProductRouteParams } from '../../utils/productResolver';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2; // 2-column grid with 16px side margin + 12px gap
const PAGE_SIZE = 6;

// ─── Exact Cropped Static Local Assets ──────────────────────────────────────
const BANNER_IMAGES = [
  require('../../../assets/images/banners/banner1.jpg'), // Omnia A-Fold S1
  require('../../../assets/images/banners/banner2.jpg'), // Fashion Redemption
  require('../../../assets/images/banners/banner3.jpg'), // Akara Fries
];

const CAT_IMAGES = [
  require('../../../assets/images/categories/cat_1.jpg'), // Food
  require('../../../assets/images/categories/cat_2.jpg'), // Fashion
  require('../../../assets/images/categories/cat_3.jpg'), // Groceries
  require('../../../assets/images/categories/cat_4.jpg'), // Services
  require('../../../assets/images/categories/cat_5.jpg'), // More / Beauty
];

const VENDOR_IMGS = [
  require('../../../assets/images/vendors/vendor_1.jpg'), // Omnia
  require('../../../assets/images/vendors/vendor_2.jpg'), // Kalaya Beauty
  require('../../../assets/images/vendors/vendor_3.jpg'), // Sharers
  require('../../../assets/images/vendors/vendor_4.jpg'), // Home world
  require('../../../assets/images/vendors/vendor_5.jpg'), // Miniso
  require('../../../assets/images/vendors/vendor_6.jpg'), // Puredent
  require('../../../assets/images/vendors/vendor_7.jpg'), // Fashion Redemption
  require('../../../assets/images/vendors/vendor_8.jpg'), // Kings Carwash
];

const VENDOR_NAMES = [
  'Omnia',
  'Kalaya Beauty',
  'Sharers',
  'Home world',
  'Miniso',
  'Puredent',
  'Fashion Redemption',
  'Kings Carwash',
];

const fallbackPromoBanners = [
  { id: 1, title: 'Boutique Sale', subtitle: '30% Discount', colors: [staticColors.navyLight, staticColors.navy], promo: 'SPECIAL PROMO' },
  { id: 2, title: 'Smart Living Tech', subtitle: 'Latest Smartphones', colors: [staticColors.gold, staticColors.goldLight], promo: 'UP TO 20% OFF' },
  { id: 3, title: 'Gourmet Dining', subtitle: 'Free Delivery', colors: [staticColors.navy, staticColors.gold], promo: 'JAZARI & MORE' },
];

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Network Timeout')), ms))
  ]);
};

const FILTER_CHIPS = [
  { id: 'gender',   label: 'Gender',      hasArrow: true  },
  { id: 'category', label: 'Category',    hasArrow: true  },
  { id: 'sort',     label: 'Sort',        hasArrow: true  },
  { id: 'under900', label: 'Under 900',   hasArrow: false },
  { id: 'topbrand', label: 'Top Brand',   hasArrow: false },
  { id: 'discount', label: 'Discounted',  hasArrow: false },
];

const SAVED_ADDRESSES = [
  {
    id: 'addr_1',
    name: 'Upasana',
    pincode: '411027',
    tag: 'HOME',
    address: '205, E building, Avenue 66, Pimple nilak',
    display: 'Pimple Nilak · Pune'
  },
  {
    id: 'addr_2',
    name: 'Upasana',
    pincode: '411014',
    tag: 'HOME',
    address: '102,citrine, nyti empire,kharadi',
    display: 'Kharadi · Pune'
  }
];

export default function HomeScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  const { user } = useAuth();
  const { isLiked, toggleWishlist } = useWishlist();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(79200);

  // Banner carousel state
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerListRef = useRef(null);
  const bannerAutoPlayRef = useRef(null);

  // Active filter chip
  const [activeChip, setActiveChip] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  // Asynchronous Product Feed Pagination State
  const [page, setPage] = useState(1);
  const [feedProducts, setFeedProducts] = useState(ALL_FEED_PRODUCTS.slice(0, PAGE_SIZE));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Asynchronously load more products when swiped/scrolled
  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        const nextBatch = ALL_FEED_PRODUCTS.slice(0, nextPage * PAGE_SIZE);
        setFeedProducts(nextBatch);
        if (nextBatch.length >= ALL_FEED_PRODUCTS.length) {
          setHasMore(false);
        }
        return nextPage;
      });
      setIsLoadingMore(false);
    }, 600);
  }, [isLoadingMore, hasMore]);

  const { handleScrollForTabBar } = useTabBarVisibility();

  // Main scroll handler detecting when user swipes/scrolls near bottom
  const handleMainScroll = (event) => {
    handleScrollForTabBar(event);
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 220;
    if (isCloseToBottom && !isLoadingMore && hasMore) {
      loadMoreProducts();
    }
  };

  // Dynamic States initialized with mockData for optimistic UI
  const [banners, setBanners] = useState(fallbackPromoBanners);
  const [homeCategories, setHomeCategories] = useState(mockCategories);
  const [featuredProducts, setFeaturedProducts] = useState(mockProducts.filter((p) => p.tag === 'Featured'));
  const [flashProducts, setFlashProducts] = useState(mockProducts.filter((p) => p.tag === 'Flash Sale'));
  const [serviceProducts] = useState(mockProducts.filter((p) => p.categoryId === 'cat_services'));
  const [latestProducts, setLatestProducts] = useState(mockProducts.filter((p) => p.tag === 'New' || p.categoryId === 'cat_food'));
  const [popularProducts, setPopularProducts] = useState(mockProducts.filter((p) => p.tag === 'Popular' || p.tag === 'Bestseller'));
  const [recProducts, setRecProducts] = useState(mockProducts.filter((p) => p.tag === 'Bestseller' || p.tag === 'Popular').slice(0, 6));

  // Filter modal states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popularity');
  const [selectedTag, setSelectedTag] = useState('All');

  // Address selection states
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Kharadi · Pune');
  const [pincodeInput, setPincodeInput] = useState('411036');
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCheckPincode = () => {
    if (pincodeInput.trim().length === 6) {
      setSelectedLocation(`Pincode: ${pincodeInput} · Pune`);
      setAddressModalVisible(false);
    } else {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode.');
    }
  };

  const handleUseCurrentLocation = () => {
    setSelectedLocation('Aundh · Pune');
    setPincodeInput('411007');
    setAddressModalVisible(false);
  };

  const handleOpenFilter = () => setFilterModalVisible(true);

  const handleApplyFilter = () => {
    setFilterModalVisible(false);
    navigation.navigate('ProductListing', {
      categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
      initialSortOption: selectedSort,
      initialFilterTag: selectedTag,
    });
  };

  const handleResetFilter = () => {
    setSelectedCategory('all');
    setSelectedSort('popularity');
    setSelectedTag('All');
  };

  // Flash countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}h : ${pad(m)}m : ${pad(s)}s`;
  };

  // Banner auto-play every 3 seconds
  const startBannerAutoPlay = useCallback(() => {
    clearInterval(bannerAutoPlayRef.current);
    bannerAutoPlayRef.current = setInterval(() => {
      setActiveBannerIndex((prev) => {
        const next = (prev + 1) % BANNER_IMAGES.length;
        bannerListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
  }, []);

  useEffect(() => {
    startBannerAutoPlay();
    return () => clearInterval(bannerAutoPlayRef.current);
  }, [startBannerAutoPlay]);

  const handleBannerScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== activeBannerIndex) {
      setActiveBannerIndex(idx);
      startBannerAutoPlay();
    }
  };

  // Fetch from Spring Boot endpoints
  const loadHomeData = useCallback(async () => {
    try {
      const [bannersRes, catsRes, featRes, flashRes, latestRes, popularRes, recRes] =
        await withTimeout(
          Promise.all([
            getBanners(), getHomeCategories(), getFeatured(),
            getFlashSale(), getHomeLatest(), getHomePopular(), getHomeRecommended(),
          ]),
          2500
        );
      setBanners(bannersRes.data?.data || bannersRes.data?.items || []);
      setHomeCategories(catsRes.data?.data || catsRes.data?.items || []);
      setFeaturedProducts(featRes.data?.data || featRes.data?.items || []);
      setFlashProducts(flashRes.data?.data || flashRes.data?.items || []);
      setLatestProducts(latestRes.data?.data || latestRes.data?.items || []);
      setPopularProducts(popularRes.data?.data || popularRes.data?.items || []);
      setRecProducts(recRes.data?.data || recRes.data?.items || []);
    } catch (e) {
      console.warn('Home endpoints failed, utilizing unified mockData fallback.', e.message);
      setBanners(fallbackPromoBanners);
      setHomeCategories(mockCategories);
      setFeaturedProducts(mockProducts.filter((p) => p.tag === 'Featured'));
      setFlashProducts(mockProducts.filter((p) => p.tag === 'Flash Sale'));
      setLatestProducts(mockProducts.filter((p) => p.tag === 'New' || p.categoryId === 'cat_food'));
      setPopularProducts(mockProducts.filter((p) => p.tag === 'Popular' || p.tag === 'Bestseller'));
      setRecProducts(mockProducts.filter((p) => p.tag === 'Bestseller' || p.tag === 'Popular').slice(0, 6));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHomeData(); }, [loadHomeData]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setFeedProducts(ALL_FEED_PRODUCTS.slice(0, PAGE_SIZE));
    await loadHomeData();
    setRefreshing(false);
  };

  // ─── Exact Product Card (img 1 Design) ────────────────────────────────────
  const renderExactProductCard = (item, index) => {
    const isSelected = selectedProductIndex === index;
    const liked = isLiked(item.id);

    return (
      <TouchableOpacity
        key={item.id || index}
        style={[styles.gridCard, isSelected && styles.gridCardSelected]}
        onPress={() => {
          setSelectedProductIndex(index);
          navigation.navigate('ProductDetails', buildProductRouteParams(item));
        }}
        activeOpacity={0.9}
      >
        {/* Full-bleed Photo Container */}
        <View style={styles.gridCardPhoto}>
          <Image source={item.image} style={styles.gridCardImg} resizeMode="cover" />

          {/* Heart Outline Button on top right */}
          <TouchableOpacity
            style={styles.gridHeartBtn}
            onPress={() => toggleWishlist(item.id)}
            activeOpacity={0.7}
          >
            <Heart
              size={18}
              color={liked ? '#E53935' : '#222'}
              weight={liked ? 'fill' : 'regular'}
            />
          </TouchableOpacity>


        </View>

        {/* Info Row Below Photo */}
        <View style={styles.gridCardInfo}>
          <View style={styles.cardInfoRow}>
            <Text style={styles.productBrandText} numberOfLines={1}>
              {item.brand}
            </Text>
            <Text style={styles.productPriceText}>
              ₦{item.price}
            </Text>
          </View>
          <View style={styles.cardInfoRow}>
            <Text style={styles.productCategoryText} numberOfLines={1}>
              {item.category}
            </Text>
            <Text style={styles.productDiscountText}>
              {item.discount}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Horizontal Product Card (for Flash / Featured) ───────────────────────
  const renderHorizontalCard = (item, isFlash = false) => {
    const vendor = vendors.find((v) => v.id === item.vendorId);
    const liked = isLiked(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.hCard}
        onPress={() => navigation.navigate('ProductDetails', buildProductRouteParams(item))}
        activeOpacity={0.85}
      >
        <View style={styles.hCardHeader}>
          <View style={styles.ratingBadge}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
          </View>
          <TouchableOpacity style={styles.heartButton} onPress={() => toggleWishlist(item.id)} activeOpacity={0.7}>
            <Heart size={14} color={liked ? colors.error : colors.disabled} weight={liked ? 'fill' : 'regular'} />
          </TouchableOpacity>
        </View>
        <View style={styles.hCardImage}>
          {item.image
            ? <Image source={{ uri: item.image }} style={styles.hCardImg} resizeMode="cover" />
            : <Text style={styles.hCardEmoji}>{item.emoji || '🎁'}</Text>
          }
          {item.oldPrice && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>
                {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>
        <View style={styles.hCardInfo}>
          <Text style={styles.hCardBrand} numberOfLines={1}>{vendor?.name || 'Store'}</Text>
          <Text style={styles.hCardName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₦{Number(item.price).toFixed(0)}</Text>
            {item.oldPrice && <Text style={styles.oldPrice}>₦{Number(item.oldPrice).toFixed(0)}</Text>}
          </View>
          {isFlash && item.claimed && (
            <View style={styles.claimedContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${item.claimed}%` }]} />
              </View>
              <Text style={styles.claimedText}>{item.claimed}% claimed</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navy} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ─── Header: Location + One-line Search Bar with Phosphor Icons ─── */}
      <View style={styles.header}>
        {/* Row 1: Location selector */}
        <TouchableOpacity style={styles.locationRow} activeOpacity={0.8} onPress={() => setAddressModalVisible(true)}>
          <Text style={styles.locationDot}>●</Text>
          <Text style={styles.locationText} numberOfLines={1}>Delivered to <Text style={styles.locationBold}>{selectedLocation}</Text></Text>
          <CaretDown size={11} color={colors.textSecondary} weight="bold" />
        </TouchableOpacity>

        {/* Row 2: Search bar + Bell + Heart + Profile — all in ONE line */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.9}
          >
            <Text style={styles.searchCrown}>👑</Text>
            <Text style={styles.searchPlaceholder}>&quot;Omnia&quot;</Text>
            <MagnifyingGlass size={18} color="#111" weight="regular" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.hdrIconBtn} activeOpacity={0.75}>
            <Bell size={22} color="#111" weight="regular" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.hdrIconBtn} onPress={() => navigation.navigate('Wishlist')} activeOpacity={0.75}>
            <Heart size={22} color="#111" weight="regular" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.hdrIconBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.75}>
            <User size={22} color="#111" weight="regular" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleMainScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.navy]} />}
      >

        {/* ─── Category strip (img2) — horizontal photo tiles ──────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catStrip}
        >
          {homeCategories.slice(0, 5).map((cat, idx) => {
            const img = CAT_IMAGES[idx % CAT_IMAGES.length];
            const labels = ['Food', 'Fashion', 'Groceries', 'Services', 'Beauty'];
            return (
              <TouchableOpacity
                key={cat.id || idx}
                style={styles.catItem}
                onPress={() => navigation.navigate('ProductListing', { categoryId: cat.id })}
                activeOpacity={0.82}
              >
                <View style={styles.catTile}>
                  <Image source={img} style={styles.catTileImg} resizeMode="cover" />
                </View>
                <Text style={styles.catLabel} numberOfLines={1}>{labels[idx] || cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── Banner carousel — exact cropped banners, auto-swiping 3s ── */}
        <View style={styles.bannerWrapper}>
          <FlatList
            ref={bannerListRef}
            data={BANNER_IMAGES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onScroll={handleBannerScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            renderItem={({ item }) => (
              <Image source={item} style={styles.bannerImage} resizeMode="cover" />
            )}
          />
          <View style={styles.bannerDots}>
            {BANNER_IMAGES.map((_, i) => (
              <View key={i} style={[styles.bannerDot, i === activeBannerIndex && styles.bannerDotActive]} />
            ))}
          </View>
        </View>

        {/* ─── Curated Brands — 2-row × 4-col grid ────────────────────── */}
        <View style={styles.sectionContainer}>
          <View style={styles.vendorGrid}>
            {VENDOR_IMGS.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.vendorTile}
                onPress={() => navigation.navigate('ProductListing', { vendorId: vendors[idx]?.id })}
                activeOpacity={0.82}
              >
                <View style={styles.vendorImgWrapper}>
                  <Image source={img} style={styles.vendorTileImg} resizeMode="cover" />
                </View>
                <Text style={styles.vendorTileName} numberOfLines={1}>
                  {VENDOR_NAMES[idx] || vendors[idx]?.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Flash Sale (horizontal scroll) ──────────────────────────── */}
        {flashProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.flashHeaderInner}>
                <Text style={styles.sectionTitle}>Flash Sale</Text>
                <View style={styles.countdownPill}>
                  <Text style={styles.countdownText}>{formatCountdown(timeLeft)}</Text>
                </View>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {flashProducts.map((p) => renderHorizontalCard(p, true))}
            </ScrollView>
          </View>
        )}

        {/* ─── Featured Products ───────────────────────────────────────── */}
        {featuredProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {featuredProducts.map((p) => renderHorizontalCard(p))}
            </ScrollView>
          </View>
        )}

        {/* ─── Services ────────────────────────────────────────────────── */}
        {serviceProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Services</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {serviceProducts.map((p) => renderHorizontalCard(p))}
            </ScrollView>
          </View>
        )}

        {/* ─── Filter chips ─────────────────────────────────────────────── */}
        <View style={styles.chipsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {FILTER_CHIPS.map((chip) => {
              const active = activeChip === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => {
                    setActiveChip(active ? null : chip.id);
                    if (chip.id === 'gender' || chip.id === 'category' || chip.id === 'sort') {
                      handleOpenFilter();
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
                  {chip.hasArrow && (
                    <CaretDown size={11} color={active ? '#fff' : '#444'} weight="bold" style={{ marginLeft: 3 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Exact Product Cards Grid (with Asynchronous Load More) ──── */}
        <View style={styles.productGridSection}>
          <View style={styles.productGrid}>
            {feedProducts.map((p, i) => renderExactProductCard(p, i))}
          </View>

          {/* Asynchronous Loading Indicator on Swipe/Scroll */}
          {isLoadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#1E293B" />
              <Text style={styles.loadingMoreText}>Loading more products...</Text>
            </View>
          )}

          {!hasMore && (
            <View style={styles.endOfFeedContainer}>
              <Text style={styles.endOfFeedText}>• You've reached the end of the collection ({feedProducts.length} products) •</Text>
            </View>
          )}
        </View>

        {/* Extra bottom padding for Tab Bar */}
        <View style={{ height: 68 }} />
      </ScrollView>

      {/* ─── Filter Modal ────────────────────────────────────────────────── */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.filterSectionTitle}>Filter by Category</Text>
              <View style={styles.optionsGrid}>
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'cat_food', label: 'Food & Pantry' },
                  { id: 'cat_fashion', label: 'Fashion & Apparel' },
                  { id: 'cat_electronics', label: 'Electronics & Gadgets' },
                ].map((cat) => {
                  const isSel = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.optionBadge, isSel && styles.optionBadgeActive]}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionText, isSel && styles.optionTextActive]}>{cat.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.filterSectionTitle}>Sort Products By</Text>
              <View style={styles.optionsGrid}>
                {[
                  { id: 'popularity', label: 'Popularity' },
                  { id: 'price_asc', label: 'Price: Low to High' },
                  { id: 'price_desc', label: 'Price: High to Low' },
                ].map((sort) => {
                  const isSel = selectedSort === sort.id;
                  return (
                    <TouchableOpacity
                      key={sort.id}
                      style={[styles.optionBadge, isSel && styles.optionBadgeActive]}
                      onPress={() => setSelectedSort(sort.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionText, isSel && styles.optionTextActive]}>{sort.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.filterSectionTitle}>Product Tags</Text>
              <View style={styles.optionsGrid}>
                {[
                  { id: 'All', label: 'All Products' },
                  { id: 'Bestseller', label: 'Bestsellers' },
                  { id: 'Flash Sale', label: 'Flash Sale' },
                  { id: 'Featured', label: 'Featured' },
                  { id: 'Discounted', label: 'Discounted Only' },
                ].map((tag) => {
                  const isSel = selectedTag === tag.id;
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[styles.optionBadge, isSel && styles.optionBadgeActive]}
                      onPress={() => setSelectedTag(tag.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionText, isSel && styles.optionTextActive]}>{tag.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilter} activeOpacity={0.8}>
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilter} activeOpacity={0.8}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Address Bottom Sheet Modal ─────────────────────────────────────── */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.addressModalOverlay}>
          <View style={styles.addressModalContent}>
            {/* Modal Header */}
            <View style={styles.addressModalHeader}>
              <Text style={styles.addressModalTitle}>Select Delivery Location</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)} style={styles.addressModalCloseBtn}>
                <X size={20} color={colors.textPrimary} weight="bold" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.addressModalScroll} showsVerticalScrollIndicator={false}>
              {searchMode ? (
                <View>
                  {/* Search Input wrapper */}
                  <View style={styles.addressSearchRow}>
                    <TouchableOpacity onPress={() => setSearchMode(false)} style={styles.searchBackBtn}>
                      <Text style={styles.searchBackArrow}>←</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.addressSearchInput}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search neighborhood or city..."
                      placeholderTextColor="#94A3B8"
                      autoFocus
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
                        <X size={16} color="#666" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Suggestions List */}
                  <Text style={styles.savedAddressHeader}>Popular Locations</Text>
                  {[
                    'Koregaon Park · Pune',
                    'Viman Nagar · Pune',
                    'Kalyani Nagar · Pune',
                    'Aundh · Pune',
                    'Baner · Pune',
                    'Hadapsar · Pune',
                    'Kharadi · Pune'
                  ].filter(loc => loc.toLowerCase().includes(searchQuery.toLowerCase()))
                   .map((loc, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setSelectedLocation(loc);
                        setSearchMode(false);
                        setSearchQuery('');
                        setAddressModalVisible(false);
                      }}
                    >
                      <MapPin size={18} color="#64748B" weight="regular" />
                      <Text style={styles.suggestionText}>{loc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View>
                  {/* Pincode Check Row */}
                  <View style={styles.pincodeRow}>
                    <TextInput
                      style={styles.pincodeInput}
                      value={pincodeInput}
                      onChangeText={(txt) => setPincodeInput(txt.replace(/[^0-9]/g, ''))}
                      placeholder="Enter Pincode"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      maxLength={6}
                    />
                    <TouchableOpacity style={styles.checkBtn} onPress={handleCheckPincode}>
                      <Text style={styles.checkBtnText}>Check Pincode</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Location Action Buttons */}
                  <TouchableOpacity
                    style={styles.locationActionItem}
                    onPress={handleUseCurrentLocation}
                  >
                    <Compass size={20} color="#DC2626" weight="regular" />
                    <Text style={styles.locationActionText}>Use my current location</Text>
                    <Text style={styles.arrowIndicator}>›</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.locationActionItem}
                    onPress={() => setSearchMode(true)}
                  >
                    <MapPin size={20} color="#DC2626" weight="regular" />
                    <Text style={styles.locationActionText}>Search location</Text>
                    <Text style={styles.arrowIndicator}>›</Text>
                  </TouchableOpacity>

                  {/* Or Divider */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Saved Addresses Section */}
                  <Text style={styles.savedAddressHeader}>Select Saved Address</Text>
                  {SAVED_ADDRESSES.map((addr) => {
                    const isSelected = selectedLocation === addr.display;
                    return (
                      <TouchableOpacity
                        key={addr.id}
                        style={[styles.addressCard, isSelected && styles.addressCardActive]}
                        onPress={() => {
                          setSelectedLocation(addr.display);
                          setPincodeInput(addr.pincode);
                          setAddressModalVisible(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={styles.addressCardLeft}>
                          <MapPin size={18} color={colors.textSecondary} weight="regular" style={{ marginTop: 2 }} />
                          <View style={styles.addressCardInfo}>
                            <View style={styles.addressTitleRow}>
                              <Text style={styles.addressNameText}>{addr.name}, {addr.pincode}</Text>
                              <View style={styles.addressTag}>
                                <Text style={styles.addressTagText}>{addr.tag}</Text>
                              </View>
                            </View>
                            <Text style={styles.addressDetailText}>{addr.address}</Text>
                          </View>
                        </View>
                        <View style={styles.addressCardRight}>
                          {isSelected ? (
                            <CheckCircle size={20} color={colors.navy} weight="fill" />
                          ) : (
                            <View style={styles.uncheckCircle} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const getStyles = (colors) => StyleSheet.create({
  safeArea:        { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer:{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  scrollContainer: { paddingBottom: 24 },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 10,
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationDot: { fontSize: 8, color: '#333' },
  locationText: {
    fontSize: 12,
    color: '#444',
  },
  locationBold: {
    fontWeight: '700',
    color: '#111',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#222',
    gap: 8,
  },
  searchCrown: { fontSize: 15 },
  searchPlaceholder: {
    fontSize: 13,
    color: '#888',
    flex: 1,
    fontStyle: 'italic',
  },
  hdrIconBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Category strip
  catStrip:  { paddingLeft: 16, paddingRight: 4, paddingVertical: 12 },
  catItem:   { alignItems: 'center', marginRight: 12, width: 68 },
  catTile: {
    width: 68,
    height: 68,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 5,
    backgroundColor: '#F3F4F6',
  },
  catTileImg:  { width: '100%', height: '100%' },
  catLabel: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Banner Carousel
  bannerWrapper: { marginVertical: 4 },
  bannerImage:   { width, height: 235 },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  bannerDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  bannerDotActive: { width: 22, height: 6, borderRadius: 3, backgroundColor: '#1E293B' },

  // Curated Brands 2x4 Grid
  sectionContainer: { marginTop: 12, marginBottom: 8 },
  vendorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    rowGap: 14,
    columnGap: (width - 32 - (4 * 72)) / 3 > 0 ? (width - 32 - (4 * 72)) / 3 : 8,
    justifyContent: 'space-between',
  },
  vendorTile: {
    width: 72,
    alignItems: 'center',
  },
  vendorImgWrapper: {
    width: 66,
    height: 66,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 4,
  },
  vendorTileImg: {
    width: '100%',
    height: '100%',
  },
  vendorTileName: {
    fontSize: 10,
    color: '#222',
    fontWeight: '500',
    textAlign: 'center',
    width: 72,
  },

  // Filter chips
  chipsSection: { marginVertical: 10 },
  chipsRow: { paddingLeft: 16, paddingRight: 8, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  chipActive:     { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  chipText:       { fontSize: 12, color: '#374151', fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF' },

  // ─── Exact Product Cards Grid (img 1 Design) ───────────────────────────────
  productGridSection: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  gridCardSelected: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  gridCardPhoto: {
    width: '100%',
    height: CARD_WIDTH * 1.32, // Perfect portrait aspect ratio matching mockup
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  gridCardImg: {
    width: '100%',
    height: '100%',
  },
  gridHeartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridAddBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 0.8,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gridAddText: {
    color: '#111',
    fontSize: 11,
    fontWeight: '700',
  },
  gridCardInfo: {
    paddingTop: 8,
    paddingHorizontal: 2,
    gap: 3,
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productBrandText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  productPriceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  productCategoryText: {
    fontSize: 11,
    color: '#6B7280',
  },
  productDiscountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E08734',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  endOfFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  endOfFeedText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Horizontal Card Styles
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, color: '#1E293B', fontWeight: '700' },
  flashHeaderInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countdownPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  countdownText: { color: '#FDE047', fontWeight: '700', fontSize: 11 },
  hScroll: { paddingLeft: 16, paddingBottom: 12 },
  hCard: {
    width: 148,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  hCardHeader: {
    position: 'absolute', top: 8, left: 8, right: 8,
    zIndex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, borderWidth: 0.5, borderColor: '#E5E7EB',
  },
  starIcon:   { color: '#F59E0B', fontSize: 9, marginRight: 2 },
  ratingText: { color: '#111', fontWeight: '700', fontSize: 9 },
  heartButton: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#E5E7EB',
  },
  hCardImage: {
    height: 110, backgroundColor: '#F9FAFB',
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  hCardImg: { width: '100%', height: '100%' },
  hCardEmoji:   { fontSize: 38 },
  discountBadge: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  discountBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 8 },
  hCardInfo:  { padding: 8 },
  hCardBrand: { color: '#6B7280', fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
  hCardName:  { color: '#111827', fontSize: 12, fontWeight: '600', marginTop: 2 },
  priceRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  currentPrice: { color: '#1E293B', fontSize: 13, fontWeight: '700' },
  oldPrice:     { color: '#9CA3AF', textDecorationLine: 'line-through', fontSize: 10 },
  claimedContainer: { marginTop: 6 },
  progressBarBg:   { height: 4, backgroundColor: '#E5E7EB', borderRadius: 999, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#F59E0B' },
  claimedText:     { color: '#6B7280', fontSize: 9, marginTop: 2 },

  // Modal
  modalOverlay:   { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#E5E7EB',
  },
  modalTitle:     { fontSize: 18, color: '#111827', fontWeight: '800' },
  modalCloseIcon: { fontSize: 20, color: '#6B7280' },
  modalScroll:    { maxHeight: 400 },
  filterSectionTitle: {
    fontSize: 10, color: '#6B7280',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 14, marginBottom: 8,
  },
  optionsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  optionBadge: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
  },
  optionBadgeActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  optionText:        { color: '#374151', fontSize: 11, fontWeight: '600' },
  optionTextActive:  { color: '#FFFFFF' },
  modalActionsRow: {
    flexDirection: 'row', gap: 12, marginTop: 16,
    borderTopWidth: 1, borderColor: '#E5E7EB', paddingTop: 14,
  },
  resetBtn: {
    flex: 1, height: 44, borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  resetBtnText: { color: '#374151', fontSize: 13, fontWeight: '700' },
  applyBtn: {
    flex: 2, height: 44, backgroundColor: '#1E293B',
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  applyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Address Selector Bottom Sheet Modal
  addressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  addressModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  addressModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  addressModalTitle: {
    ...typography.h3,
    color: colors.navy,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  pincodeRow: {
    flexDirection: 'row',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingLeft: spacing.md,
    height: 48,
    marginBottom: spacing.md,
  },
  pincodeInput: {
    flex: 1,
    height: '100%',
    ...typography.body,
    fontFamily: 'PlusJakartaSans-Medium',
    color: colors.textPrimary,
    outlineStyle: 'none',
  },
  checkBtn: {
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    height: '100%',
  },
  checkBtnText: {
    ...typography.buttonSmall,
    color: colors.gold || '#F6A400',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  locationActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  locationActionText: {
    flex: 1,
    marginLeft: spacing.md,
    ...typography.bodyBold,
    color: '#DC2626', // Bright location action color
    fontFamily: 'PlusJakartaSans-Bold',
  },
  arrowIndicator: {
    fontSize: 18,
    color: '#94A3B8',
    marginRight: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: spacing.md,
    ...typography.overline,
    color: colors.textSecondary,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  savedAddressHeader: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: spacing.md,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: spacing.md,
  },
  addressCardActive: {
    borderColor: colors.navy,
  },
  addressCardLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  addressCardRight: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  addressCardInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressNameText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  addressTag: {
    marginLeft: spacing.sm,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addressTagText: {
    fontSize: 9,
    fontFamily: 'PlusJakartaSans-Bold',
    color: colors.textSecondary,
  },
  addressDetailText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'PlusJakartaSans-Medium',
    lineHeight: 16,
  },
  uncheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  addressSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.lg,
  },
  searchBackBtn: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBackArrow: {
    fontSize: 20,
    color: '#64748B',
  },
  addressSearchInput: {
    flex: 1,
    height: '100%',
    ...typography.body,
    fontFamily: 'PlusJakartaSans-Medium',
    color: colors.textPrimary,
    outlineStyle: 'none',
  },
  searchClearBtn: {
    padding: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  suggestionText: {
    marginLeft: spacing.md,
    ...typography.body,
    fontFamily: 'PlusJakartaSans-Medium',
    color: colors.textPrimary,
  },
});