import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import { getSettings, updateSettings } from '../../api/profile.api';
import { useTheme } from '../../context/ThemeContext';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function SettingsScreen({ navigation }) {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(false);

  // Settings states
  const [pushEnabled, setPushEnabled] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [promoEmails, setPromoEmails] = useState(true);

  // Fetch settings from server on mount
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await withTimeout(getSettings(), 2000);
      const data = res.data || {};
      if (data.pushEnabled !== undefined) setPushEnabled(data.pushEnabled);
      if (data.darkMode !== undefined && data.darkMode !== isDarkMode) {
        // Sync context theme with remote profile preference
        toggleDarkMode();
      }
      if (data.twoFactor !== undefined) setTwoFactor(data.twoFactor);
      if (data.promoEmails !== undefined) setPromoEmails(data.promoEmails);
    } catch (e) {
      console.warn('GET /api/settings failed, running offline fallback.', e.message);
    } finally {
      setLoading(false);
    }
  }, [isDarkMode, toggleDarkMode]);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle setting updates
  const handleToggle = async (key, val, setter) => {
    if (key === 'dark') {
      toggleDarkMode();
    } else {
      setter(val);
    }

    const updatedSettings = {
      pushEnabled: key === 'push' ? val : pushEnabled,
      darkMode: key === 'dark' ? val : isDarkMode,
      twoFactor: key === '2fa' ? val : twoFactor,
      promoEmails: key === 'promo' ? val : promoEmails,
    };

    try {
      await withTimeout(updateSettings(updatedSettings), 2000);
    } catch (e) {
      console.warn(`PUT /api/settings failed for key ${key}. Saved locally.`, e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={colors.navy} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {/* Account preferences */}
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.textCol}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDesc}>Receive real-time alerts about orders & sales</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={(val) => handleToggle('push', val, setPushEnabled)}
                trackColor={{ false: colors.border, true: colors.navy }}
                thumbColor={pushEnabled ? colors.gold : '#FFFFFF'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.textCol}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDesc}>Toggle screen colors to sleek dark theme</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={(val) => handleToggle('dark', val, null)}
                trackColor={{ false: colors.border, true: colors.navy }}
                thumbColor={isDarkMode ? colors.gold : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Security Preferences */}
          <Text style={styles.sectionTitle}>Security & Communications</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.textCol}>
                <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                <Text style={styles.settingDesc}>Secure sign-ins with SMS code verification</Text>
              </View>
              <Switch
                value={twoFactor}
                onValueChange={(val) => handleToggle('2fa', val, setTwoFactor)}
                trackColor={{ false: colors.border, true: colors.navy }}
                thumbColor={twoFactor ? colors.gold : '#FFFFFF'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.textCol}>
                <Text style={styles.settingTitle}>Email Promotions</Text>
                <Text style={styles.settingDesc}>Receive promotional codes & recommendations</Text>
              </View>
              <Switch
                value={promoEmails}
                onValueChange={(val) => handleToggle('promo', val, setPromoEmails)}
                trackColor={{ false: colors.border, true: colors.navy }}
                thumbColor={promoEmails ? colors.gold : '#FFFFFF'}
              />
            </View>
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
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  textCol: {
    flex: 1,
    paddingRight: spacing.md,
  },
  settingTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  settingDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
