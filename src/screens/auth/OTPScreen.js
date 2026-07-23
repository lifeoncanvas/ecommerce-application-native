import React, { useState, useEffect, useRef } from 'react';
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
import { verifyOtp, resendOtp } from '../../api/auth.api';

const PIN_LENGTH = 6;

export default function OTPScreen({ route, navigation }) {
  const email = route.params?.email || 'user@example.com';
  
  // Segmented input state
  const [pin, setPin] = useState(Array(PIN_LENGTH).fill(''));
  const inputsRef = useRef([]);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(60);

  // loading & error states
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto countdown decrementer
  useEffect(() => {
    if (timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handlePinChange = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newPin = [...pin];
    newPin[index] = cleanText;
    setPin(newPin);
    setError('');

    // Shift focus forward if entered a digit
    if (cleanText && index < PIN_LENGTH - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Shift focus backward on backspace if current cell is empty
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const fullPin = pin.join('');
    if (fullPin.length < PIN_LENGTH) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // BACKEND CONNECTION POINT (Commented out until backend is active):
      /*
      await verifyOtp(email, fullPin);
      navigation.navigate('Login', { verificationSuccess: true });
      */

      // Active Mock Transition
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network query
      navigation.navigate('Login', { verificationSuccess: true });
    } catch (e) {
      setError(e.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;

    setError('');
    setResending(true);
    setSuccessMessage('');

    try {
      // BACKEND CONNECTION POINT (Commented out until backend is active):
      /*
      await resendOtp(email);
      */

      // Active Mock Transition
      await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate network query
      setSuccessMessage('A new verification code has been sent to your email.');
      setTimeLeft(60); // Restart countdown
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header navigation */}
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

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit confirmation code sent to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          {/* Segmented Pin Inputs row */}
          <View style={styles.pinRow}>
            {pin.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                style={[
                  styles.pinCell,
                  digit ? styles.pinCellFilled : null,
                  error ? styles.pinCellError : null,
                ]}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(text) => handlePinChange(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Verify Action Button */}
          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.verifyBtnText}>Verify & Activate</Text>
            )}
          </TouchableOpacity>

          {/* Resend Action Section */}
          <View style={styles.resendContainer}>
            {timeLeft > 0 ? (
              <Text style={styles.resendTimerText}>
                Resend code in <Text style={styles.boldTimer}>{timeLeft}s</Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                activeOpacity={0.7}
              >
                {resending ? (
                  <ActivityIndicator size="small" color={colors.navy} />
                ) : (
                  <Text style={styles.resendLinkText}>Resend Code</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
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
  emailHighlight: {
    ...typography.bodyBold,
    color: colors.navyLight,
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
  successText: {
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
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  pinCell: {
    width: 46,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    textAlign: 'center',
    ...typography.h2,
    color: colors.textPrimary,
  },
  pinCellFilled: {
    borderColor: colors.navy,
  },
  pinCellError: {
    borderColor: colors.error,
    backgroundColor: '#FFEAEA',
  },
  verifyBtn: {
    height: 50,
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verifyBtnText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '700',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendTimerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  boldTimer: {
    ...typography.bodyBold,
    color: colors.navy,
  },
  resendLinkText: {
    ...typography.bodyBold,
    color: colors.gold,
    textDecorationLine: 'underline',
  },
});
