import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';
import { categories, products, vendors } from '../../data/mockData';
import { useWishlist } from '../../context/WishlistContext';

const { width } = Dimensions.get('window');

export default function ProductListingScreen({ route, navigation }) {
  const { categoryId, subcategoryId, vendorId } = route?.params || {};
  const { isLiked, toggleWishlist } = useWishlist();

  const [selectedSubCatId, setSelectedSubCatId] = useState(subcategoryId || 'all');
  const [selectedFilterTag, setSelectedFilterTag] = useState('All');
  const [sortOption, setSortOption] = useState('popularity'); // 'popularity', 'price_asc', 'price_desc'

  // Reset subcategory selection when category changes
  useEffect(() => {
    setSelectedSubCatId(subcategoryId || 'all');
  }, [categoryId, subcategoryId]);

  // Determine Title and Sub-filters
  const { title, subFilters, initialProducts } = useMemo(() => {
    let titleName = 'All Products';
    let filters = [];
    let items = products;

    if (categoryId) {
      const cat = categories.find((c) => c.id === categoryId);
      if (cat) {
        titleName = cat.name;
        filters = [{ id: 'all', name: `All ${cat.name.split(' ')[0]}` }, ...cat.subcategories];
        items = products.filter((p) => p.categoryId === categoryId);
      }
    } else if (vendorId) {
      const vend = vendors.find((v) => v.id === vendorId);
      if (vend) {
        titleName = vend.name;
        // Group by category for vendors
        const vendorCats = [...new Set(products.filter((p) => p.vendorId === vendorId).map((p) => p.categoryId))];
        filters = [
          { id: 'all', name: 'All Store Items' },
          ...categories.filter((c) => vendorCats.includes(c.id)).map((c) => ({ id: c.id, name: c.name.split(' ')[0] }))
        ];
        items = products.filter((p) => p.vendorId === vendorId);
      }
    } else {
      // Default show all categories as sub filters
      filters = [{ id: 'all', name: 'All' }, ...categories.map((c) => ({ id: c.id, name: c.name.split(' ')[0] }))];
    }

    return { title: titleName, subFilters: filters, initialProducts: items };
  }, [categoryId, vendorId]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let items = [...initialProducts];

    // Filter by subcategory
    if (selectedSubCatId !== 'all') {
      if (categoryId) {
        items = items.filter((p) => p.subcategoryId === selectedSubCatId);
      } else if (vendorId) {
        items = items.filter((p) => p.categoryId === selectedSubCatId);
      } else {
        items = items.filter((p) => p.categoryId === selectedSubCatId);
      }
    }

    // Filter by quick tag
    if (selectedFilterTag !== 'All') {
      if (selectedFilterTag === 'Bestseller') {
        items = items.filter((p) => p.tag === 'Bestseller');
      } else if (selectedFilterTag === 'Flash Sale') {
        items = items.filter((p) => p.tag === 'Flash Sale');
      } else if (selectedFilterTag === 'Featured') {
        items = items.filter((p) => p.tag === 'Featured');
      } else if (selectedFilterTag === 'Discounted') {
        items = items.filter((p) => p.oldPrice !== undefined);
      }
    }

    // Sort items
    if (sortOption === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    }

    return items;
  }, [initialProducts, selectedSubCatId, selectedFilterTag, sortOption, categoryId, vendorId]);

  const handleSortToggle = () => {
    if (sortOption === 'popularity') setSortOption('price_asc');
    else if (sortOption === 'price_asc') setSortOption('price_desc');
    else if (sortOption === 'price_desc') setSortOption('rating');
    else setSortOption('popularity');
  };

  const renderGridItem = ({ item }) => {
    const vendor = vendors.find((v) => v.id === item.vendorId);
    const liked = isLiked(item.id);
    const discount = item.oldPrice ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) : 0;

    return (
      <View style={styles.gridItem}>
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
          activeOpacity={0.85}
        >
          {/* Card Top: Image area with tag & heart */}
          <View style={styles.imageSection}>
            {item.tag && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>{item.tag.toUpperCase()}</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.heartBtn}
              onPress={() => toggleWishlist(item.id)}
              activeOpacity={0.7}
            >
              <Svg width="16" height="16" viewBox="0 0 24 24">
                <Path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill={liked ? colors.error : colors.disabled}
                />
              </Svg>
            </TouchableOpacity>

            <Text style={styles.cardEmoji}>{item.emoji || '🎁'}</Text>
          </View>

          {/* Card Bottom: Product Info */}
          <View style={styles.infoSection}>
            <Text style={styles.cardBrand}>{vendor?.name || 'Brand'}</Text>
            <Text style={styles.cardName} numberOfLines={2}>
              {item.name}
            </Text>
            
            {/* Rating */}
            <View style={styles.cardRatingRow}>
              <Text style={styles.starText}>★</Text>
              <Text style={styles.ratingValueText}>{item.rating}</Text>
              <Text style={styles.reviewsCountText}>({item.reviewsCount || 20})</Text>
            </View>

            {/* Price Row */}
            <View style={styles.cardPriceRow}>
              <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
              {item.oldPrice && (
                <>
                  <Text style={styles.cardOldPrice}>${item.oldPrice.toFixed(2)}</Text>
                  <Text style={styles.cardDiscount}>{discount}% Off</Text>
                </>
              )}
            </View>

            {/* Special Promo Text */}
            <View style={styles.promoContainer}>
              <Text style={styles.promoText} numberOfLines={1}>
                {discount > 0 ? `Save $${(item.oldPrice - item.price).toFixed(1)} Today!` : 'Free Store Pick-up'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={colors.navy} />
          </Svg>
        </TouchableOpacity>
        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.navSubtitle}>{filteredProducts.length} items found</Text>
        </View>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Search')}>
          <Svg width="20" height="20" viewBox="0 0 24 24">
            <Path
              d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              fill={colors.navy}
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Subcategory Gradient Badges Scroll */}
      {subFilters.length > 1 && (
        <View style={styles.subFiltersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subFiltersContainer}>
            {subFilters.map((filter) => {
              const isSelected = selectedSubCatId === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.subFilterBadge,
                    isSelected ? styles.subFilterBadgeActive : null,
                  ]}
                  onPress={() => setSelectedSubCatId(filter.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.subFilterText, isSelected ? styles.subFilterTextActive : null]}>
                    {filter.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Filter Tabs (Price Drop, Bestsellers, etc) */}
      <View style={styles.quickFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFiltersScroll}>
          {['All', 'Bestseller', 'Flash Sale', 'Featured', 'Discounted'].map((tag) => {
            const isSelected = selectedFilterTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.quickFilterBtn, isSelected ? styles.quickFilterBtnActive : null]}
                onPress={() => setSelectedFilterTag(tag)}
                activeOpacity={0.8}
              >
                {tag === 'Discounted' && <Text style={styles.quickFilterIcon}>🏷️ </Text>}
                {tag === 'Bestseller' && <Text style={styles.quickFilterIcon}>🔥 </Text>}
                {tag === 'Flash Sale' && <Text style={styles.quickFilterIcon}>⚡ </Text>}
                <Text style={[styles.quickFilterText, isSelected ? styles.quickFilterTextActive : null]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Grid View */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items found matching the filters.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.gridContainer}
          renderItem={renderGridItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sticky Bottom Actions Bar */}
      <View style={styles.bottomStickyBar}>
        <TouchableOpacity style={styles.bottomBtn} onPress={handleSortToggle}>
          <Svg width="18" height="18" viewBox="0 0 24 24" style={styles.bottomBtnIcon}>
            <Path d="M9 3L5 7h3v6h2V7h3L9 3zm10 14h-3V11h-2v6h-3l4 4 4-4z" fill={colors.navy} />
          </Svg>
          <Text style={styles.bottomBtnText}>
            Sort By: {sortOption === 'popularity' ? 'Popularity' : sortOption === 'price_asc' ? 'Price: Low' : sortOption === 'price_desc' ? 'Price: High' : 'Rating'}
          </Text>
        </TouchableOpacity>
        <View style={styles.bottomDivider} />
        <TouchableOpacity style={styles.bottomBtn} onPress={() => setSelectedFilterTag('All')}>
          <Svg width="18" height="18" viewBox="0 0 24 24" style={styles.bottomBtnIcon}>
            <Path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill={colors.navy} />
          </Svg>
          <Text style={styles.bottomBtnText}>Reset Filter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navbar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  navBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  navTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '800',
  },
  navSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  subFiltersWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  subFiltersContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  subFilterBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subFilterBadgeActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  subFilterText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  subFilterTextActive: {
    color: '#FFFFFF',
  },
  quickFiltersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  quickFiltersScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  quickFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickFilterBtnActive: {
    backgroundColor: colors.goldLight,
    borderColor: colors.gold,
  },
  quickFilterIcon: {
    fontSize: 12,
  },
  quickFilterText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  quickFilterTextActive: {
    color: colors.navy,
  },
  gridContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: 80, // Space for sticky bottom bar
  },
  gridItem: {
    width: '50%',
    padding: spacing.xs,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  imageSection: {
    height: 140,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.navy,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    zIndex: 1,
  },
  featuredBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  cardEmoji: {
    fontSize: 48,
  },
  infoSection: {
    padding: spacing.sm,
  },
  cardBrand: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  cardName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
    marginTop: 2,
    height: 34,
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starText: {
    color: colors.gold,
    fontSize: 12,
    marginRight: 2,
  },
  ratingValueText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 10,
  },
  reviewsCountText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginLeft: 2,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  cardPrice: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 13,
  },
  cardOldPrice: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    fontSize: 10,
  },
  cardDiscount: {
    ...typography.caption,
    color: colors.error,
    fontSize: 9,
    fontWeight: '700',
  },
  promoContainer: {
    marginTop: 6,
    borderTopWidth: 0.5,
    borderColor: colors.border,
    paddingTop: 4,
  },
  promoText: {
    ...typography.caption,
    color: colors.success,
    fontSize: 9,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 52,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 4,
  },
  bottomBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBtnIcon: {
    marginRight: spacing.xs,
  },
  bottomBtnText: {
    ...typography.caption,
    color: colors.navy,
    fontWeight: '700',
    fontSize: 12,
  },
  bottomDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
});

