import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeft, ShoppingBagOpen, CaretRight, Star } from 'phosphor-react-native';
import { typography, spacing, radius } from '../../theme';
import { categories as mockCategories, products as mockProducts, vendors } from '../../data/mockData';
import { getCategories, getCategoryDetails, getCategoryProducts } from '../../api/products.api';
import { CURRENCY } from '../../utils/currency';
import { useTheme } from '../../context/ThemeContext';
import { buildProductRouteParams } from '../../utils/productResolver';
import { useTabBarVisibility } from '../../context/TabBarVisibilityContext';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

// ─── Curated Subcategory Mappings with Real Photos ──────────────────────────
const SUBCAT_IMAGES = {
  cat_food: [
    { id: 'sub_food_1', name: 'Restaurants', image: require('../../../assets/images/products/food/restaurant.jpg') },
    { id: 'sub_food_2', name: 'Fries & Fast Food', image: require('../../../assets/images/products/food/pizza.jpg') },
    { id: 'sub_food_3', name: 'Bakeries & Pastries', image: require('../../../assets/images/products/food/cake-strawberry.jpg') },
    { id: 'sub_food_4', name: 'Healthy Snacks', image: require('../../../assets/images/products/food/croissant.jpg') },
  ],
  cat_fashion: [
    { id: 'sub_fash_1', name: "Women's Wear", image: require('../../../assets/images/products/fashion/women-reddress.jpg') },
    { id: 'sub_fash_2', name: "Men's Wear", image: require('../../../assets/images/products/fashion/men-brownjacket.jpg') },
    { id: 'sub_fash_3', name: 'Kids Dresses', image: require('../../../assets/images/products/fashion/kids-deniem.jpg') },
    { id: 'sub_fash_4', name: 'Summer Blouses', image: require('../../../assets/images/products/fashion/men-yellowshirt.jpg') },
  ],
  cat_electronics: [
    { id: 'sub_elec_1', name: 'Smartphones', image: require('../../../assets/images/products/electronics/phone.jpg') },
    { id: 'sub_elec_2', name: 'Headphones', image: require('../../../assets/images/products/electronics/headphones.jpg') },
    { id: 'sub_elec_3', name: 'Earbuds & TWS', image: require('../../../assets/images/products/electronics/earbuds.jpg') },
    { id: 'sub_elec_4', name: 'Studio Microphones', image: require('../../../assets/images/products/electronics/mic.jpg') },
  ],
  cat_home: [
    { id: 'sub_home_1', name: 'Wall Decor', image: require('../../../assets/images/products/home/mirror.jpg') },
    { id: 'sub_home_2', name: 'Bedside Lamps', image: require('../../../assets/images/products/home/night_lamp.jpg') },
    { id: 'sub_home_3', name: 'Indoor Plants', image: require('../../../assets/images/products/home/plant.jpg') },
    { id: 'sub_home_4', name: 'Living Room', image: require('../../../assets/images/vendors/homeworld.jpg') },
  ],
  cat_beauty: [
    { id: 'sub_beau_1', name: 'Luxury Parfum', image: require('../../../assets/images/products/beauty/ysl perfume.jpg') },
    { id: 'sub_beau_2', name: 'Lipsticks & Tint', image: require('../../../assets/images/products/beauty/lipstick_1.png') },
    { id: 'sub_beau_3', name: 'Blush & Palette', image: require('../../../assets/images/products/beauty/blush_heart_1.jpg') },
    { id: 'sub_beau_4', name: 'Oral Care Gel', image: require('../../../assets/images/products/beauty/oral.jpg') },
  ],
  cat_services: [
    { id: 'sub_serv_1', name: 'Car Detailing', image: require('../../../assets/images/products/services/carwash.jpg') },
    { id: 'sub_serv_2', name: 'Arcade & Bowling', image: require('../../../assets/images/products/services/arcade.jpg') },
    { id: 'sub_serv_3', name: 'Spa & Salon', image: require('../../../assets/images/vendors/kingscar.jpg') },
    { id: 'sub_serv_4', name: 'Carwash Spa', image: require('../../../assets/images/products/services/carwash1.jpg') },
  ],
};

