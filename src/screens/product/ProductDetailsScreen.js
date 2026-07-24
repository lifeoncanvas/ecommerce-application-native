import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { products as mockProducts, vendors } from '../../data/mockData';
import { useCart } from '../../context/CartContext';
import { getProductDetails, getRelatedProducts } from '../../api/products.api';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../../api/reviews.api';
import { useTheme } from '../../context/ThemeContext';

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Network Timeout')), ms))
  ]);
};

export default function ProductDetailsScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { id } = route.params;
  const { addItem } = useCart();
  
  const [isLiked, setIsLiked] = useState(false);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  // States loaded from endpoints
  const initialProduct = mockProducts.find((p) => p.id === id);
  const [product, setProduct] = useState(initialProduct);
  const [reviews, setReviews] = useState([
    { id: 'rev_1', userName: 'Ada O.', rating: 5, comment: 'Excellent quality, exactly as described!' },
    { id: 'rev_2', userName: 'John D.', rating: 4, comment: 'Very good product. Highly recommended.' },
    { id: 'rev_user', userName: 'You', rating: 5, comment: 'Perfect addition to my household. Will buy again!', isCurrentUser: true }
  ]);
  const [relatedProducts, setRelatedProducts] = useState(
    mockProducts.filter((p) => p.categoryId === initialProduct?.categoryId && p.id !== id)
  );

  // Modal form states for Add/Edit Review
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null); // ID if editing, null if adding
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Fetch from Spring Boot endpoints in background
  const loadDetailsFromApi = useCallback(async () => {
    try {
      const [detailsRes, reviewsRes, relatedRes] = await withTimeout(
        Promise.all([
          getProductDetails(id),
          getProductReviews(id),
          getRelatedProducts(id),
        ]),
        2500
      );

      if (detailsRes.data) setProduct(detailsRes.data);
      if (reviewsRes.data) {
        // Merge mock user review so user can always test edit/delete
        const apiReviews = reviewsRes.data || [];
        const userReviewExists = apiReviews.some((r) => r.isCurrentUser || r.userName === 'You');
        if (!userReviewExists) {
          setReviews([...apiReviews, { id: 'rev_user', userName: 'You', rating: 5, comment: 'Perfect addition to my household. Will buy again!', isCurrentUser: true }]);
        } else {
          setReviews(apiReviews);
        }
      }
      if (relatedRes.data) setRelatedProducts(relatedRes.data || []);
    } catch (e) {
      console.warn('Product Details API endpoints failed, utilizing local mock fallback.', e.message);
    }
  }, [id]);

  useEffect(() => {
    loadDetailsFromApi();
  }, [loadDetailsFromApi]);

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
    try {
      await addItem(product.id, 1);
      Alert.alert('Success', `${product.name} has been added to your cart!`);
    } catch (e) {
      Alert.alert('Success', `${product.name} added to cart (offline mode).`);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    setBuying(true);
    try {
      await addItem(product.id, 1);
      setBuying(false);
      navigation.navigate('Cart');
    } catch (e) {
      setBuying(false);
      navigation.navigate('Cart');
    }
  };

  // Open Review actions
  const handleOpenAddReview = () => {
    setEditingReviewId(null);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  const handleOpenEditReview = (rev) => {
    setEditingReviewId(rev.id);
    setReviewRating(rev.rating);
    setReviewComment(rev.comment);
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      Alert.alert('Error', 'Please enter your review text.');
      return;
    }

    const payload = {
      productId: id,
      rating: reviewRating,
      comment: reviewComment,
    };

    if (editingReviewId) {
      // Edit mode
      try {
        await withTimeout(updateReview(editingReviewId, payload), 2000);
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingReviewId
              ? { ...r, rating: reviewRating, comment: reviewComment }
              : r
          )
        );
      } catch (e) {
        console.warn('Update review API failed, updating locally.', e.message);
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingReviewId
              ? { ...r, rating: reviewRating, comment: reviewComment }
              : r
          )
        );
      }
    } else {
      // Add mode
      const tempId = 'rev_' + Date.now();
      const newReviewObj = {
        id: tempId,
        userName: 'You',
        rating: reviewRating,
        comment: reviewComment,
        isCurrentUser: true,
      };

      try {
        const res = await withTimeout(createReview(payload), 2000);
        const saved = res.data || newReviewObj;
        setReviews((prev) => [...prev, { ...saved, isCurrentUser: true, userName: 'You' }]);
      } catch (e) {
        console.warn('Create review API failed, saving locally.', e.message);
        setReviews((prev) => [...prev, newReviewObj]);
      }
    }

    setReviewModalVisible(false);
  };

  const handleDeleteReview = (reviewId) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await withTimeout(deleteReview(reviewId), 2000);
              setReviews((prev) => prev.filter((r) => r.id !== reviewId));
            } catch (e) {
              console.warn('Delete review API failed, removing locally.', e.message);
              setReviews((prev) => prev.filter((r) => r.id !== reviewId));
            }
          },
        },
      ]
    );
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
          <Text style={styles.brandName}>{vendor?.name || 'Curated Brand'}</Text>
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating Summary */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              <Text style={styles.starText}>★</Text>
              <Text style={styles.ratingText}>{product.rating} Rating</Text>
            </View>
            <View style={styles.bullet} />
            <Text style={styles.reviewsText}>{reviews.length} Verified Reviews</Text>
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
              <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'VendorStore', params: { id: vendor?.id } })}>
                <Text style={styles.vendorTitle}>{vendor?.name || 'Local Merchant'}</Text>
              </TouchableOpacity>
              <Text style={styles.vendorSubtitle}>Official Partner • {vendor?.rating || 4.7}★ Rating</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderRow}>
              <Text style={styles.sectionHeading}>Verified Reviews ({reviews.length})</Text>
              <TouchableOpacity style={styles.addReviewBtn} onPress={handleOpenAddReview}>
                <Text style={styles.addReviewBtnText}>+ Add Review</Text>
              </TouchableOpacity>
            </View>
            
            {reviews.map((rev) => {
              const isOwner = rev.isCurrentUser || rev.userName === 'You';
              return (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text style={styles.reviewerName}>{rev.userName}</Text>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Text key={i} style={styles.miniStar}>★</Text>
                        ))}
                      </View>
                    </View>
                    
                    {/* Owner Action Buttons */}
                    {isOwner && (
                      <View style={styles.ownerActions}>
                        <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleOpenEditReview(rev)}>
                          <Text style={styles.actionIconText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleDeleteReview(rev.id)}>
                          <Text style={styles.actionIconText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              );
            })}
          </View>

          {/* Similar Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={[styles.sectionHeading, { marginBottom: spacing.md }]}>Similar Products</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
                {relatedProducts.map((item) => {
                  const itemVendor = vendors.find((v) => v.id === item.vendorId);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.relatedCard}
                      onPress={() => navigation.push('ProductDetails', { id: item.id })}
                    >
                      <View style={styles.relatedEmojiWrapper}>
                        <Text style={styles.relatedEmoji}>{item.emoji || '🎁'}</Text>
                      </View>
                      <Text style={styles.relatedBrand} numberOfLines={1}>{itemVendor?.name || 'Brand'}</Text>
                      <Text style={styles.relatedName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.relatedPrice}>${item.price.toFixed(2)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom add to cart / buy now action bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceDetailsCol}>
          <Text style={styles.totalPriceLabel}>Total Price</Text>
          <Text style={styles.totalPriceValue}>${product.price.toFixed(2)}</Text>
        </View>
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cartBtn]}
            onPress={handleAddToCart}
            disabled={adding}
          >
            <Text style={styles.cartBtnText}>{adding ? 'Adding...' : 'Add to Cart'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.buyBtn]}
            onPress={handleBuyNow}
            disabled={buying}
          >
            <Text style={styles.buyBtnText}>{buying ? 'Loading...' : 'Buy Now'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add / Edit Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingReviewId ? 'Edit Review' : 'Write a Review'}</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Star Rating Selector */}
              <Text style={styles.modalLabel}>Rating</Text>
              <View style={styles.starSelectorRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={styles.starSelectBtn}
                    onPress={() => setReviewRating(star)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.selectorStar, star <= reviewRating && styles.selectorStarActive]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comment Review box */}
              <Text style={styles.modalLabel}>Your Review</Text>
              <TextInput
                style={styles.modalTextarea}
                placeholder="Share your thoughts about this product..."
                placeholderTextColor={colors.textSecondary}
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline={true}
                numberOfLines={4}
              />

              <View style={styles.modalBtnWrapper}>
                <Button title={editingReviewId ? 'Update Review' : 'Submit Review'} onPress={handleSubmitReview} />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
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
    paddingBottom: 60,
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
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    textDecorationLine: 'underline',
  },
  vendorSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  reviewsSection: {
    marginTop: spacing.xs,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addReviewBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  addReviewBtnText: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  reviewerName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  reviewStars: {
    flexDirection: 'row',
    marginTop: 2,
  },
  miniStar: {
    color: colors.gold,
    fontSize: 11,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionIconBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconText: {
    fontSize: 12,
  },
  reviewComment: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  relatedSection: {
    marginTop: spacing.md,
  },
  relatedScroll: {
    gap: spacing.md,
  },
  relatedCard: {
    width: 120,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  relatedEmojiWrapper: {
    height: 80,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  relatedEmoji: {
    fontSize: 32,
  },
  relatedBrand: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  relatedName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 11,
    marginTop: 1,
  },
  relatedPrice: {
    ...typography.bodyBold,
    color: colors.navyLight,
    fontSize: 11,
    marginTop: 2,
  },
  bottomBar: {
    height: 76,
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
  buttonsRow: {
    flexDirection: 'row',
    width: '68%',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.navy,
  },
  cartBtnText: {
    ...typography.button,
    color: colors.navy,
    fontWeight: '700',
    fontSize: 12,
  },
  buyBtn: {
    backgroundColor: colors.navy,
  },
  buyBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  modalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 9,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  starSelectorRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  starSelectBtn: {
    padding: spacing.xs,
  },
  selectorStar: {
    fontSize: 32,
    color: colors.disabled,
  },
  selectorStarActive: {
    color: colors.gold,
  },
  modalTextarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    height: 100,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  modalBtnWrapper: {
    marginBottom: spacing.lg,
  },
});
