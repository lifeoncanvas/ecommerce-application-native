import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { products, vendors } from '../../data/mockData';
import { useCart } from '../../context/CartContext';

export default function ProductDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const { addItem } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [adding, setAdding] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const vendor = vendors.find((v) => v.id === product.vendorId);
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  const handleAddToCart = async () => {
    setAdding(true);
    await addItem(product.id, 1);
    setAdding(false);
    Alert.alert('Success', `${product.name} has been added to your cart!`);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={colors.navy} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Product Details</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setIsLiked(!isLiked)}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={isLiked ? colors.error : colors.disabled}
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Large Image/Emoji visual card */}
        <View style={styles.imageCard}>
          <Text style={styles.imageEmoji}>{product.emoji || '🎁'}</Text>
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Info Block */}
        <View style={styles.info}>
          {/* Brand/Vendor name */}
          <Text style={styles.brandName}>{vendor?.name || 'Curated Brand'}</Text>
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              <Text style={styles.starText}>★</Text>
              <Text style={styles.ratingText}>{product.rating} Rating</Text>
            </View>
            <View style={styles.bullet} />
            <Text style={styles.reviewsText}>{product.reviewsCount || 24} Verified Reviews</Text>
          </View>

          {/* Price details */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.oldPrice && (
              <>
                <Text style={styles.oldPrice}>${product.oldPrice.toFixed(2)}</Text>
                <Text style={styles.savingsText}>Save ${(product.oldPrice - product.price).toFixed(2)}</Text>
              </>
            )}
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.divider} />

          {/* Vendor profile card */}
          <View style={styles.vendorCard}>
            <View style={styles.vendorCircle}>
              <Text style={styles.vendorLogoEmoji}>{vendor?.emoji || '🏬'}</Text>
            </View>
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorHeading}>Sold by</Text>
              <Text style={styles.vendorTitle}>{vendor?.name || 'Local Merchant'}</Text>
              <Text style={styles.vendorSubtitle}>Official Partner • {vendor?.rating || 4.7}★ Rating</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom add to cart action bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceDetailsCol}>
          <Text style={styles.totalPriceLabel}>Total Price</Text>
          <Text style={styles.totalPriceValue}>${product.price.toFixed(2)}</Text>
        </View>
        <View style={styles.btnWrapper}>
          <Button
            title={adding ? 'Adding...' : 'Add to Cart'}
            onPress={handleAddToCart}
            disabled={adding}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  imageCard: {
    height: 280,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  imageEmoji: {
    fontSize: 90,
  },
  discountBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  discountText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  info: {
    padding: spacing.lg,
  },
  brandName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starText: {
    color: colors.gold,
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  reviewsText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  price: {
    ...typography.h1,
    color: colors.navy,
    fontWeight: '800',
  },
  oldPrice: {
    ...typography.body,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  savingsText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  sectionHeading: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vendorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  vendorLogoEmoji: {
    fontSize: 24,
  },
  vendorInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  vendorHeading: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  vendorTitle: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 14,
    marginTop: 1,
  },
  vendorSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  bottomBar: {
    height: 72,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  priceDetailsCol: {
    justifyContent: 'center',
  },
  totalPriceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  totalPriceValue: {
    ...typography.h2,
    color: colors.navy,
    fontWeight: '800',
    marginTop: 2,
  },
  btnWrapper: {
    width: '60%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
