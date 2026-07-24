import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import { categories as mockCategories, products as mockProducts, vendors } from '../../data/mockData';
import { getCategories, getCategoryDetails, getCategoryProducts } from '../../api/products.api';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

// Maps frontend category IDs to backend category IDs to fix backend mismatch
const getMappedApiId = (id) => {
  if (id === 'cat_food') return 'cat_fashion';        // Send cat_fashion to get Food details
  if (id === 'cat_fashion') return 'cat_electronics';  // Send cat_electronics to get Fashion details
  if (id === 'cat_electronics') return 'cat_food';     // Send cat_food to get Electronics details
  return id;
};

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Network Timeout')), ms))
  ]);
};

export default function CategoriesScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [activeCategoryId, setActiveCategoryId] = useState('cat_food');
  const [loading, setLoading] = useState(false);
  const [categoriesList, setCategoriesList] = useState(mockCategories);
  const [subcategoriesList, setSubcategoriesList] = useState(mockCategories[0].subcategories);
  const [categoryProducts, setCategoryProducts] = useState(mockProducts.filter((p) => p.categoryId === 'cat_food'));

  // Fetch Category lists from Spring Boot endpoints
  const loadCategories = useCallback(async () => {
    try {
      const res = await withTimeout(getCategories(), 2000);
      const list = res.data?.items || res.data || [];
      if (list.length > 0) {
        setCategoriesList(list);
        if (!activeCategoryId && list[0]?.id) {
          setActiveCategoryId(list[0].id);
        }
      } else {
        throw new Error('Categories list empty');
      }
    } catch (e) {
      console.warn('GET /api/categories failed, using local mock fallback.');
      setCategoriesList(mockCategories);
    }
  }, [activeCategoryId]);

  // Fetch Details & Products for the selected category
  const loadSelectedCategoryDetails = useCallback(async () => {
    if (!activeCategoryId) return;
    setLoading(true);
    try {
      const apiId = getMappedApiId(activeCategoryId);
      const [detailsRes, productsRes] = await withTimeout(
        Promise.all([
          getCategoryDetails(apiId),
          getCategoryProducts(apiId),
        ]),
        2500
      );

      const details = detailsRes.data || {};
      setSubcategoriesList(details.subcategories || []);
      setCategoryProducts(productsRes.data?.items || productsRes.data || []);
    } catch (e) {
      console.warn(`GET /api/categories/${activeCategoryId} endpoints failed, using local mock fallback.`);
      const activeCat = mockCategories.find((c) => c.id === activeCategoryId);
      setSubcategoriesList(activeCat?.subcategories || []);
      setCategoryProducts(mockProducts.filter((p) => p.categoryId === activeCategoryId));
    } finally {
      setLoading(false);
    }
  }, [activeCategoryId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadSelectedCategoryDetails();
  }, [loadSelectedCategoryDetails]);

  const activeCategory = categoriesList.find((c) => c.id === activeCategoryId);

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop by Categories</Text>
      </View>

      {/* Top Category Tabs (Horizontal Scroll) */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {categoriesList.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.tabBtn}
                onPress={() => setActiveCategoryId(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>
                  {cat.name.split(' ')[0]}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.navy} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Category Banner */}
          {activeCategory?.banner && (
            <View style={styles.catBanner}>
              <Text style={styles.catBannerTitle}>{activeCategory.name}</Text>
              <Text style={styles.catBannerSub}>{activeCategory.banner}</Text>
            </View>
          )}

          {/* Subcategories Header */}
          <Text style={styles.sectionTitle}>Subcategories</Text>

          {/* Subcategories Grid */}
          <View style={styles.subcatGrid}>
            {subcategoriesList.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={styles.subcatCard}
                onPress={() =>
                  navigation.navigate('ProductListing', {
                    categoryId: activeCategoryId,
                    subcategoryId: sub.id,
                  })
                }
                activeOpacity={0.8}
              >
                <View style={styles.subcatCircle}>
                  <Text style={styles.subcatIconText}>{sub.icon || '🛍️'}</Text>
                </View>
                <Text style={styles.subcatName} numberOfLines={2}>
                  {sub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Popular Products in this Category */}
          {categoryProducts.length > 0 && (
            <View style={styles.popularSection}>
              <Text style={styles.sectionTitle}>Popular In {activeCategory?.name}</Text>
              {categoryProducts.slice(0, 5).map((prod) => {
                const vendor = vendors.find((v) => v.id === prod.vendorId);
                return (
                  <TouchableOpacity
                    key={prod.id}
                    style={styles.productRow}
                    onPress={() => navigation.navigate('ProductDetails', { id: prod.id })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.prodImagePlaceholder}>
                      <Text style={styles.prodEmoji}>{prod.emoji || '🎁'}</Text>
                    </View>
                    <View style={styles.prodDetails}>
                      <Text style={styles.prodBrand}>{vendor?.name || 'Brand'}</Text>
                      <Text style={styles.prodName} numberOfLines={1}>
                        {prod.name}
                      </Text>
                      <View style={styles.prodRatingRow}>
                        <Text style={styles.starText}>★</Text>
                        <Text style={styles.ratingLabel}>{prod.rating}</Text>
                      </View>
                      <Text style={styles.prodPrice}>${Number(prod.price).toFixed(2)}</Text>
                    </View>
                    <View style={styles.arrowIcon}>
                      <Svg width="18" height="18" viewBox="0 0 24 24">
                        <Path
                          d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                          fill={colors.textSecondary}
                        />
                      </Svg>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeContainer: {
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
  tabsWrapper: {
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  tabsContainer: {
    paddingHorizontal: spacing.md,
    height: 48,
    alignItems: 'center',
  },
  tabBtn: {
    paddingHorizontal: spacing.md,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.navy,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.md,
    right: spacing.md,
    height: 3,
    backgroundColor: colors.gold,
    borderRadius: 1.5,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBanner: {
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  catBannerTitle: {
    ...typography.bodyBold,
    color: colors.textInverse,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  catBannerSub: {
    ...typography.caption,
    color: colors.goldLight,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  subcatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  subcatCard: {
    width: '33.3%',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  subcatCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  subcatIconText: {
    fontSize: 28,
  },
  subcatName: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  popularSection: {
    marginTop: spacing.md,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  prodImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prodEmoji: {
    fontSize: 30,
  },
  prodDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  prodBrand: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  prodName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
    marginTop: 2,
  },
  prodRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  starText: {
    color: colors.gold,
    fontSize: 11,
    marginRight: 2,
  },
  ratingLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  prodPrice: {
    ...typography.bodyBold,
    color: colors.navyLight,
    fontSize: 13,
    marginTop: 2,
  },
  arrowIcon: {
    paddingLeft: spacing.sm,
  },
});
