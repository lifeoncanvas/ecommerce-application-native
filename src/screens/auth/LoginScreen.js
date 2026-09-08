import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'phosphor-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH, 400);

export default function LoginScreen({ route, navigation }) {
  const { login, loginSocial, continueAsGuest } = useAuth();
  
  // Input fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Loading & error state
  const [loading, setLoading] = useState(null); // 'email', 'google', 'kingschat', or null
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Seller Action Modal state
  const [sellerModalVisible, setSellerModalVisible] = useState(false);

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
      await login(identifier, password);
      // Navigation is handled automatically by RootNavigator
      // when user state changes after login
    } catch (e) {
      setGeneralError(e.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      const idToken = 'mock-google-token';
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
      const accessToken = 'mock-kingschat-token';
      await loginSocial('kingschat', accessToken);
    } catch (e) {
      setGeneralError('KingsChat login failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Cream Header Block */}
          <View style={styles.headerBlock}>
            {/* Skip Text Button */}
            <TouchableOpacity
              onPress={continueAsGuest}
              activeOpacity={0.7}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Custom Premium Gold Crown SVG */}
            <View style={styles.crownWrapper}>
              <Image
                source={require('../../../assets/images/logo.png')}
                style={{ width: 110, height: 70, resizeMode: 'contain' }}
              />
            </View>

            {/* Serif Styled Header */}
            <Text style={styles.headerTitle}>Sign In</Text>
          </View>

          {/* White Bottom Sheet Form Card */}
          <View style={styles.formCard}>
            {generalError ? <Text style={styles.generalErrorText}>{generalError}</Text> : null}
            {route.params?.verificationSuccess && !generalError ? (
              <Text style={styles.successMessageText}>
                Account verified successfully! Please log in.
              </Text>
            ) : null}
            {route.params?.passwordResetSuccess && !generalError ? (
              <Text style={styles.successMessageText}>
                Password reset successful! Please log in.
              </Text>
            ) : null}

            {/* Google Social Login Capsule */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              disabled={loading !== null}
              activeOpacity={0.8}
            >
              {loading === 'google' ? (
                <ActivityIndicator color={colors.textSecondary} />
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
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Kingschat Social Login Capsule */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleKingsChatLogin}
              disabled={loading !== null}
              activeOpacity={0.8}
            >
              {loading === 'kingschat' ? (
                <ActivityIndicator color={colors.textSecondary} />
              ) : (
                <View style={styles.socialBtnContent}>
                  {/* Kingschat Logo (Blue chat bubble with crown symbol) */}
                  <Svg width="28" height="28" viewBox="0 0 100 100" style={styles.socialIcon}>
                    <Path
                      d="M 20,20 H 80 C 85,20 90,25 90,30 V 70 C 90,75 85,80 80,80 H 45 L 25,95 V 80 H 20 C 15,80 10,75 10,70 V 30 C 10,25 15,20 20,20 Z"
                      fill="#2952CC"
                    />
                    <Path
                      d="M 38 60 L 33 40 L 45 50 L 50 35 L 55 50 L 67 40 L 62 60 Z"
                      fill="#FFFFFF"
                    />
                  </Svg>
                  <Text style={styles.socialButtonText}>Continue with Kingschat</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Separator Text */}
            <Text style={styles.orText}>or</Text>

            {/* Email Address Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.inputField, emailError ? styles.inputFieldError : null]}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Password Field with right-aligned link & visibility toggle */}
            <View style={styles.inputWrapper}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password ?</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.passwordContainer, passwordError ? styles.inputFieldError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password"
                  placeholderTextColor="#9CA3AF"
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

            {/* Submit Log In Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleEmailLogin}
              disabled={loading !== null}
              activeOpacity={0.8}
            >
              {loading === 'email' ? (
                <ActivityIndicator color="#F6A400" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Become a Seller Button */}
            <TouchableOpacity
              style={styles.sellerBannerButton}
              onPress={() => setSellerModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.sellerBannerText}>Become a Seller / Seller Portal</Text>
            </TouchableOpacity>

            {/* Footer Navigation Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
              style={styles.footerLink}
            >
              <Text style={styles.footerText}>
                Don’t have an account ? <Text style={styles.footerTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal / Options for Seller */}
      {sellerModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Seller Portal</Text>
            <Text style={styles.modalSubTitle}>Choose an option to proceed as a Licht Marketing Seller:</Text>

            {/* Option 1: Register as Seller */}
            <TouchableOpacity
              style={[styles.modalOptionBtn, { backgroundColor: '#1A2C5B' }]}
              onPress={() => {
                setSellerModalVisible(false);
                navigation.navigate('VendorRegister');
              }}
            >
              <Text style={[styles.modalOptionBtnText, { color: '#F6A400' }]}>Register as Seller</Text>
            </TouchableOpacity>

            {/* Option 2: Sign In as Seller */}
            <TouchableOpacity
              style={[styles.modalOptionBtn, { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB' }]}
              onPress={() => {
                setSellerModalVisible(false);
                if (!email) {
                  setEmail('store@vendor.com');
                  setPassword('password123');
                }
              }}
            >
              <Text style={[styles.modalOptionBtnText, { color: '#1F2937' }]}>Sign In as Seller (Demo Store)</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSellerModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFCEB', // Matches Top Header Cream Color
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: CONTAINER_WIDTH,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  headerBlock: {
    paddingTop: Platform.OS === 'ios' ? 30 : 20,
    height: 200,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 25 : 15,
    right: 20,
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#010E2A',
  },
  crownWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#010E2A',
    alignSelf: 'flex-start',
    paddingLeft: 24,
    marginTop: 8,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  generalErrorText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    backgroundColor: '#FFEAEA',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  successMessageText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#16A34A',
    backgroundColor: '#EAF8F0',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7EED8',
    textAlign: 'center',
  },
  socialButton: {
    height: 48,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  socialBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  orText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginVertical: 12,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 6,
  },
  inputField: {
    height: 48,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputFieldError: {
    borderColor: '#DC2626',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#2952CC',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  showHideButton: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    height: '100%',
  },
  showHideText: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#4B5563',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    marginTop: 4,
    marginLeft: 8,
  },
  loginButton: {
    height: 48,
    backgroundColor: '#1A2C5B', // Royal Navy Blue
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#F6A400', // Gold color text
  },
  sellerBannerButton: {
    height: 44,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  sellerBannerText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#B45309',
  },
  footerLink: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 4,
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
  footerTextBold: {
    color: '#010E2A',
    fontFamily: 'Inter-Bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#010E2A',
    marginBottom: 8,
  },
  modalSubTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOptionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalOptionBtnText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
  },
  modalCloseBtn: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
});

