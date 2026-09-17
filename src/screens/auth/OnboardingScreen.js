import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  Sparkle,
  PaperPlaneTilt,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
  Lock,
  Truck,
  ShoppingBag,
} from 'phosphor-react-native';

// Brand Colors
const BRAND_BLUE = '#032757';
const BRAND_NAVY = '#010E2A';

// 100% Local bundled assets for offline reliability
const SLIDES = [
  {
    id: 'slide-1',
    title: 'Find Your Next\nFavorite Piece',
    description:
      'Explore thousands of handpicked styles across fashion, tech, luxury lifestyle & home.',
    centerImage: require('../../../assets/images/products/fashion/women-reddress.jpg'),
    satellites: [
      {
        image: require('../../../assets/images/products/fashion/women-jeansblue.jpg'),
        x: 24,
        y: 16,
        size: 50,
      },
      {
        image: require('../../../assets/images/products/fashion/men-brownjacket.jpg'),
        x: 226,
        y: 28,
        size: 46,
      },
      {
        image: require('../../../assets/images/products/fashion/men-yellowshirt.jpg'),
        x: 28,
        y: 172,
        size: 44,
      },
      {
        image: require('../../../assets/images/products/fashion/men-whiteshirt.jpg'),
        x: 206,
        y: 170,
        size: 54,
      },
    ],
  },
  {
    id: 'slide-2',
    title: 'Connect With\nTrusted Boutiques',
    description:
      'Shop with confidence from 500+ verified boutique sellers with authentic community reviews.',
    leftCardImage: require('../../../assets/images/vendors/fashionred.jpg'),
    rightCardImage: require('../../../assets/images/vendors/miniso.jpg'),
    collage: [
      {
        image: require('../../../assets/images/vendors/homeworld.jpg'),
        size: 52,
        top: 20,
        left: 20,
      },
      {
        image: require('../../../assets/images/products/beauty/ysl perfume.jpg'),
        size: 46,
        top: 18,
        right: 20,
      },
      {
        image: require('../../../assets/images/products/beauty/blush_heart_1.jpg'),
        size: 44,
        top: 72,
        left: 18,
      },
      {
        image: require('../../../assets/images/products/electronics/headphones.jpg'),
        size: 72,
        top: 64,
        right: 18,
        isCenter: true,
      },
    ],
  },
  {
    id: 'slide-3',
    title: 'From Cart\nto Your Doorstep',
    description:
      'One-tap checkout, encrypted payments, and fast live tracking straight to your door.',
    centerImage: require('../../../assets/images/products/food/groceries.jpg'),
    squircles: [
      // 8 items arranged in a circle radius 92px around center (150, 120)
      { image: require('../../../assets/images/products/electronics/phone.jpg'), x: 224, y: 101 },
      { image: require('../../../assets/images/products/home/night_lamp.jpg'), x: 196, y: 167 },
      { image: require('../../../assets/images/products/food/cake-strawberry.jpg'), x: 131, y: 193 },
      { image: require('../../../assets/images/products/food/croissant.jpg'), x: 66, y: 167 },
      { image: require('../../../assets/images/products/home/mirror.jpg'), x: 38, y: 101 },
      { image: require('../../../assets/images/products/electronics/earbuds.jpg'), x: 66, y: 35 },
      { image: require('../../../assets/images/products/food/pizza.jpg'), x: 131, y: 9 },
      { image: require('../../../assets/images/products/services/carwash.jpg'), x: 196, y: 35 },
    ],
  },
];

