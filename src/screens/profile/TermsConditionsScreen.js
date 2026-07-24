import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { getTermsAndConditions } from '../../api/content.api';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function TermsConditionsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadTerms = async () => {
      setLoading(true);
      try {
        const res = await withTimeout(getTermsAndConditions(), 2000);
        setContent(res.data?.text || '');
      } catch (e) {
        console.warn('GET /api/content/terms failed. Using fallback terms.', e.message);
        setContent(
          '1. Terms of Usage\nBy registering or placing orders on KingsShoppers, you agree to comply with our localized buyer and seller guidelines.\n\n2. Purchase Agreement\nPayments made via Stripe, PayPal, or Espees are processed instantly. Sellers are obligated to ship packages within 3 business days.\n\n3. Refund Guidelines\nRefunds/Exchanges must be submitted within 7 days of package delivery. Returned products must be in their original state with seal tags attached.'
        );
      } finally {
        setLoading(false);
      }
    };
    loadTerms();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={colors.navy} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Terms of Service Agreement</Text>
            <Text style={styles.termsText}>{content}</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  termsText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 20,
  },
});
