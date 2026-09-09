import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

// Exact Logo Dark Navy background fill
const BG_COLOR    = '#112347';
const ACCENT_GOLD = '#F6A400';

export default function SplashScreen() {
  const logoScale    = useRef(new Animated.Value(0.85)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.style.backgroundColor = BG_COLOR;
    }
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

      {/* Full logo artwork (Mark + Text artwork) */}
      <View style={styles.centerBlock}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }], alignItems: 'center' }}>
          <Image
            source={require('../../../assets/images/splash_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Bottom loader */}
      <Animated.View style={[styles.loaderContainer, { opacity: loaderOpacity }]}>
        <ActivityIndicator size="small" color={ACCENT_GOLD} />
        <Text style={styles.versionText}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoImage: {
    width: width * 0.88,
    height: width * 0.55,
    maxWidth: 400,
    maxHeight: 260,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    gap: 8,
  },
  versionText: {
    fontSize: 11,
    color: ACCENT_GOLD,
    fontWeight: '600',
    opacity: 0.9,
    letterSpacing: 1,
  },
});