// ─── Category Popular Products Mappings with Real Photos ────────────────────
const POPULAR_CATEGORY_PRODUCTS = {
  cat_food: [
    {
      id: 'pop_food_1',
      vendor: 'BEVERLY MEALS',
      name: 'Fresh Strawberry Cream Cake',
      price: 32.0,
      rating: 4.9,
      image: require('../../../assets/images/products/food/cake-strawberry.jpg'),
    },
    {
      id: 'pop_food_2',
      vendor: 'JAZARI',
      name: 'Loaded Supreme Cheese Pizza',
      price: 22.0,
      rating: 4.8,
      image: require('../../../assets/images/products/food/pizza.jpg'),
    },
  ],
  cat_fashion: [
    {
      id: 'pop_fash_1',
      vendor: 'FASHION REDEMPTION',
      name: "Men's Utility Leather Jacket",
      price: 135.0,
      rating: 4.9,
      image: require('../../../assets/images/products/fashion/men-brownjacket.jpg'),
    },
    {
      id: 'pop_fash_2',
      vendor: 'FASHION REDEMPTION',
      name: "Women's Evening Scarlet Red Dress",
      price: 92.0,
      rating: 4.9,
      image: require('../../../assets/images/products/fashion/women-reddress.jpg'),
    },
  ],
  cat_electronics: [
    {
      id: 'pop_elec_1',
      vendor: 'OMNIA',
      name: 'Omnia Horizon 11" 256GB Tablet',
      price: 640.0,
      rating: 4.9,
      image: require('../../../assets/images/banners/banner_lt.png'),
    },
    {
      id: 'pop_elec_2',
      vendor: 'OMNIA',
      name: 'Omnia Pro Wireless ANC Headphones',
      price: 180.0,
      rating: 4.8,
      image: require('../../../assets/images/banners/banner_hp.png'),
    },
  ],
  cat_home: [
    {
      id: 'pop_home_1',
      vendor: 'HOME WORLD',
      name: 'Nordic Round Brass Wall Mirror',
      price: 65.0,
      rating: 4.8,
      image: require('../../../assets/images/products/home/mirror.jpg'),
    },
    {
      id: 'pop_home_2',
      vendor: 'SMART HOME',
      name: 'Wooden Bedside Ambient Lamp',
      price: 42.0,
      rating: 4.9,
      image: require('../../../assets/images/products/home/night_lamp.jpg'),
    },
  ],
  cat_beauty: [
    {
      id: 'pop_beau_1',
      vendor: 'KALAYA BEAUTY',
      name: 'Imperial Rose Eau De Parfum',
      price: 110.0,
      rating: 4.9,
      image: require('../../../assets/images/products/beauty/ysl perfume.jpg'),
    },
    {
      id: 'pop_beau_2',
      vendor: 'KALAYA BEAUTY',
      name: 'Signature Velvet Matte Lipstick',
      price: 28.0,
      rating: 4.8,
      image: require('../../../assets/images/products/beauty/lipstick_1.png'),
    },
  ],
  cat_services: [
    {
      id: 'pop_serv_1',
      vendor: 'KINGS CARWASH',
      name: 'Premium Car Wash & Ceramic Spa',
      price: 35.0,
      rating: 4.8,
      image: require('../../../assets/images/products/services/carwash.jpg'),
    },
    {
      id: 'pop_serv_2',
      vendor: 'THE PLAY ARENA',
      name: 'Arcade Unlimited Day Pass',
      price: 49.0,
      rating: 4.9,
      image: require('../../../assets/images/products/services/arcade.jpg'),
    },
  ],
};

const CATEGORY_TABS = [
  { id: 'cat_food', name: 'FOOD', title: 'FOOD & DINING' },
  { id: 'cat_fashion', name: 'FASHION', title: 'FASHION & APPAREL' },
  { id: 'cat_electronics', name: 'ELECTRONICS', title: 'ELECTRONICS & GADGETS' },
  { id: 'cat_home', name: 'HOME', title: 'HOME & DECOR' },
  { id: 'cat_beauty', name: 'BEAUTY', title: 'BEAUTY & COSMETICS' },
  { id: 'cat_services', name: 'SERVICES', title: 'SERVICES & LIFESTYLE' },
];

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Network Timeout')), ms))
  ]);
};

