import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Exact background color of the logo file — used as a fallback fill
// so there's no flash of a different color before the image loads.
const NAVY_EDGE = '#06132F';
const GOLD       = '#C9A84C';

export default function SplashScreen() {
  const logoScale    = useRef(new Animated.Value(0.85)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(logoScale,   { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
      Animated.timing(loaderOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>

      {/* Full-bleed background — the same navy gradient + grain texture
          from the logo artwork, elongated to cover the whole screen so
          the logo sits inside a continuation of its own background
          rather than a separately-rendered gradient. */}
      <Image
        source={require('../../../assets/images/splash-bg.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Full logo artwork (crown + wordmark + tagline baked in) */}
      <View style={styles.centerBlock}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Image
            source={require('../../../assets/images/logo-full.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Bottom loader */}
      <Animated.View style={[styles.loaderContainer, { opacity: loaderOpacity }]}>
        <ActivityIndicator size="small" color={GOLD} />
        <Text style={styles.versionText}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY_EDGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoImage: {
    // Logo file is a large square (1254x1254) containing crown + wordmark + tagline.
    // Sized wide enough to read the wordmark clearly without dominating the screen.
    width: width * 0.72,
    height: width * 0.72,
    maxWidth: 340,
    maxHeight: 340,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    gap: 8,
  },
  versionText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: GOLD,
    opacity: 0.4,
    letterSpacing: 1,
  },
});