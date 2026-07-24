import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Dimensions } from 'react-native';
import { colors, typography } from '../../theme';
import { Crown } from 'phosphor-react-native';

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
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(sloganOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
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
        {/* Crown Icon */}
        <Crown color={colors.gold} size={110} weight="fill" />

        <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
          KingsShoppers
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
