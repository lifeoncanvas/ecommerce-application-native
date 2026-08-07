import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, FlatList, Image, Platform } from 'react-native';
import { colors, spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, ShieldCheck, Sparkle, Storefront, Star, Chats, Lock, CreditCard, Truck, Package, ShoppingBag, Flame, MapPin, Heart } from 'phosphor-react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH, 400);
// Illustration area now spans almost the full container width so badge
// cards can spread toward the edges the way they do in the reference design.
const ILLUSTRATION_WIDTH = CONTAINER_WIDTH - 40;

const slides = [
  {
    id: 1,
    title: 'Find Your Next Favorite',
    description: 'Explore thousands of products across fashion, electronics, beauty, home & more.',
    type: 'find',
    underlineColor: colors.gold || '#F6A400',
  },
  {
    id: 2,
    title: 'Trusted Stores, Happy You',
    description: 'Shop from verified sellers, read real reviews, and find stores you can trust.',
    type: 'stores',
    underlineColor: '#8B93FC',
  },
  {
    id: 3,
    title: 'From Cart to Your Doorstep',
    description: 'Quick checkout, secure payments, and fast delivery—straight to you.',
    type: 'delivery',
    underlineColor: colors.navy || '#1A2C5B',
  }
];

// Curated model portraits & item assets
const MODELS = {
  asianWoman: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=80',
  blackMan: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80',
  deliveryWoman: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80',
};

const ITEMS = {
  handbag: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
  lipstick: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=150&q=80',
  vase: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=150&q=80',
};

const AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
];

