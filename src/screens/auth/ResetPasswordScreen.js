import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';
import { resetPassword } from '../../api/auth.api';

export default function ResetPasswordScreen({ route, navigation }) {
  const email = route.params?.email || 'your email';

  // Input states
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    const tempErrors = {};
    let isValid = true;
    setGeneralError('');

    if (!token.trim()) {
      tempErrors.token = 'Reset code is required';
      isValid = false;
    }

    if (!newPassword) {
      tempErrors.password = 'New password is required';
      isValid = false;
    } else if (newPassword.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleReset = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // BACKEND CONNECTION POINT (Commented out until backend is active):
      /*
      await resetPassword(token.trim(), newPassword);
      */

      // Active Mock Transition
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate networking query
      setSuccess(true);
    } catch (e) {
      setGeneralError(e.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header navigation (only show back button if not in success state) */}
        <View style={styles.header}>
          {!success && (
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
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>New Password</Text>
          
          <Text style={styles.subtitle}>
            {success
              ? 'Your password has been successfully updated. You can now log in using your new credentials.'
              : `Enter the code sent to ${email} and set your new account password.`}
          </Text>

          {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}

          {success ? (
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => navigation.navigate('Login', { passwordResetSuccess: true })}
              activeOpacity={0.8}
            >
              <Text style={styles.successBtnText}>Back to Login</Text>
            </TouchableOpacity>
          ) : (
            <>
              {/* Reset Code Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Reset Code</Text>
                <TextInput
                  style={[styles.inputField, errors.token ? styles.inputFieldError : null]}
                  placeholder="Enter verification code"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  value={token}
                  onChangeText={setToken}
                />
                {errors.token ? <Text style={styles.fieldErrorText}>{errors.token}</Text> : null}
              </View>

              {/* New Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>New Password</Text>
                <View style={[styles.passwordContainer, errors.password ? styles.inputFieldError : null]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.showHideButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.fieldErrorText}>{errors.password}</Text> : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.passwordContainer, errors.confirmPassword ? styles.inputFieldError : null]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Re-enter new password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.showHideButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showHideText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? (
                  <Text style={styles.fieldErrorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              {/* Reset Password Button */}
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.resetBtnText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flexContainer: {
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
    paddingBottom: spacing.xl * 2,
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
    lineHeight: 22,
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
  inputField: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.textPrimary,
  },
  inputFieldError: {
    borderColor: colors.error,
  },
  fieldErrorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: 2,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    backgroundColor: '#FFEAEA',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FFD1D1',
    textAlign: 'center',
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
  resetBtn: {
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
  resetBtnText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '700',
  },
  successBtn: {
    height: 50,
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successBtnText: {
    ...typography.button,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
