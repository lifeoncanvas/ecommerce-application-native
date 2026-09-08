import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { radius } from '../theme';
import { vendors } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { buildProductRouteParams } from '../utils/productResolver';

export default function ProductCard({ product, onPress }) {
  const navigation = useNavigation();
  const vendor = vendors.find((v) => v.id === product?.vendorId);
  const discount = product?.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const { colors } = useTheme();
  const { formatPrice } = useCurrency();
  const styles = getStyles(colors);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('ProductDetails', buildProductRouteParams(product));
    }
  };

  // Badge configuration based on product tag
  const getBadgeConfig = () => {
    if (!product?.tag) return null;
    const tagLower = product.tag.toLowerCase();
    if (tagLower === 'new') {
      return { backgroundColor: colors.blue500Alt || '#2952CC', text: 'NEW' };
    } else if (tagLower === 'sale' || tagLower === 'flash sale') {
      return { backgroundColor: colors.gold400 || '#F6A400', text: 'SALE' };
    } else if (tagLower === 'sold out' || product.stock === 0) {
      return { backgroundColor: colors.grey400 || '#9CA3AF', text: 'SOLD OUT' };
    }
    return { backgroundColor: colors.blue500Alt || '#2952CC', text: product.tag.toUpperCase() };
  };

  const badge = getBadgeConfig();

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      {/* Top Section: Visual */}
      <View style={styles.imageContainer}>
        {badge && (
          <View style={[styles.tagBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={styles.tagText}>{badge.text}</Text>
          </View>
        )}
        {product?.image ? (
          typeof product.image === 'number' ? (
            <Image source={product.image} style={styles.cardPhoto} resizeMode="cover" />
          ) : (
            <Image source={{ uri: product.image }} style={styles.cardPhoto} resizeMode="cover" />
          )
        ) : (
          <Text style={styles.emojiText}>{product?.emoji || '🎁'}</Text>
        )}
      </View>

      {/* Bottom Section: Details */}
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
<<<<<<< HEAD
          {product?.brand || vendor?.name || 'Licht Marketing'}
=======
          {product?.brand || vendor?.name || 'LitchMarketing'}
>>>>>>> d23c49f95801b8e92c120c2eaefe59139c2b238a
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product?.name || product?.title || 'Product'}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>{product?.rating || '4.5'}</Text>
        </View>

        {/* Prices */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product?.price ? Number(product.price).toFixed(2) : '999.00')}</Text>
          {product?.oldPrice && (
            <>
              <Text style={styles.oldPrice}>{formatPrice(Number(product.oldPrice).toFixed(2))}</Text>
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
    borderRadius: radius.r12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    height: 140,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.r4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emojiText: {
    fontSize: 48,
  },
  info: {
    padding: 14,
  },
  brand: {
    fontSize: 11.5,
    fontFamily: 'Inter',
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: colors.textPrimary,
    fontWeight: '600',
    lineHeight: 18,
    height: 36,
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
    fontSize: 12,
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
    fontSize: 16,
    fontFamily: 'Inter',
    color: colors.textPrimary,
    fontWeight: '700',
  },
  oldPrice: {
    fontSize: 12,
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