export default function OnboardingScreen({ navigation }) {
  const { completeOnboarding } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await completeOnboarding();
    navigation.replace('Login');
  };

  const onScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / CONTAINER_WIDTH);
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  const getTopBgColor = () => {
    if (activeIndex === 0) return '#FFFCEB'; // Cream Yellow
    if (activeIndex === 1) return '#EEF0FF'; // Lavender Blue
    return '#1A2C5B'; // Dark Royal Navy Blue
  };

  const renderAvatarStack = () => {
    return (
      <View style={styles.avatarStack}>
        {AVATARS.map((url, index) => (
          <Image
            key={index}
            source={{ uri: url }}
            style={[styles.stackAvatar, { left: index * 14, zIndex: 3 - index }]}
          />
        ))}
      </View>
    );
  };

  // Visual 1: Find Your Next Favorite (Asian Woman + Badges + Blended Background Swirl)
  const renderSlideOneVisual = () => {
    return (
      <View style={styles.illustrationWrapper}>
        {/* Blended Background Swirl Pattern */}
        <View style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%" viewBox="0 0 200 200">
            <Path
              d="M 20 60 C 80 20, 160 50, 180 120 C 200 180, 110 200, 70 170"
              fill="none"
              stroke="rgba(246, 164, 0, 0.09)"
              strokeWidth="24"
              strokeLinecap="round"
            />
          </Svg>
        </View>

        <View style={styles.modelContainer}>
          <Image source={{ uri: MODELS.asianWoman }} style={styles.modelImage} />
        </View>

        {/* Floating Badges & Products - spread toward the edges */}
        <View style={[styles.floatingBadgeCard, { top: 0, left: 0 }]}>
          <Sparkle color={colors.gold || '#F6A400'} weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>Endless choices</Text>
        </View>

        <View style={[styles.floatingBadgeCard, { top: 15, right: 0 }]}>
          <ShoppingBag color="#FF5A5F" weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>New drops</Text>
        </View>

        <View style={[styles.productSquircle, { top: 80, left: -5 }]}>
          <Image source={{ uri: ITEMS.handbag }} style={styles.productImage} />
        </View>

        <View style={[styles.productSquircle, { top: 85, right: 0 }]}>
          <Image source={{ uri: ITEMS.headphones }} style={styles.productImage} />
        </View>

        <View style={[styles.emojiSquircle, { top: 160, left: 0 }]}>
          <Text style={styles.emojiText}>😍</Text>
        </View>

        <View style={[styles.productSquircle, { top: 155, right: -5 }]}>
          <Image source={{ uri: ITEMS.lipstick }} style={styles.productImage} />
        </View>

        <View style={[styles.floatingBadgeCard, { bottom: 10, left: 0 }]}>
          <Flame color="#FF5A5F" weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>Trending now</Text>
        </View>

        <View style={[styles.floatingBadgeCard, { bottom: 5, right: 0 }]}>
          <Heart color="#E04D9C" weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>You'll love this</Text>
        </View>
      </View>
    );
  };

  // Visual 2: Trusted Stores (Black Man + Reviews + Blended Circles)
  const renderSlideTwoVisual = () => {
    return (
      <View style={styles.illustrationWrapper}>
        {/* Blended Background Circular Blobs */}
        <View style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%">
            <Circle cx="40" cy="80" r="50" fill="rgba(139, 147, 252, 0.08)" />
            <Circle cx="180" cy="140" r="60" fill="rgba(139, 147, 252, 0.08)" />
          </Svg>
        </View>

        <View style={styles.modelContainer}>
          <Image source={{ uri: MODELS.blackMan }} style={styles.modelImage} />
        </View>

        {/* Floating Badges & Store/Review Cards */}
        <View style={[styles.floatingBadgeCard, { top: 0, left: 0 }]}>
          <Storefront color="#4C53A5" weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>500+ Stores</Text>
        </View>

        <View style={[styles.floatingBadgeCard, { top: 10, right: 0 }]}>
          <Star color="#F6A400" weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>Top rated sellers</Text>
        </View>

        {/* Urban Nomad Store Card */}
        <View style={[styles.storeFloatingCard, { top: 70, left: -10 }]}>
          <View style={styles.storeHeader}>
            <Text style={styles.storeName}>Urban Nomad</Text>
            <ShieldCheck color="#2952CC" weight="fill" size={12} style={{ marginLeft: 3 }} />
          </View>
          <Image source={{ uri: ITEMS.vase }} style={styles.storeImage} />
          <View style={styles.storeStats}>
            <View style={styles.ratingRow}>
              <Star color="#F6A400" weight="fill" size={10} />
              <Text style={styles.storeRatingText}>4.8</Text>
            </View>
            <View style={styles.storeAvatarsRow}>
              {renderAvatarStack()}
              <Text style={styles.storeAvatarsText}>12K+</Text>
            </View>
          </View>
        </View>

        <View style={[styles.emojiSquircle, { top: 90, right: -5 }]}>
          <Text style={styles.emojiText}>🥳</Text>
        </View>

        <View style={[styles.floatingBadgeCard, { top: 175, right: 0 }]}>
          <ShieldCheck color="#2952CC" weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>Verified sellers</Text>
        </View>

        {/* Real Reviews Card */}
        <View style={[styles.reviewsFloatingCard, { bottom: 5, left: -5 }]}>
          <View style={styles.reviewsHeader}>
            <Chats color="#2952CC" weight="fill" size={14} style={{ marginRight: 4 }} />
            <Text style={styles.reviewsTitle}>Real reviews</Text>
          </View>
          <View style={styles.reviewsAvatarsRow}>
            {renderAvatarStack()}
            <Text style={styles.reviewsAvatarsText}>10K+</Text>
          </View>
        </View>
      </View>
    );
  };

  // Visual 3: From Cart to Doorstep (delivery + Secure Checkout + Dotted Line)
  const renderSlideThreeVisual = () => {
    const isSmallDevice = SCREEN_HEIGHT < 700;
    const adjustedHeight = isSmallDevice ? 200 : 240;
    const adjustedWidth = isSmallDevice ? 140 : 165;

    return (
      <View style={[styles.illustrationWrapper, isSmallDevice && styles.smallDeviceScale]}>
        {/* Blended Background Map route backdrop */}
        <View style={styles.mapRouteContainer}>
          <Svg width="100%" height="100%" viewBox="0 0 200 200" style={styles.routeSvg}>
            <Path
              d="M 20 180 Q 50 100 100 120 T 180 30"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeDasharray="6,6"
              opacity="0.25"
            />
          </Svg>
          <View style={[styles.routePin, { top: 30, left: 20 }]}>
            <MapPin color="#FFF" weight="fill" size={14} />
          </View>
        </View>

        <View style={[styles.modelContainer, { width: adjustedWidth, height: adjustedHeight }]}>
          <Image source={{ uri: MODELS.deliveryWoman }} style={styles.modelImage} />
        </View>

        {/* Floating Badges */}
        <View style={[styles.floatingBadgeCard, { top: 0, left: 0, backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <Lock color="#1A2C5B" weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>Secure payments</Text>
        </View>

        <View style={[styles.floatingBadgeCard, { top: 15, right: 0, backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <CreditCard color="#1A2C5B" weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>Easy checkout</Text>
        </View>

        <View style={[styles.floatingBadgeCard, { top: 100, right: 0, backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <Truck color="#1A2C5B" weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>Fast delivery</Text>
        </View>

        <View style={[styles.floatingBadgeCard, { bottom: 40, left: 0, backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <Package color="#1A2C5B" weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>Track anytime</Text>
        </View>

        <View style={[styles.floatingBadgeCard, { bottom: 10, right: 0, backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <Sparkle color="#F6A400" weight="fill" size={16} style={styles.badgeIcon} />
          <Text style={styles.badgeCardText}>Hassle-free returns</Text>
        </View>
      </View>
    );
  };

  const renderSlideItem = ({ item }) => {
    return (
      <View style={[styles.slideContainer, { width: CONTAINER_WIDTH }]}>
        {/* Top colored visual section */}
        <View style={[styles.topVisualContainer, { backgroundColor: getTopBgColor() }]}>
          {item.type === 'find' && renderSlideOneVisual()}
          {item.type === 'stores' && renderSlideTwoVisual()}
          {item.type === 'delivery' && renderSlideThreeVisual()}
        </View>

        {/* White bottom details sheet containing text & page indicators */}
        <View style={styles.bottomSheetCard}>
          <View style={styles.textDetailsWrapper}>
            <Text style={styles.slideTitle}>{item.title}</Text>
            {/* Highlights bar under title */}
            <View style={[styles.highlightBar, { backgroundColor: item.underlineColor }]} />
            <Text style={styles.slideDescription}>{item.description}</Text>
          </View>

          {/* Dots Indicator: Only displayed in Slide 1 and Slide 2 */}
          {item.id < 3 ? (
            <View style={styles.dotsFooterContainer}>
              <View style={styles.indicatorRow}>
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === activeIndex
                        ? {
                            width: 16,
                            backgroundColor:
                              activeIndex === 0
                                ? colors.gold || '#F6A400'
                                : '#8B93FC',
                          }
                        : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            /* Slide 3: Replaces page dots entirely with "Continue" capsule button */
            <View style={styles.buttonFooterContainer}>
              <TouchableOpacity
                onPress={handleComplete}
                activeOpacity={0.85}
                style={styles.getStartedButton}
              >
                <Text style={styles.getStartedButtonText}>Continue</Text>
                <ArrowRight color="#FFFFFF" size={18} weight="bold" />
              </TouchableOpacity>
            </View>
          )}

          {/* Back to Login link */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7} style={styles.signInLink}>
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInTextBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getTopBgColor() }]}>
      <View style={styles.innerContainer}>
        {/* Floating Skip button at top right */}
        {activeIndex < slides.length - 1 && (
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlideItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.flatList}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    width: CONTAINER_WIDTH,
    alignSelf: 'center',
  },
  header: {
    height: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 10,
    right: 0,
    zIndex: 100,
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#5C6370',
  },
  flatList: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    height: SCREEN_HEIGHT,
    justifyContent: 'space-between',
  },
  topVisualContainer: {
    height: SCREEN_HEIGHT * 0.54,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  illustrationWrapper: {
    width: ILLUSTRATION_WIDTH,
    height: 290,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  smallDeviceScale: {
    transform: [{ scale: 0.82 }],
  },
  modelContainer: {
    width: 170,
    height: 250,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  modelImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bottomSheetCard: {
    height: SCREEN_HEIGHT * 0.46,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: spacing.lg,
    paddingTop: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
  },
  textDetailsWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  slideTitle: {
    fontSize: 26,
    color: '#010E2A',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  highlightBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 14,
    color: '#5C6370',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  dotsFooterContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginVertical: 12,
  },
  buttonFooterContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginVertical: 12,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A2C5B', // Dark Royal Navy Blue
    height: 52,
    borderRadius: 26,
    width: CONTAINER_WIDTH - 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    gap: 8,
  },
  getStartedButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#E5E7EB',
  },
  signInLink: {
    paddingVertical: spacing.xs,
  },
  signInText: {
    fontSize: 13,
    color: '#5C6370',
    fontFamily: 'Inter-Regular',
  },
  signInTextBold: {
    color: '#1A2C5B',
    fontFamily: 'Inter-Bold',
  },

  // Floating Badge Card Style
  floatingBadgeCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeCardText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#010E2A',
  },

  // Product Squircle Card Style
  productSquircle: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
    padding: 6,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  emojiSquircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emojiText: {
    fontSize: 22,
  },

  // Avatar stack styles
  avatarStack: {
    width: 50,
    height: 20,
    position: 'relative',
  },
  stackAvatar: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
  },

  // Slide 2: Urban Nomad Card
  storeFloatingCard: {
    position: 'absolute',
    width: 124,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  storeName: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#010E2A',
  },
  storeImage: {
    width: '100%',
    height: 62,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 6,
  },
  storeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeRatingText: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    color: '#010E2A',
    marginLeft: 2,
  },
  storeAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeAvatarsText: {
    fontSize: 8,
    fontFamily: 'Inter-SemiBold',
    color: '#5C6370',
    marginLeft: 14,
  },

  // Slide 2: Real Reviews Card
  reviewsFloatingCard: {
    position: 'absolute',
    width: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewsTitle: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    color: '#010E2A',
  },
  reviewsAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  reviewsAvatarsText: {
    fontSize: 8,
    fontFamily: 'Inter-SemiBold',
    color: '#5C6370',
    marginLeft: 12,
  },

  // Slide 3: Map route backdrop
  mapRouteContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  routeSvg: {
    width: '100%',
    height: '100%',
  },
  routePin: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});