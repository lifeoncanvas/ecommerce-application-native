import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, spacing } from '../../theme';
import { register } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH, 400);

const countries = [
  { name: 'India', code: '+91', label: 'In +91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', label: 'US +1', flag: '🇺🇸' },
  { name: 'Nigeria', code: '+234', label: 'NG +234', flag: '🇳🇬' },
  { name: 'United Kingdom', code: '+44', label: 'UK +44', flag: '🇬🇧' },
  { name: 'Canada', code: '+1', label: 'CA +1', flag: '🇨🇦' },
  { name: 'South Africa', code: '+27', label: 'ZA +27', flag: '🇿🇦' },
  { name: 'Ghana', code: '+233', label: 'GH +233', flag: '🇬🇭' },
  { name: 'Kenya', code: '+254', label: 'KE +254', flag: '🇰🇪' },
];

export default function RegisterScreen({ route, navigation }) {
  const { login, loginSocial, continueAsGuest } = useAuth();
  const role = (route && route.params && route.params.role) ? route.params.role : 'USER';
  
  // Input fields state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password mask visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Country dropdown state
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // UI States
  const [loading, setLoading] = useState(null); // 'register', 'google', 'kingschat', or null
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Form validations
  const validateForm = () => {
    const tempErrors = {};
    let isValid = true;
    setGeneralError('');

    if (!fullName.trim()) {
      tempErrors.name = 'Full name is required';
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      tempErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (phoneNumber.trim().length < 6) {
      tempErrors.phone = 'Enter a valid phone number';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      tempErrors.email = 'Enter a valid email address';
      isValid = false;
    }

    if (!password) {
      tempErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading('register');
    const fullPhone = `${selectedCountry.code}${phoneNumber.trim()}`;
    const payload = {
      fullName: fullName.trim(),
      phone: fullPhone,
      email: email.trim(),
      role: role,
    };

    try {
      await register({ ...payload, password });
      await login(payload.email, password);
    } catch (e) {
      setGeneralError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading('google');
    try {
      const idToken = 'mock-google-token';
      await loginSocial('google', idToken);
    } catch (e) {
      setGeneralError('Google sign up failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleKingsChatRegister = async () => {
    setLoading('kingschat');
    try {
      const accessToken = 'mock-kingschat-token';
      await loginSocial('kingschat', accessToken);
    } catch (e) {
      setGeneralError('KingsChat sign up failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery)
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.innerContainer}>
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

            {/* Licht Marketing Logo */}
            <Image
              source={require('../../../assets/images/crown_logo.png')}
              style={styles.crownImage}
            />

            {/* Serif Styled Header */}
            <Text style={styles.headerTitle}>Sign Up</Text>
          </View>

          {/* White Bottom Sheet Form Card */}
          <View style={styles.formCard}>

            {/* Scrollable Fields Section */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollFields}
            >
              {generalError ? <Text style={styles.generalErrorText}>{generalError}</Text> : null}

              {/* Google Social Login Capsule */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleRegister}
                disabled={loading !== null}
                activeOpacity={0.8}
              >
                {loading === 'google' ? (
                  <ActivityIndicator color={colors.textSecondary} />
                ) : (
                  <View style={styles.socialBtnContent}>
                    <Svg width="18" height="18" viewBox="0 0 48 48" style={styles.socialIcon}>
                      <Path d="M43.61 24.55c0-1.57-.14-3.08-.4-4.55H24v8.63h11.02c-.48 2.54-1.93 4.7-4.09 6.14v5.1h6.63c3.88-3.58 6.05-8.86 6.05-15.32z" fill="#4285F4" />
                      <Path d="M24 44c5.4 0 9.92-1.79 13.24-4.86l-6.63-5.1c-1.84 1.23-4.19 1.96-6.61 1.96-5.08 0-9.39-3.43-10.93-8.05H6.27v5.27C9.57 39.82 16.27 44 24 44z" fill="#34A853" />
                      <Path d="M13.07 27.95a12.02 12.02 0 010-7.9v-5.27H6.27a23.95 23.95 0 000 18.44l6.8-5.27z" fill="#FBBC05" />
                      <Path d="M24 13.9c2.93 0 5.57 1.01 7.64 2.98l5.73-5.73C33.91 8.08 29.39 6 24 6 16.27 6 9.57 10.18 6.27 16.73l6.8 5.27c1.54-4.62 5.85-8.1 10.93-8.1z" fill="#EA4335" />
                    </Svg>
                    <Text style={styles.socialButtonText}>Continue with Google</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Kingschat Social Login Capsule */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleKingsChatRegister}
                disabled={loading !== null}
                activeOpacity={0.8}
              >
                {loading === 'kingschat' ? (
                  <ActivityIndicator color={colors.textSecondary} />
                ) : (
                  <View style={styles.socialBtnContent}>
                    <Svg width="20" height="20" viewBox="0 0 100 100" style={styles.socialIcon}>
                      <Path d="M 20,20 H 80 C 85,20 90,25 90,30 V 70 C 90,75 85,80 80,80 H 45 L 25,95 V 80 H 20 C 15,80 10,75 10,70 V 30 C 10,25 15,20 20,20 Z" fill="#2952CC" />
                      <Path d="M 38 60 L 33 40 L 45 50 L 50 35 L 55 50 L 67 40 L 62 60 Z" fill="#FFFFFF" />
                    </Svg>
                    <Text style={styles.socialButtonText}>Continue with Kingschat</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Separator */}
              <Text style={styles.orText}>or</Text>

              {/* Full Name */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.inputField, errors.name ? styles.inputFieldError : null]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
              </View>

              {/* Phone Number */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={[styles.phoneContainer, errors.phone ? styles.inputFieldError : null]}>
                  <TouchableOpacity
                    style={styles.countryDropdown}
                    onPress={() => setCountryModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.countryCodeText}>{selectedCountry.label}</Text>
                    <Text style={styles.caretSymbol}>▼</Text>
                  </TouchableOpacity>
                  <View style={styles.verticalDivider} />
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter phone number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
                {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={[styles.inputField, errors.email ? styles.inputFieldError : null]}
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.passwordContainer, errors.password ? styles.inputFieldError : null]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showHideButton} activeOpacity={0.7}>
                    <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.passwordContainer, errors.confirmPassword ? styles.inputFieldError : null]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Re-enter password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.showHideButton} activeOpacity={0.7}>
                    <Text style={styles.showHideText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
              </View>
            </ScrollView>

            {/* ── Sticky Bottom: Button + Footer ── */}
            <View style={styles.stickyBottom}>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading !== null}
                activeOpacity={0.8}
              >
                {loading === 'register' ? (
                  <ActivityIndicator color="#F6A400" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
                style={styles.footerLink}
              >
                <Text style={styles.footerText}>
                  Already have an account? <Text style={styles.footerTextBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('VendorRegister')}
                activeOpacity={0.7}
                style={[styles.footerLink, { marginTop: 10 }]}
              >
                <Text style={styles.footerText}>
                  Want to sell on Licht Marketing? <Text style={[styles.footerTextBold, { color: '#F6A400' }]}>Become a Seller</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Country Selection Dropdown Modal */}
      <Modal
        visible={countryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)} activeOpacity={0.7}>
                <Text style={styles.modalCloseBtn}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <TextInput
              style={styles.modalSearch}
              placeholder="Search by country or prefix..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />

            {/* Countries FlatList */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedCountry(item);
                    setCountryModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <View style={styles.countryFlagName}>
                    <Text style={styles.modalFlagSymbol}>{item.flag}</Text>
                    <Text style={styles.countryNameText}>{item.name}</Text>
                  </View>
                  <Text style={styles.countryCodeText}>{item.code}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalDivider} />}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFCEB',
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    width: CONTAINER_WIDTH,
    alignSelf: 'center',
  },
  headerBlock: {
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 8,
    right: 20,
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#010E2A',
  },
  crownImage: {
    width: 180,
    height: 75,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
    marginTop: 4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#010E2A',
    alignSelf: 'flex-start',
    paddingLeft: 28,
    marginTop: 2,
    marginBottom: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 22,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  scrollFields: {
    paddingBottom: 8,
  },
  stickyBottom: {
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    backgroundColor: '#FFFFFF',
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
  socialButton: {
    height: 44,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
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
    marginVertical: 8,
  },
  inputWrapper: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 6,
  },
  inputField: {
    height: 44,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputFieldError: {
    borderColor: '#DC2626',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },
  countryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
  },
  flagSymbol: {
    fontSize: 18,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginRight: 2,
  },
  caretSymbol: {
    fontSize: 8,
    color: '#4B5563',
    marginLeft: 4,
  },
  verticalDivider: {
    width: 1.2,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 22,
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
  registerButton: {
    height: 50,
    backgroundColor: '#1A2C5B',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#F6A400', // Gold color text
  },
  footerLink: {
    marginTop: 14,
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

  // Modal selector styles
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '60%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#010E2A',
  },
  modalCloseBtn: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#2952CC',
  },
  modalSearch: {
    height: 42,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  countryFlagName: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalFlagSymbol: {
    fontSize: 22,
    marginRight: 12,
  },
  countryNameText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});
