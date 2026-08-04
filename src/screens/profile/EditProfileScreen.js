import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '../../api/profile.api';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

const AVAILABLE_AVATARS = ['👤', '🦁', '🦊', '🐼', '🐱', '🤖', '🦖', '🦄', '⭐', '🌈'];

export default function EditProfileScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Local state fields
  const [name, setName] = useState(user?.fullName || user?.name || 'Guest User');
  const [email, setEmail] = useState(user?.email || 'guest@kingsshoppers.com');
  const [phone, setPhone] = useState(user?.phone || '+234 809 123 4567');
  const [avatar, setAvatar] = useState(user?.avatar || '👤');

  const [loading, setLoading] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // Load profile from API on mount
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await withTimeout(getUserProfile(), 2000);
      const data = res.data || {};
      setName(data.name || name);
      setEmail(data.email || email);
      setPhone(data.phone || phone);
      setAvatar(data.avatar || avatar);
    } catch (e) {
      console.warn('GET /api/users/profile failed, running offline fallback.', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle Profile Update
  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and Email are required.');
      return;
    }

    setLoading(true);
    const payload = { name, email, phone, avatar };

    try {
      await withTimeout(updateUserProfile(payload), 2000);
      // Update local Auth session
      setUser((prev) => ({ ...prev, ...payload }));
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (e) {
      console.warn('PUT /api/users/profile failed, updating local state.', e.message);
      // Offline fallback
      setUser((prev) => ({ ...prev, ...payload }));
      Alert.alert('Success', 'Profile saved locally (Offline Mode).');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Handle Profile Image / Avatar Selection
  const handleSelectAvatar = async (chosenAvatar) => {
    setAvatar(chosenAvatar);
    setAvatarModalVisible(false);
    setLoading(true);

    try {
      // Simulate constructing file-like FormData object for image uploads
      const formData = new FormData();
      formData.append('profileImage', {
        uri: `avatar://${chosenAvatar}`,
        name: `avatar-${chosenAvatar}.png`,
        type: 'image/png',
      });

      await withTimeout(uploadProfileImage(formData), 2500);
      setUser((prev) => ({ ...prev, avatar: chosenAvatar }));
      Alert.alert('Success', 'Profile image uploaded to server!');
    } catch (e) {
      console.warn('POST /api/upload/profile-image failed, updating locally.', e.message);
      setUser((prev) => ({ ...prev, avatar: chosenAvatar }));
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarCircle} onPress={() => setAvatarModalVisible(true)} activeOpacity={0.8}>
              <Text style={styles.avatarEmoji}>{avatar}</Text>
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>✏️</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarLabel}>Tap to Change Avatar Image</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          {/* Submit Button */}
          <View style={styles.btnWrapper}>
            <Button title="Save Changes" onPress={handleSaveProfile} />
          </View>
        </ScrollView>
      )}

      {/* Avatar Picker Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Avatar</Text>
            <View style={styles.avatarGrid}>
              {AVAILABLE_AVATARS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.gridItem, avatar === item && styles.gridItemActive]}
                  onPress={() => handleSelectAvatar(item)}
                >
                  <Text style={styles.gridEmoji}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setAvatarModalVisible(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '800',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 44,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBadgeText: {
    fontSize: 12,
  },
  avatarLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.md,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -4,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    ...typography.body,
    color: colors.textPrimary,
  },
  btnWrapper: {
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    width: '80%',
    padding: spacing.lg,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  gridItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridItemActive: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '10',
  },
  gridEmoji: {
    fontSize: 24,
  },
  closeBtn: {
    paddingVertical: spacing.sm,
    width: '100%',
    alignItems: 'center',
  },
  closeBtnText: {
    ...typography.button,
    color: colors.error,
  },
});
