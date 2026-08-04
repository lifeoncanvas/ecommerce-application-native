import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
// List of supported countries for the dropdown selector
const countries = [
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  { name: 'Ghana', code: '+233', flag: '🇬🇭' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪' },
];

export default function LoginScreen({ route, navigation }) {
  const { login, loginSocial } = useAuth();
  
  // Input fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Loading & error state
  const [loading, setLoading] = useState(null); // 'email', 'google', 'kingschat', or null
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Handle email & password form validation
  const validateForm = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email address is required');
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    return valid;
  };

  const handleEmailLogin = async () => {
    if (!validateForm()) return;
    
    setLoading('email');
    const identifier = email.trim();
    
    try {
      // 1. Authenticate directly with Spring Boot backend
      await login(identifier, password);
    } catch (e) {
      setGeneralError(e.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      // BACKEND CONNECTION POINT
      // In a real flow, you'd fetch Google idToken here via GoogleSignin
      const idToken = 'mock-google-token'; // Replace with real token when Google SDK is added
      await loginSocial('google', idToken);
    } catch (e) {
      setGeneralError('Google login failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleKingsChatLogin = async () => {
    setLoading('kingschat');
    try {
      // BACKEND CONNECTION POINT
      // In a real flow, you'd fetch KingsChat token here
      const accessToken = 'mock-kingschat-token'; // Replace with real token when SDK is added
      await loginSocial('kingschat', accessToken);
    } catch (e) {
      setGeneralError('KingsChat login failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  // (Removed country code dropdown logic as it's no longer needed for email login)

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header Row */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path
                d="M15 19 L8 12 L15 5"
                stroke={colors.navy}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Content Wrapper */}
        <View style={styles.content}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your e-commerce profile</Text>

          {generalError ? <Text style={styles.generalErrorText}>{generalError}</Text> : null}
          {route.params?.verificationSuccess && !generalError ? (
            <Text style={styles.successMessageText}>
              Account verified successfully! Please log in.
            </Text>
          ) : null}
          {route.params?.passwordResetSuccess && !generalError ? (
            <Text style={styles.successMessageText}>
              Password reset successful! Please log in with your new password.
            </Text>
          ) : null}

          {/* Email Address Field */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.emailInputContainer, emailError ? styles.inputError : null]}>
              <TextInput
                style={styles.emailInput}
                placeholder="you@example.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password Field with Inline "Forgot Password?" & Eye Toggle */}
          <View style={styles.inputWrapper}>
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showHideButton}
                activeOpacity={0.7}
              >
                <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Log In Submit Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleEmailLogin}
            disabled={loading !== null}
            activeOpacity={0.8}
          >
            {loading === 'email' ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.loginBtnText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.line} />
          </View>

          {/* Social Logins Actions Stack */}
          <View style={styles.socialButtonsContainer}>
            {/* KingsChat Button */}
            <TouchableOpacity
              style={styles.kingschatButton}
              onPress={handleKingsChatLogin}
              disabled={loading !== null}
              activeOpacity={0.8}
            >
              {loading === 'kingschat' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.socialBtnContent}>
                  {/* Custom KingsChat speech bubble + crown SVG */}
                  <Svg width="20" height="20" viewBox="0 0 100 100" style={styles.socialIcon}>
                    <Path
                      d="M 20,20 H 80 C 85,20 90,25 90,30 V 70 C 90,75 85,80 80,80 H 45 L 25,95 V 80 H 20 C 15,80 10,75 10,70 V 30 C 10,25 15,20 20,20 Z"
                      fill="#FFFFFF"
                    />
                    <Path
                      d="M 35 60 L 30 40 L 42 50 L 50 35 L 58 50 L 70 40 L 65 60 Z"
                      fill="#00A3E0"
                    />
                  </Svg>
                  <Text style={styles.kingschatButtonText}>Continue with KingsChat</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Google Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={loading !== null}
              activeOpacity={0.8}
            >
              {loading === 'google' ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <View style={styles.socialBtnContent}>
                  {/* Google Logo SVG */}
                  <Svg width="18" height="18" viewBox="0 0 48 48" style={styles.socialIcon}>
                    <Path
                      d="M43.61 24.55c0-1.57-.14-3.08-.4-4.55H24v8.63h11.02c-.48 2.54-1.93 4.7-4.09 6.14v5.1h6.63c3.88-3.58 6.05-8.86 6.05-15.32z"
                      fill="#4285F4"
                    />
                    <Path
                      d="M24 44c5.4 0 9.92-1.79 13.24-4.86l-6.63-5.1c-1.84 1.23-4.19 1.96-6.61 1.96-5.08 0-9.39-3.43-10.93-8.05H6.27v5.27C9.57 39.82 16.27 44 24 44z"
                      fill="#34A853"
                    />
                    <Path
                      d="M13.07 27.95a12.02 12.02 0 010-7.9v-5.27H6.27a23.95 23.95 0 000 18.44l6.8-5.27z"
                      fill="#FBBC05"
                    />
                    <Path
                      d="M24 13.9c2.93 0 5.57 1.01 7.64 2.98l5.73-5.73C33.91 8.08 29.39 6 24 6 16.27 6 9.57 10.18 6.27 16.73l6.8 5.27c1.54-4.62 5.85-8.1 10.93-8.1z"
                      fill="#EA4335"
                    />
                  </Svg>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer redirection */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Removed Country Selection Dropdown Modal */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    height: 50,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.navy,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  generalErrorText: {
    ...typography.caption,
    color: colors.error,
    backgroundColor: '#FFEAEA',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  successMessageText: {
    ...typography.caption,
    color: colors.success,
    backgroundColor: '#EAF8F0',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#C7EED8',
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  emailInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  forgotPasswordText: {
    ...typography.caption,
    color: colors.navyLight,
    fontWeight: '600',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  showHideButton: {
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    height: '100%',
  },
  showHideText: {
    ...typography.caption,
    color: colors.navyLight,
    fontWeight: '600',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: 2,
  },
  loginBtn: {
    height: 50,
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginBtnText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  socialButtonsContainer: {
    gap: spacing.md,
  },
  kingschatButton: {
    height: 50,
    backgroundColor: '#00A3E0',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kingschatButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  googleButton: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: {
    ...typography.button,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  socialBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    marginRight: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  signUpLink: {
    ...typography.bodyBold,
    color: colors.navy,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    height: '60%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.navy,
  },
  modalCloseBtn: {
    ...typography.bodyBold,
    color: colors.navyLight,
  },
  modalSearch: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    ...typography.body,
  },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  countryFlagName: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagSymbol: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  countryNameText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