export default function OnboardingScreen({ navigation }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const containerWidth = screenWidth > 480 ? 440 : screenWidth;

  const { completeOnboarding } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === SLIDES.length - 1;
  const currentSlide = SLIDES[activeIndex];

  const touchStartX = useRef(0);

  const onTouchStart = (e) => {
    touchStartX.current =
      e.nativeEvent.pageX || e.nativeEvent.touches?.[0]?.pageX || 0;
  };

  const onTouchEnd = (e) => {
    const endX =
      e.nativeEvent.pageX || e.nativeEvent.changedTouches?.[0]?.pageX || 0;
    const diff = touchStartX.current - endX;
    if (diff > 45) {
      if (activeIndex < SLIDES.length - 1) {
        setActiveIndex((prev) => prev + 1);
      }
    } else if (diff < -45) {
      if (activeIndex > 0) {
        setActiveIndex((prev) => prev - 1);
      }
    }
  };

  const goToSlide = (index) => {
    if (index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      goToSlide(activeIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding();
    } catch (e) {
      console.warn('Error completing onboarding:', e);
    }
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Login');
    }
  };

  // ─── Slide 1: Concentric Orbital Satellites & Badges (Clubhouse reference) ───
  const renderSlide1Visual = () => (
    <View style={styles.visualStage}>
      {/* Background Orbital Rings SVG */}
      <Svg style={StyleSheet.absoluteFill} width="300" height="240" viewBox="0 0 300 240">
        <Circle cx="150" cy="120" r="76" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" fill="none" />
        <Circle cx="150" cy="120" r="112" stroke="#E8EDF3" strokeWidth="1" fill="none" />
      </Svg>

      {/* Main Center Portrait with Soft Cream Ring */}
      <View style={styles.s1CenterWrapper}>
        <Image
          source={SLIDES[0].centerImage}
          style={styles.fullCoverImage}
          resizeMode="cover"
        />
      </View>

      {/* 4 Satellite Avatars */}
      {SLIDES[0].satellites.map((sat, i) => (
        <View
          key={i}
          style={[
            styles.s1SatelliteCircle,
            {
              left: sat.x,
              top: sat.y,
              width: sat.size,
              height: sat.size,
              borderRadius: sat.size / 2,
            },
          ]}
        >
          <Image source={sat.image} style={styles.fullCoverImage} resizeMode="cover" />
        </View>
      ))}

      {/* 4 Floating Micro-Badges */}
      {/* Top Blue Badge (PaperPlane) */}
      <View style={[styles.floatingMicroBadge, { top: 12, left: 142, backgroundColor: BRAND_BLUE }]}>
        <PaperPlaneTilt color="#FFFFFF" size={11} weight="fill" />
      </View>

      {/* Mid Left Blue Badge (Heart) */}
      <View style={[styles.floatingMicroBadge, { top: 114, left: 10, backgroundColor: '#2563EB' }]}>
        <Heart color="#FFFFFF" size={10} weight="fill" />
      </View>

      {/* Mid Right Orange Badge (Location) */}
      <View style={[styles.floatingMicroBadge, { top: 118, right: 18, backgroundColor: '#F97316' }]}>
        <MapPin color="#FFFFFF" size={10} weight="fill" />
      </View>

      {/* Bottom Magenta Badge (Sparkle) */}
      <View style={[styles.floatingMicroBadge, { bottom: 12, left: 124, backgroundColor: '#EC4899' }]}>
        <Sparkle color="#FFFFFF" size={11} weight="fill" />
      </View>
    </View>
  );

  // ─── Slide 2: Fanned 3-Card Deck with Multi-Photo Collage (NextCircle reference) ───
  const renderSlide2Visual = () => (
    <View style={styles.visualStage}>
      {/* Back Left Card (Blue tint) */}
      <View style={[styles.s2SideCard, styles.s2LeftCard]}>
        <Image source={SLIDES[1].leftCardImage} style={styles.fullCoverImage} resizeMode="cover" />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(3, 39, 87, 0.20)' }]} />
      </View>

      {/* Back Right Card (Purple / Lavender tint) */}
      <View style={[styles.s2SideCard, styles.s2RightCard]}>
        <Image source={SLIDES[1].rightCardImage} style={styles.fullCoverImage} resizeMode="cover" />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(168, 85, 247, 0.22)' }]} />
      </View>

      {/* Front Center Card with Multi-Photo Collage */}
      <View style={styles.s2MainCard}>
        {/* Modern Warm Gradient Background */}
        <Svg style={StyleSheet.absoluteFill} width="168" height="224">
          <Defs>
            <LinearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FB7185" stopOpacity="0.95" />
              <Stop offset="45%" stopColor="#C084FC" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#818CF8" stopOpacity="0.95" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" rx="24" fill="url(#cardGrad)" />
        </Svg>

        {/* 4 Collage Photo Bubbles */}
        {SLIDES[1].collage.map((item, i) => (
          <View
            key={i}
            style={[
              styles.s2CollageBubble,
              {
                width: item.size,
                height: item.size,
                borderRadius: item.size / 2,
                top: item.top,
                left: item.left,
                right: item.right,
                borderWidth: item.isCenter ? 2.5 : 2,
                borderColor: item.isCenter ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
                zIndex: item.isCenter ? 5 : 2,
              },
            ]}
          >
            <Image source={item.image} style={styles.fullCoverImage} resizeMode="cover" />
          </View>
        ))}

        {/* Bottom Bar inside Card */}
        <View style={styles.s2CardBottomBar}>
          <View>
            <Text style={styles.s2CardTitle}>Licht Stores</Text>
            <Text style={styles.s2CardSub}>Verified Sellers</Text>
          </View>
          <View style={styles.s2CardPill}>
            <Text style={styles.s2CardPillText}>Explore</Text>
          </View>
        </View>
      </View>

      {/* Floating Pushpin (Top-Right) */}
      <View style={styles.s2TopPin}>
        <View style={styles.s2TopPinInner}>
          <PaperPlaneTilt color="#FFFFFF" size={11} weight="fill" />
        </View>
      </View>

      {/* Floating Arrow Pin (Bottom-Center) */}
      <View style={styles.s2BottomPin}>
        <View style={styles.s2BottomPinInner}>
          <Sparkle color="#FFFFFF" size={12} weight="fill" />
        </View>
      </View>
    </View>
  );

  // ─── Slide 3: Circular Orbit Wreath of Squircles (Reference 3) ───
  const renderSlide3Visual = () => (
    <View style={styles.visualStage}>
      {/* Circular Orbit Ring Guide */}
      <Svg style={StyleSheet.absoluteFill} width="300" height="240" viewBox="0 0 300 240">
        <Circle cx="150" cy="120" r="92" stroke="#E2E8F0" strokeWidth="1" fill="none" />
      </Svg>

      {/* Center Showcase Tile */}
      <View style={styles.s3CenterTile}>
        <Image
          source={SLIDES[2].centerImage}
          style={styles.fullCoverImage}
          resizeMode="cover"
        />
        <View style={styles.s3CenterOverlay} />
      </View>

      {/* 8 Satellite Squircles in Orbit */}
      {SLIDES[2].squircles.map((item, i) => (
        <View
          key={i}
          style={[
            styles.s3SquircleTile,
            {
              left: item.x,
              top: item.y,
            },
          ]}
        >
          <Image source={item.image} style={styles.fullCoverImage} resizeMode="cover" />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={[styles.wrapper, { width: containerWidth }]}>
        {/* ─── Top Header: Official Logo Left, Skip Right ─── */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require('../../../assets/images/crown_logo.png')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
            <View style={styles.brandTextCol}>
              <Text style={styles.brandTitle}>LICHT</Text>
              <Text style={styles.brandSubtitle}>MARKETING</Text>
            </View>
          </View>

          {!isLastSlide ? (
            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.6}
              style={styles.skipBtn}
              hitSlop={{ top: 12, bottom: 12, left: 14, right: 14 }}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* ─── Perfectly Centered Middle Section ─── */}
        <View
          style={styles.centerContainer}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Bespoke Visual Layout for current active slide */}
          {activeIndex === 0 && renderSlide1Visual()}
          {activeIndex === 1 && renderSlide2Visual()}
          {activeIndex === 2 && renderSlide3Visual()}

          {/* Clean Typography */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>{currentSlide.title}</Text>
            <Text style={styles.descriptionText}>
              {currentSlide.description}
            </Text>
          </View>
        </View>

        {/* ─── Bottom Actions & Pagination ─── */}
        <View style={styles.bottomBar}>
          {/* Pagination Indicators */}
          <View style={styles.paginationRow}>
            {SLIDES.map((_, i) => {
              const isActive = i === activeIndex;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => goToSlide(i)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                >
                  <View
                    style={[
                      styles.dot,
                      isActive ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Primary CTA Button */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.88}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {isLastSlide ? 'Get Started' : 'Continue'}
            </Text>
            <ArrowRight color="#FFFFFF" size={17} weight="bold" />
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.65}
            style={styles.signInRow}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    overflow: 'hidden',
  },
  wrapper: {
    flex: 1,
    height: '100%',
    maxWidth: 440,
    justifyContent: 'space-between',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    zIndex: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoImage: {
    width: 36,
    height: 28,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: BRAND_NAVY,
    letterSpacing: 1.5,
    lineHeight: 16,
  },
  brandSubtitle: {
    fontSize: 7.5,
    fontFamily: 'Inter-Bold',
    color: '#64748B',
    letterSpacing: 1.2,
    lineHeight: 10,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },

  // ─── Center Section ───
  centerContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  visualStage: {
    width: 300,
    height: 240,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fullCoverImage: {
    width: '100%',
    height: '100%',
  },

  // ─── Slide 1 Visual Styles (Orbit & Satellites) ───
  s1CenterWrapper: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 4,
    borderColor: '#F5EFE6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: '#FFFFFF',
  },
  s1SatelliteCircle: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: '#F5EFE6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  floatingMicroBadge: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },

  // ─── Slide 2 Visual Styles (Fanned 3-Card Deck & Collage) ───
  s2SideCard: {
    position: 'absolute',
    width: 136,
    height: 196,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    backgroundColor: '#F1F5F9',
  },
  s2LeftCard: {
    left: 20,
    top: 22,
    transform: [{ rotate: '-13deg' }],
    opacity: 0.88,
  },
  s2RightCard: {
    right: 20,
    top: 22,
    transform: [{ rotate: '13deg' }],
    opacity: 0.88,
  },
  s2MainCard: {
    width: 166,
    height: 222,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 9,
    zIndex: 8,
  },
  s2CollageBubble: {
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  s2CardBottomBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  s2CardTitle: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 12,
  },
  s2CardSub: {
    fontSize: 7.5,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 10,
  },
  s2CardPill: {
    backgroundColor: BRAND_BLUE,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 8,
  },
  s2CardPillText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  s2TopPin: {
    position: 'absolute',
    top: 10,
    right: 42,
    zIndex: 15,
    borderRadius: 13,
    padding: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  s2TopPinInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BRAND_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  s2BottomPin: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    zIndex: 15,
    borderRadius: 14,
    padding: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  s2BottomPinInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Slide 3 Visual Styles (Circular Squircle Wreath) ───
  s3CenterTile: {
    position: 'absolute',
    left: 109,
    top: 79,
    width: 82,
    height: 82,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
    backgroundColor: '#FFFFFF',
    zIndex: 5,
  },
  s3CenterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  s3SquircleTile: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 11,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: '#F8FAFC',
    zIndex: 4,
  },

  // ─── Typography ───
  textContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  titleText: {
    fontSize: 23,
    lineHeight: 29,
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 290,
  },

  // ─── Bottom Actions ───
  bottomBar: {
    height: 140,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
    height: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 26,
    backgroundColor: BRAND_BLUE,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#E2E8F0',
  },
  primaryButton: {
    width: '90%',
    maxWidth: 340,
    height: 50,
    borderRadius: 25,
    backgroundColor: BRAND_BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: BRAND_BLUE,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  signInRow: {
    marginTop: 10,
    paddingVertical: 4,
  },
  signInText: {
    fontSize: 12.5,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  signInHighlight: {
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
});