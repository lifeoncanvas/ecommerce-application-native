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
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '../../api/profile.api';
import {
  CaretLeft,
  User,
  PencilSimple,
  X,
  Phone,
  Envelope,
} from 'phosphor-react-native';

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

  const [name, setName] = useState(user?.fullName || user?.name || 'Guest User');
  const [email, setEmail] = useState(user?.email || 'guest@kingsshoppers.com');
  const [phone, setPhone] = useState(user?.phone || '+234 809 123 4567');
  const [avatar, setAvatar] = useState(user?.avatar || '👤');

  const [loading, setLoading] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

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

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and Email are required.');
      return;
    }

    setLoading(true);
    const payload = { name, email, phone, avatar };

    try {
      await withTimeout(updateUserProfile(payload), 2000);
      setUser((prev) => ({ ...prev, ...payload }));
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (e) {
      console.warn('PUT /api/users/profile failed, updating local state.', e.message);
      setUser((prev) => ({ ...prev, ...payload }));
      Alert.alert('Success', 'Profile saved locally (Offline Mode).');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAvatar = async (chosenAvatar) => {
    setAvatar(chosenAvatar);
    setAvatarModalVisible(false);
    setLoading(true);

    try {
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

  const isDefaultAvatar = avatar === '👤' || !avatar;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color={colors.navy} weight="bold" />
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
              {isDefaultAvatar ? (
                <View style={styles.avatarPlaceholder}>
                  <User size={46} color="#4F46E5" weight="fill" />
                </View>
              ) : (
                <Text style={styles.avatarEmoji}>{avatar}</Text>
              )}
              <View style={styles.editBadge}>
                <PencilSimple size={12} color="#1E293B" weight="bold" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarLabel}>Tap to Change Avatar Image</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color="#94A3B8" weight="regular" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Envelope size={18} color="#94A3B8" weight="regular" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={18} color="#94A3B8" weight="regular" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Save Changes Button */}
          <View style={styles.btnWrapper}>
            <Button title="Save Changes" onPress={handleSaveProfile} />
          </View>
        </ScrollView>
      )}

      {/* Avatar Picker Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar</Text>
              <TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
                <X size={20} color="#1E293B" weight="bold" />
              </TouchableOpacity>
            </View>
            <View style={styles.avatarGrid}>
              {AVAILABLE_AVATARS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.gridAvatarItem}
                  onPress={() => handleSelectAvatar(emoji)}
                >
                  <Text style={styles.gridAvatarEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
  avatarSection: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEF2F6', // beautiful light blue grey tint
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  input: {
    flex: 1,
    height: 48,
    ...typography.body,
    color: colors.textPrimary,
  },
  btnWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  gridAvatarItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridAvatarEmoji: {
    fontSize: 24,
  },
});
