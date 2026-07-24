import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors as staticColors, typography, spacing, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { categories as mockCategories, vendors, products as mockProducts } from '../../data/mockData';
import {
  getBanners,
  getHomeCategories,
  getFeatured,
  getFlashSale,
  getHomeLatest,
  getHomePopular,
  getHomeRecommended,
} from '../../api/products.api';

const { width } = Dimensions.get('window');

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

export default function HomeScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  const { user } = useAuth();
  const { isLiked, toggleWishlist } = useWishlist();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(79200); // 22 hours in seconds for flash countdown

  // Dynamic States initialized with mockData for optimistic UI
  const [banners, setBanners] = useState(fallbackPromoBanners);
  const [homeCategories, setHomeCategories] = useState(mockCategories);
  const [featuredProducts, setFeaturedProducts] = useState(mockProducts.filter((p) => p.tag === 'Featured'));
  const [flashProducts, setFlashProducts] = useState(mockProducts.filter((p) => p.tag === 'Flash Sale'));
  const [latestProducts, setLatestProducts] = useState(mockProducts.filter((p) => p.tag === 'New' || p.categoryId === 'cat_food'));
  const [popularProducts, setPopularProducts] = useState(mockProducts.filter((p) => p.tag === 'Popular' || p.tag === 'Bestseller'));
  const [recProducts, setRecProducts] = useState(mockProducts.filter((p) => p.tag === 'Bestseller' || p.tag === 'Popular').slice(0, 4));

  // Flash countdown timer effect
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

  // Fetch from the exact requested Spring Boot endpoints
  const loadHomeData = useCallback(async () => {
    try {
      const [
        bannersRes,
        catsRes,
        featRes,
        flashRes,
        latestRes,
        popularRes,
        recRes,
      ] = await withTimeout(
        Promise.all([
          getBanners(),
          getHomeCategories(),
          getFeatured(),
          getFlashSale(),
          getHomeLatest(),
          getHomePopular(),
          getHomeRecommended(),
        ]),
        2500
      );

      setBanners(bannersRes.data?.items || bannersRes.data || []);
      setHomeCategories(catsRes.data?.items || catsRes.data || []);
      setFeaturedProducts(featRes.data?.items || featRes.data || []);
      setFlashProducts(flashRes.data?.items || flashRes.data || []);
      setLatestProducts(latestRes.data?.items || latestRes.data || []);
      setPopularProducts(popularRes.data?.items || popularRes.data || []);
      setRecProducts(recRes.data?.items || recRes.data || []);
    } catch (e) {
      console.warn('Home endpoints failed, utilizing unified mockData fallback.', e.message);
      
      // Offline fallback mapping
      setBanners(fallbackPromoBanners);
      setHomeCategories(mockCategories);
      setFeaturedProducts(mockProducts.filter((p) => p.tag === 'Featured'));
      setFlashProducts(mockProducts.filter((p) => p.tag === 'Flash Sale'));
      setLatestProducts(mockProducts.filter((p) => p.tag === 'New' || p.categoryId === 'cat_food'));
      setPopularProducts(mockProducts.filter((p) => p.tag === 'Popular' || p.tag === 'Bestseller'));
      setRecProducts(mockProducts.filter((p) => p.tag === 'Bestseller' || p.tag === 'Popular').slice(0, 4));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const renderProductCard = (item, isFlash = false) => {
    const vendor = vendors.find((v) => v.id === item.vendorId);
    const liked = isLiked(item.id);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
        activeOpacity={0.85}
      >
        {/* Rating and Heart Icon */}
        <View style={styles.cardHeader}>
          <View style={styles.ratingBadge}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
          </View>
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => toggleWishlist(item.id)}
            activeOpacity={0.7}
          >
            <Svg width="14" height="14" viewBox="0 0 24 24">
              <Path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={liked ? colors.error : colors.disabled}
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Product image with fallback emoji */}
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageEmoji}>{item.emoji || '🎁'}</Text>
          {item.oldPrice && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>
                {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* Product details */}
        <View style={styles.productInfo}>
          <Text style={styles.productBrand} numberOfLines={1}>
            {vendor?.name || 'Store'}
          </Text>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>${Number(item.price).toFixed(2)}</Text>
            {item.oldPrice && <Text style={styles.oldPrice}>${Number(item.oldPrice).toFixed(2)}</Text>}
          </View>

          {/* Flash Sale progress bar */}
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
      {/* Header & Search */}
      <View style={styles.topContainer}>
        <View style={styles.greetRow}>
          <View>
            <Text style={styles.welcomeText}>Hello,</Text>
            <Text style={styles.userNameText}>{user?.name || 'Guest User'}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.navigate('Cart')}>
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Path
                  d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
                  fill={colors.navy}
                />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.9}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" style={styles.searchIcon}>
              <Path
                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                fill={colors.textSecondary}
              />
            </Svg>
            <Text style={styles.searchPlaceholder}>What are you looking for?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Svg width="18" height="18" viewBox="0 0 24 24">
              <Path
                d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
                fill={colors.navy}
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.navy]} />}
      >
        {/* Banner Slider */}
        {banners.length > 0 && (
          <FlatList
            data={banners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.bannersList}
            renderItem={({ item }) => (
              <View style={styles.bannerContainer}>
                <Svg width={width - spacing.lg * 2} height="150" style={styles.bannerSvg}>
                  <Defs>
                    <LinearGradient id={`bannerGrad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor={item.colors ? item.colors[0] : colors.navyLight} />
                      <Stop offset="100%" stopColor={item.colors ? item.colors[1] : colors.navy} />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" rx={radius.md} fill={`url(#bannerGrad-${item.id})`} />
                </Svg>
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerPromo}>{item.promo || 'HOT DEAL'}</Text>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                  <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                  <TouchableOpacity style={styles.bannerBtn} activeOpacity={0.8}>
                    <Text style={styles.bannerBtnText}>Buy Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {/* Categories Section */}
        {homeCategories.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Category</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {homeCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  onPress={() => navigation.navigate('ProductListing', { categoryId: cat.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryCircle}>
                    <Text style={styles.categoryEmoji}>{cat.icon || '🛍️'}</Text>
                  </View>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {cat.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Curated Brands */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Curated Brands</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandsContainer}
        >
          {vendors.slice(0, 10).map((v) => (
            <TouchableOpacity
              key={v.id}
              style={styles.brandItem}
              onPress={() => navigation.navigate('ProductListing', { vendorId: v.id })}
              activeOpacity={0.7}
            >
              <View style={styles.brandCircle}>
                <Text style={styles.brandLogoEmoji}>{v.emoji}</Text>
              </View>
              <Text style={styles.brandName} numberOfLines={1}>
                {v.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Flash Sale */}
        {flashProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.flashHeader}>
                <Text style={styles.sectionTitle}>Flash Sale</Text>
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>{formatCountdown(timeLeft)}</Text>
                </View>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductsScroll}
            >
              {flashProducts.map((p) => renderProductCard(p, true))}
            </ScrollView>
          </View>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductsScroll}
            >
              {featuredProducts.map((p) => renderProductCard(p))}
            </ScrollView>
          </View>
        )}

        {/* New Arrivals (Latest Products) */}
        {latestProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductsScroll}
            >
              {latestProducts.map((p) => renderProductCard(p))}
            </ScrollView>
          </View>
        )}

        {/* Recently Viewed (Fallback to first 4 popular/latest products) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalProductsScroll}
          >
            {mockProducts.slice(4, 9).map((p) => renderProductCard(p))}
          </ScrollView>
        </View>

        {/* Recommended Products Grid */}
        {recProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recommended For You</Text>
            </View>
            <View style={styles.gridContainer}>
              {recProducts.map((p) => (
                <View key={p.id} style={styles.gridItemWrapper}>
                  {renderProductCard(p)}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  topContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.md,
  },
  greetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  welcomeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 13,
  },
  userNameText: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '800',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchPlaceholder: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingVertical: spacing.lg,
  },
  sectionContainer: {
    marginBottom: spacing.sm,
  },
  bannersList: {
    paddingLeft: spacing.lg,
    marginBottom: spacing.lg,
  },
  bannerContainer: {
    width: width - spacing.lg * 2,
    height: 150,
    marginRight: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  bannerSvg: {
    position: 'absolute',
  },
  bannerOverlay: {
    padding: spacing.lg,
    justifyContent: 'center',
    height: '100%',
  },
  bannerPromo: {
    ...typography.caption,
    color: colors.goldLight,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  bannerTitle: {
    ...typography.h2,
    color: colors.textInverse,
    fontWeight: '800',
  },
  bannerSubtitle: {
    ...typography.body,
    color: colors.textInverse,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.textInverse,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  bannerBtnText: {
    ...typography.caption,
    color: colors.navy,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  seeAllText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingLeft: spacing.lg,
    paddingBottom: spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: 70,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryName: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  brandsContainer: {
    paddingLeft: spacing.lg,
    paddingBottom: spacing.md,
  },
  brandItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 75,
  },
  brandCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  brandLogoEmoji: {
    fontSize: 22,
  },
  brandName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  flashHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  countdownContainer: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  countdownText: {
    ...typography.caption,
    color: colors.goldLight,
    fontWeight: '700',
    fontSize: 11,
  },
  horizontalProductsScroll: {
    paddingLeft: spacing.lg,
    paddingBottom: spacing.lg,
  },
  productCard: {
    width: 155,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginRight: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  starIcon: {
    color: colors.gold,
    fontSize: 10,
    marginRight: 2,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 9,
  },
  heartButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    fontSize: 40,
  },
  discountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  discountBadgeText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 8,
  },
  productInfo: {
    padding: spacing.sm,
  },
  productBrand: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  productName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: spacing.xs,
  },
  currentPrice: {
    ...typography.bodyBold,
    color: colors.navyLight,
    fontSize: 14,
  },
  oldPrice: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    fontSize: 11,
  },
  claimedContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
  },
  claimedText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 2,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  gridItemWrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
});
