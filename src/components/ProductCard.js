import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { radius } from '../theme';
import { vendors } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

export default function ProductCard({ product, onPress }) {
  const vendor = vendors.find((v) => v.id === product.vendorId);
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Badge configuration based on product tag
  const getBadgeConfig = () => {
    if (!product.tag) return null;
    const tagLower = product.tag.toLowerCase();
    if (tagLower === 'new') {
      return { backgroundColor: colors.blue500Alt || '#2952CC', text: 'NEW' };
    } else if (tagLower === 'sale' || tagLower === 'flash sale') {
      return { backgroundColor: colors.gold400 || '#F6A400', text: 'SALE' };
    } else if (tagLower === 'sold out' || product.stock === 0) {
      return { backgroundColor: colors.grey400 || '#9CA3AF', text: 'SOLD OUT' };
    }
    // Default fallback badge
    return { backgroundColor: colors.blue500Alt || '#2952CC', text: product.tag.toUpperCase() };
  };

  const badge = getBadgeConfig();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Top Section: Visual */}
      <View style={styles.imageContainer}>
        {badge && (
          <View style={[styles.tagBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={styles.tagText}>{badge.text}</Text>
          </View>
        )}
        <Text style={styles.emojiText}>{product.emoji || '🎁'}</Text>
      </View>

      {/* Bottom Section: Details */}
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
          {vendor?.name || 'Brand'}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>{product.rating || '4.5'}</Text>
        </View>

        {/* Prices */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.oldPrice && (
            <>
              <Text style={styles.oldPrice}>${product.oldPrice.toFixed(2)}</Text>
              <Text style={styles.discount}>{discount}% Off</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors) => StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.r12, // 12px for product cards
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    // Bounded card shadow spec: 0 2px 8px rgba(0,0,0,0.08)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    height: 120,
    backgroundColor: colors.white, // White background for centered product
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    aspectRatio: 1.3, // Locked aspect ratio
  },
  tagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.r4, // 4px for small badges
  },
  tagText: {
    color: colors.white,
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emojiText: {
    fontSize: 48,
  },
  info: {
    padding: 20, // min 20px padding all sides
  },
  brand: {
    fontSize: 12, // typography.caption is 12px
    fontFamily: 'Inter',
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: 16, // typography.h3 is 16px
    fontFamily: 'Inter',
    color: colors.textPrimary,
    fontWeight: '600',
    lineHeight: 20,
    height: 40, // Height bound for max 2 lines
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  star: {
    color: colors.gold,
    fontSize: 12,
    marginRight: 3,
  },
  ratingText: {
    fontSize: 12, // typography.caption is 12px
    fontFamily: 'Inter',
    color: colors.textSecondary,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  price: {
    fontSize: 18, // typography.pricePrimary is 18px
    fontFamily: 'Inter',
    color: colors.textPrimary,
    fontWeight: '700',
  },
  oldPrice: {
    fontSize: 12, // typography.priceStrike is 12px
    fontFamily: 'Inter',
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: colors.error,
    fontWeight: '700',
  },
});
