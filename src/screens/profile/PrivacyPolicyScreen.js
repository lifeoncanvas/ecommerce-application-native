import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { getPrivacyPolicy } from '../../api/content.api';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function PrivacyPolicyScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadPolicy = async () => {
      setLoading(true);
      try {
        const res = await withTimeout(getPrivacyPolicy(), 2000);
        setContent(res.data?.text || '');
      } catch (e) {
        console.warn('GET /api/content/privacy-policy failed. Using fallback policy.', e.message);
        setContent(
          '1. Information We Collect\nWe collect personal information such as names, emails, addresses, and payment details when you register or make purchases.\n\n2. How We Use Data\nYour data is used to process orders, manage accounts, and send notifications. We do not sell data to third parties.\n\n3. Data Safety\nWe employ industrial-grade Secure Socket Layers (SSL) and storage encryptions to protect sensitive customer data from unauthorized accesses.'
        );
      } finally {
        setLoading(false);
      }
    };
    loadPolicy();
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data Privacy Protocol</Text>
            <Text style={styles.policyText}>{content}</Text>
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
  policyText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 20,
  },
});