export default function CategoriesScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { handleScrollForTabBar } = useTabBarVisibility();
  const [activeCategoryId, setActiveCategoryId] = useState('cat_food');
  const [loading, setLoading] = useState(false);
  const { items: cartItems } = useCart();
  const totalCartCount = cartItems?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0;

  const activeCategory = CATEGORY_TABS.find((c) => c.id === activeCategoryId) || CATEGORY_TABS[0];
  const subcategories = SUBCAT_IMAGES[activeCategoryId] || SUBCAT_IMAGES.cat_food;
  const categoryProducts = mockProducts.filter((p) => p.categoryId === activeCategoryId);
  const popularProducts = categoryProducts.length > 0 ? categoryProducts.slice(0, 6) : (POPULAR_CATEGORY_PRODUCTS[activeCategoryId] || POPULAR_CATEGORY_PRODUCTS.cat_food);


  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* ─── Top Header with Back Button, Centered Gold Crown Logo, and Bag Icon ─── */}
      <View style={styles.topIconRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.iconBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
        >
          <CaretLeft size={24} color="#1E293B" weight="bold" />
        </TouchableOpacity>

        <View style={styles.centerLogoWrapper}>
          <Image
            source={require('../../../assets/images/crown_logo.png')}
            style={styles.centerCrownLogo}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.iconBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <ShoppingBagOpen size={24} color="#1E293B" weight="regular" />
          {totalCartCount > 0 && (
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{totalCartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Category Tabs (Horizontal Text Tabs with Underline Indicator) ─── */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {CATEGORY_TABS.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.tabBtn}
                onPress={() => setActiveCategoryId(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {cat.name}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── Scroll Content ─────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScrollForTabBar}
        scrollEventThrottle={16}
      >
        {/* ─── Subcategories 2x2 Circular Photo Grid (img 2) ───────────── */}
        <View style={styles.subcatGrid}>
          {subcategories.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={styles.subcatCard}
              onPress={() =>
                navigation.navigate('ProductListing', {
                  categoryId: activeCategoryId,
                  subcategoryId: sub.id,
                })
              }
              activeOpacity={0.85}
            >
              <View style={styles.subcatCircle}>
                <Image source={sub.image} style={styles.subcatCircleImg} resizeMode="cover" />
              </View>
              <Text style={styles.subcatName} numberOfLines={1}>
                {sub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── POPULAR IN [CATEGORY] Section (img 2) ───────────────────── */}
        <View style={styles.popularSection}>
          <View style={styles.popularHeaderRow}>
            <Text style={styles.sectionTitle}>
              POPULAR IN {activeCategory.title}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProductListing', { categoryId: activeCategoryId })}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>see all</Text>
            </TouchableOpacity>
          </View>

          {popularProducts.map((prod) => (
            <TouchableOpacity
              key={prod.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetails', buildProductRouteParams(prod))}
              activeOpacity={0.9}
            >
              {/* Product Thumbnail Photo */}
              <View style={styles.prodImageWrapper}>
                <Image source={prod.image} style={styles.prodThumbImg} resizeMode="cover" />
              </View>

              {/* Product Info */}
              <View style={styles.prodDetails}>
                <Text style={styles.prodBrand}>{prod.brand || prod.vendor}</Text>
                <Text style={styles.prodName} numberOfLines={1}>
                  {prod.name || prod.title}
                </Text>
                <View style={styles.priceRatingRow}>
                  <Text style={styles.prodPrice}>
                    {CURRENCY.format(prod.price)}
                  </Text>
                  <View style={styles.ratingBadge}>
                    <Star size={11} color="#F59E0B" weight="fill" style={{ marginRight: 3 }} />
                    <Text style={styles.ratingText}>{prod.rating}</Text>
                  </View>
                </View>
              </View>

              {/* Right Chevron Arrow */}
              <View style={styles.arrowContainer}>
                <CaretRight size={18} color="#94A3B8" weight="bold" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Extra bottom padding for floating bottom tab bar */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white background matching Home page
  },

  // Top icon row (Back, Centered Crown & Bag)
  topIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 4,
  },
  centerLogoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCrownLogo: {
    width: 44,
    height: 32,
  },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main Header Title
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.3,
  },

  // Category Tabs (Horizontal text tabs with underline indicator)
  tabsWrapper: {
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#FAF9F5',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    height: 38,
    alignItems: 'center',
    gap: 18,
  },
  tabBtn: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  tabTextActive: {
    color: '#1E293B',
    fontWeight: '800',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#A8824B', // Warm gold line matching img 2
    borderRadius: 1.5,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },

  // Subcategories 2x2 Grid with large circular photo containers
  subcatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
    marginBottom: 32,
  },
  subcatCard: {
    width: (width - 64) / 2, // 2-col layout
    alignItems: 'center',
  },
  subcatCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3EFE6', // Soft round badge
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  subcatCircleImg: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  subcatName: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Popular in Category Section
  popularSection: {
    marginTop: 4,
  },
  popularHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  seeAllText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Product Horizontal Card Row
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  prodImageWrapper: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  prodThumbImg: {
    width: '100%',
    height: '100%',
  },
  prodDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  prodBrand: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  prodName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  priceRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  prodPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  arrowContainer: {
    paddingLeft: 8,
  },
  cartCountBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
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
});
