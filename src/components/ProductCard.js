import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { typography, radius, spacing } from '../theme';
import { vendors } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

export default function ProductCard({ product, onPress }) {
  const vendor = vendors.find((v) => v.id === product.vendorId);
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Top Section: Visual */}
      <View style={styles.imageContainer}>
        {product.tag && (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{product.tag.toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.emojiText}>{product.emoji || '🎁'}</Text>
      </View>

      {/* Bottom Section: Details */}
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
          {vendor?.name || 'Brand'}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
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
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: spacing.sm,
  },
  imageContainer: {
    height: 120,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tagBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.navy,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '700',
  },
  emojiText: {
    fontSize: 42,
  },
  info: {
    padding: spacing.sm,
  },
  brand: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  star: {
    color: colors.gold,
    fontSize: 11,
    marginRight: 2,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  price: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
  },
  oldPrice: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    fontSize: 10,
  },
  discount: {
    ...typography.caption,
    color: colors.error,
    fontSize: 9,
    fontWeight: '700',
  },
});
