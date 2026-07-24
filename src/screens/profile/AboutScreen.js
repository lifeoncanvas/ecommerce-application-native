import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export default function AboutScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={colors.navy} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <Text style={styles.logoEmoji}>👑</Text>
          <Text style={styles.appName}>KingsShoppers</Text>
          <Text style={styles.appVersion}>Version 1.0.2 (Build 12)</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardText}>
            KingsShoppers is a premium peer-to-peer commerce platform connecting local buyers with quality merchants. We strive to provide the fastest, safest, and most satisfying shopping experience with unified payments, live order tracking, and dynamic support tools.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Application Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Developer</Text>
            <Text style={styles.infoValue}>KingsShoppers Dev Team</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Released</Text>
            <Text style={styles.infoValue}>January 2026</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Framework</Text>
            <Text style={styles.infoValue}>React Native (Expo Go)</Text>
          </View>
        </View>

        <Text style={styles.footerCopyright}>© 2026 KingsShoppers application. All rights reserved.</Text>
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  appName: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  appVersion: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
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
    marginBottom: spacing.xs,
  },
  cardText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: colors.border,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  footerCopyright: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
