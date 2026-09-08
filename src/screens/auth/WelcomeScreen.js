import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

import { Crown } from 'phosphor-react-native';

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const { continueAsGuest } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand Header */}
        <View style={styles.logoContainer}>
          <Crown color={colors.gold} size={100} weight="fill" />
          <Text style={styles.brandName}>Licht Marketing</Text>
          <Text style={styles.tagline}>Elevate Your Lifestyle</Text>
        </View>

        {/* Buttons Action Group */}
        <View style={styles.buttonContainer}>
          {/* Login Button - Filled Gold (Premium) */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Register Button - Border Gold */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          {/* Guest Mode Link */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={continueAsGuest}
            activeOpacity={0.7}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  brandName: {
    ...typography.h1,
    color: colors.textInverse,
    marginTop: spacing.md,
    letterSpacing: 4,
    fontWeight: '800',
  },
  tagline: {
    ...typography.body,
    color: colors.goldLight,
    marginTop: spacing.xs,
    letterSpacing: 1.5,
    fontSize: 14,
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonText: {
    ...typography.button,
    color: colors.navy,
    fontWeight: '700',
  },
  registerButton: {
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  registerButtonText: {
    ...typography.button,
    color: colors.gold,
    fontWeight: '600',
  },
  guestButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  guestButtonText: {
    ...typography.body,
    color: colors.textInverse,
    opacity: 0.8,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
