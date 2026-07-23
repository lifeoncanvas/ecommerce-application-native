import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const { completeOnboarding } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Curated Collection',
      description: 'Explore the finest selected products from global brands, tailored exclusively to your taste.',
      illustration: (
        <Svg width="200" height="200" viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.goldLight} />
              <Stop offset="100%" stopColor={colors.gold} />
            </LinearGradient>
          </Defs>
          <Circle cx="100" cy="100" r="80" fill={colors.surface} />
          {/* Stylized geometric shopping bag */}
          <Path d="M70 75 H130 L122 135 H78 Z" fill="url(#grad1)" />
          <Path
            d="M85 75 C85 55, 115 55, 115 75"
            fill="none"
            stroke={colors.navy}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Circle cx="100" cy="105" r="10" fill={colors.textInverse} opacity="0.3" />
        </Svg>
      ),
    },
    {
      id: 2,
      title: 'Express Delivery',
      description: 'Fast, secure and tracked delivery services that ensure your premium items reach you on time.',
      illustration: (
        <Svg width="200" height="200" viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.navyLight} />
              <Stop offset="100%" stopColor={colors.navy} />
            </LinearGradient>
          </Defs>
          <Circle cx="100" cy="100" r="80" fill={colors.surface} />
          {/* Stylized premium shipping box/truck */}
          <Path d="M55 75 H125 V115 H55 Z" fill="url(#grad2)" />
          <Path d="M125 85 L150 98 V115 H125 Z" fill={colors.gold} />
          <Circle cx="75" cy="122" r="10" fill={colors.textPrimary} />
          <Circle cx="130" cy="122" r="10" fill={colors.textPrimary} />
        </Svg>
      ),
    },
    {
      id: 3,
      title: 'Seamless Payments',
      description: 'Multiple fully secure payment interfaces supporting international cards, Paypal, and escrow.',
      illustration: (
        <Svg width="200" height="200" viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.goldLight} />
              <Stop offset="100%" stopColor={colors.navy} />
            </LinearGradient>
          </Defs>
          <Circle cx="100" cy="100" r="80" fill={colors.surface} />
          {/* Stylized credit card and shield */}
          <Rect x="60" y="78" width="80" height="48" rx="6" fill="url(#grad3)" />
          <Rect x="70" y="86" width="16" height="12" rx="2" fill={colors.gold} />
          <Path d="M102 62 L116 68 V76 L102 83 L88 76 V68 Z" fill={colors.goldLight} opacity="0.9" />
        </Svg>
      ),
    },
  ];

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      setActiveIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await completeOnboarding();
    navigation.replace('Welcome');
  };

  const slide = slides[activeIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Row with Skip Button */}
      <View style={styles.header}>
        {activeIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      {/* Main Slide Content */}
      <View style={styles.content}>
        <View style={styles.illustrationWrapper}>{slide.illustration}</View>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDescription}>{slide.description}</Text>
      </View>

      {/* Footer Elements: Dots and Action Button */}
      <View style={styles.footer}>
        {/* Slide Indicator Dots */}
        <View style={styles.indicatorRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={[
            styles.button,
            activeIndex === slides.length - 1 ? styles.buttonGold : styles.buttonNavy,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              activeIndex === slides.length - 1 ? styles.buttonTextDark : styles.buttonTextLight,
            ]}
          >
            {activeIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
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
  header: {
    height: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustrationWrapper: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    ...typography.h2,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.gold,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: colors.disabled,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonNavy: {
    backgroundColor: colors.navy,
  },
  buttonGold: {
    backgroundColor: colors.gold,
  },
  buttonText: {
    ...typography.button,
  },
  buttonTextLight: {
    color: colors.textInverse,
  },
  buttonTextDark: {
    color: colors.textPrimary,
  },
});
