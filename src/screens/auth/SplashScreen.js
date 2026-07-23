import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography } from '../../theme';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run an entry animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(sloganOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        {/* Custom Premium E-commerce SVG Logo */}
        <Svg width="120" height="120" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="goldGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#C98A00" />
              <Stop offset="100%" stopColor="#F6A400" />
            </LinearGradient>
            <LinearGradient id="goldGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FBC358" />
              <Stop offset="100%" stopColor="#F6A400" />
            </LinearGradient>
          </Defs>
          {/* Shopping Bag Handle */}
          <Path
            d="M35 30 C35 15, 65 15, 65 30"
            fill="none"
            stroke="url(#goldGradLight)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Left Facet of Bag */}
          <Path d="M22 35 L50 35 L50 82 L14 82 Z" fill="url(#goldGradDark)" />
          {/* Right Facet of Bag */}
          <Path d="M50 35 L78 35 L86 82 L50 82 Z" fill="url(#goldGradLight)" />
          {/* Chevron cutout for styling */}
          <Path d="M50 48 L60 62 L40 62 Z" fill={colors.navy} />
        </Svg>

        <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
          HTTN SHOP
        </Animated.Text>
        <Animated.Text style={[styles.slogan, { opacity: sloganOpacity }]}>
          Premium Shopping Experience
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.loaderContainer, { opacity: loaderOpacity }]}>
        <ActivityIndicator size="small" color={colors.gold} style={styles.spinner} />
        <Text style={styles.footerText}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textInverse,
    marginTop: 20,
    letterSpacing: 4,
    fontWeight: '800',
  },
  slogan: {
    ...typography.caption,
    color: colors.goldLight,
    marginTop: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 10,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
  },
});
