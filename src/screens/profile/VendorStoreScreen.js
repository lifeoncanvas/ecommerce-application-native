import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { CaretLeft, Storefront } from 'phosphor-react-native';
import { typography, spacing, radius } from '../../theme';
import ProductCard from '../../components/ProductCard';
import { useTheme } from '../../context/ThemeContext';
import { products as mockProducts, vendors as mockVendors } from '../../data/mockData';
import { getStoreById } from '../../api/stores.api';
import { getStoreProducts } from '../../api/products.api';
import { getVendor, getVendorProducts, getVendorReviews } from '../../api/vendor.api';
import { buildProductRouteParams } from '../../utils/productResolver';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function VendorStoreScreen({ route, navigation }) {
  const { id = 1 } = route?.params || {};
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState('products'); // 'products', 'reviews'
  const [loading, setLoading] = useState(false);

  // States
  const [vendor, setVendor] = useState(mockVendors.find((v) => v.id === id) || mockVendors[0]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Fetch Vendor/Store details, products, and reviews
  const loadStorefront = useCallback(async () => {
    setLoading(true);
    try {
      // Try Store API first for store & products stored in DB
      const storeIdNum = typeof id === 'number' ? id : (parseInt(id.replace(/\D/g, '')) || 1);
      const [storeRes, productsRes] = await withTimeout(
        Promise.all([
          getStoreById(storeIdNum),
          getStoreProducts(storeIdNum),
        ]),
        2500
      );

      if (storeRes.data) setVendor(storeRes.data);
      if (productsRes.data && productsRes.data.length > 0) {
        setProducts(productsRes.data.filter((p) => p.active !== false));
      } else {
        setProducts(mockProducts.filter((p) => (p.vendorId === id || p.storeId === storeIdNum) && p.active !== false));
      }
    } catch (e) {
      console.warn(`GET /api/stores/${id} endpoints failed, using local fallback.`, e.message);
      const matched = mockVendors.find((v) => v.id === id) || mockVendors[0];
      setVendor(matched);
      setProducts(mockProducts.filter((p) => p.vendorId === id && p.active !== false));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStorefront();
  }, [loadStorefront]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color={colors.navy} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{vendor?.name}</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <View style={styles.content}>
          {/* Store Banner Profile */}
          <View style={styles.storeProfile}>
            <View style={styles.logoCircle}>
              {vendor?.logoUrl ? (
                <Image source={{ uri: vendor.logoUrl }} style={styles.storeLogoImg} resizeMode="cover" />
              ) : (vendor?.storePhotos && vendor?.storePhotos.length > 0) ? (
                <Image source={{ uri: vendor.storePhotos[0] }} style={styles.storeLogoImg} resizeMode="cover" />
              ) : (
                <Storefront size={32} color={colors.gold || '#A8824B'} weight="fill" />
              )}
            </View>
            <Text style={styles.storeName}>{vendor?.name}</Text>
            <Text style={styles.storeTag}>Official partner • ⭐ {vendor?.rating || 4.7} rating</Text>
            <Text style={styles.storeDesc}>{vendor?.description || 'Your premier destination for high-quality items.'}</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'products' && styles.tabItemActive]}
              onPress={() => setActiveTab('products')}
            >
              <Text style={[styles.tabLabel, activeTab === 'products' && styles.tabLabelActive]}>
                PRODUCTS ({products.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'reviews' && styles.tabItemActive]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabLabel, activeTab === 'reviews' && styles.tabLabelActive]}>
                FEEDBACK ({reviews.length})
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'products' ? (
            <FlatList
              data={products}
              numColumns={2}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.gridContainer}
              renderItem={({ item }) => (
                <View style={styles.gridItemWrapper}>
                  <ProductCard
                    product={item}
                    onPress={() => navigation.push('ProductDetails', { id: item.id })}
                  />
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyText}>No Products listed yet.</Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{item.userName}</Text>
                    <Text style={styles.reviewDate}>{item.date}</Text>
                  </View>
                  <View style={styles.starsRow}>
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Text key={i} style={styles.star}>★</Text>
                    ))}
                  </View>
                  <Text style={styles.reviewComment}>{item.comment}</Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>💬</Text>
                  <Text style={styles.emptyText}>No Feedback available.</Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  storeProfile: {
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  storeLogoImg: {
    width: '100%',
    height: '100%',
  },
  storeName: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  storeTag: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
    marginTop: 2,
  },
  storeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.gold,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
  gridContainer: {
    padding: spacing.sm,
  },
  gridItemWrapper: {
    width: '50%',
    padding: spacing.xs,
  },
  listContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  reviewDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  star: {
    color: colors.gold,
    fontSize: 12,
  },
  reviewComment: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
});
