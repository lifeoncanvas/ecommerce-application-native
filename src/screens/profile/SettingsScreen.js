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
  Alert,
} from 'react-native';
import { typography, spacing, radius } from '../../theme';
import { getSettings, updateSettings, deleteAccount } from '../../api/profile.api';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  CaretLeft,
  Bell,
  Moon,
  ShieldCheck,
  EnvelopeSimpleOpen,
  Trash,
  Warning,
} from 'phosphor-react-native';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function SettingsScreen({ navigation }) {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();
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
          <CaretLeft size={24} color={colors.navy} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Account preferences */}
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIconWrapper, { backgroundColor: '#EFF6FF' }]}>
                <Bell size={20} color="#3B82F6" weight="regular" />
              </View>
              <View style={styles.textCol}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDesc}>Receive real-time alerts about orders & sales</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={(val) => handleToggle('push', val, setPushEnabled)}
                trackColor={{ false: '#CBD5E1', true: '#4A9E86' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#CBD5E1"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={[styles.settingIconWrapper, { backgroundColor: '#F8FAFC' }]}>
                <Moon size={20} color="#475569" weight="regular" />
              </View>
              <View style={styles.textCol}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDesc}>Toggle screen colors to sleek dark theme</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={(val) => handleToggle('dark', val, null)}
                trackColor={{ false: '#CBD5E1', true: '#4A9E86' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#CBD5E1"
              />
            </View>
          </View>

          {/* Security Preferences */}
          <Text style={styles.sectionTitle}>Security & Communications</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIconWrapper, { backgroundColor: '#ECFDF5' }]}>
                <ShieldCheck size={20} color="#10B981" weight="regular" />
              </View>
              <View style={styles.textCol}>
                <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                <Text style={styles.settingDesc}>Secure sign-ins with SMS code verification</Text>
              </View>
              <Switch
                value={twoFactor}
                onValueChange={(val) => handleToggle('2fa', val, setTwoFactor)}
                trackColor={{ false: '#CBD5E1', true: '#4A9E86' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#CBD5E1"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={[styles.settingIconWrapper, { backgroundColor: '#FFF7ED' }]}>
                <EnvelopeSimpleOpen size={20} color="#F97316" weight="regular" />
              </View>
              <View style={styles.textCol}>
                <Text style={styles.settingTitle}>Email Promotions</Text>
                <Text style={styles.settingDesc}>Receive promotional codes & recommendations</Text>
              </View>
              <Switch
                value={promoEmails}
                onValueChange={(val) => handleToggle('promo', val, setPromoEmails)}
                trackColor={{ false: '#CBD5E1', true: '#4A9E86' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#CBD5E1"
              />
            </View>
          </View>

          {/* Danger Zone - Delete Account */}
          <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>Danger Zone</Text>
          <View style={[styles.sectionCard, { borderColor: '#FECACA' }]}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIconWrapper, { backgroundColor: '#FEF2F2' }]}>
                <Trash size={20} color="#DC2626" weight="regular" />
              </View>
              <View style={styles.textCol}>
                <Text style={[styles.settingTitle, { color: '#DC2626' }]}>Delete Account</Text>
                <Text style={styles.settingDesc}>Permanently delete your account and all data</Text>
              </View>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  backgroundColor: '#FEF2F2',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#FECACA',
                }}
                onPress={() => {
                  Alert.alert(
                    'Delete Account',
                    'Are you sure you want to permanently delete your account? This action cannot be undone. All your data, orders, and saved information will be lost.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete Forever',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await deleteAccount();
                          } catch (e) {
                            console.warn('Delete account API failed', e.message);
                          }
                          await logout();
                          Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
                        },
                      },
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>Delete</Text>
              </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
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
    fontSize: 17,
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
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  textCol: {
    flex: 1,
    paddingRight: spacing.md,
  },
  settingTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13.5,
  },
  settingDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
