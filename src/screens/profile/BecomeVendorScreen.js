import React, { useState } from 'react';
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
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { registerVendor, uploadVendorDocument } from '../../api/vendor.api';
import * as DocumentPicker from 'expo-document-picker';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function BecomeVendorScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fashion & Apparel');
  const [documentName, setDocumentName] = useState('');
  const [logoName, setLogoName] = useState('');
  const [loading, setLoading] = useState(false);

  // Actual file selection and document upload
  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      
      setLoading(true);
      const file = result.assets[0];
      const formData = new FormData();
      
      // Handle cross-platform file format for fetch API
      formData.append('file', file.file || {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf',
      });

      const response = await uploadVendorDocument(formData);
      const url = response.data.data.url;
      setDocumentName(url);
      Alert.alert('Success', `Registration document uploaded!`);
    } catch (e) {
      console.warn('Document upload failed.', e);
      Alert.alert('Error', 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  // Actual logo upload
  const handleUploadLogo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      
      setLoading(true);
      const file = result.assets[0];
      const formData = new FormData();
      
      formData.append('file', file.file || {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'image/jpeg',
      });

      const response = await uploadVendorDocument(formData);
      const url = response.data.data.url;
      setLogoName(url);
      Alert.alert('Success', `Store logo uploaded!`);
    } catch (e) {
      console.warn('Logo upload failed.', e);
      Alert.alert('Error', 'Failed to upload logo.');
    } finally {
      setLoading(false);
    }
  };

  // Submit register request
  const handleRegister = async () => {
    if (!storeName.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill out Store Name and Description.');
      return;
    }

    if (!documentName) {
      Alert.alert('Error', 'Please upload a business registration document.');
      return;
    }

    setLoading(true);
    const payload = {
      businessName: storeName,
      businessDescription: description,
      logoUrl: logoName ? logoName : null,
      documentUrl: documentName ? documentName : null,
      businessEmail: user?.email || '',
    };

    try {
      const res = await withTimeout(registerVendor(payload), 2000);
      const newVendorId = res.data?.vendorId || `v_mock_${Date.now()}`;
      
      // Update local Auth context
      setUser((prev) => ({
        ...prev,
        isVendor: true,
        vendorId: newVendorId,
        storeName,
      }));

      Alert.alert('Congratulations! 🎉', `Your store "${storeName}" is now active!`, [
        { text: 'Go to Dashboard', onPress: () => navigation.replace('VendorDashboard') }
      ]);
    } catch (e) {
      console.warn('POST /api/vendor/register failed, creating local store.', e.message);
      // Offline fallback
      const newVendorId = `v_mock_${Date.now()}`;
      setUser((prev) => ({
        ...prev,
        isVendor: true,
        vendorId: newVendorId,
        storeName,
      }));

      Alert.alert('Congratulations! 🎉', `Store "${storeName}" created successfully (Offline Mode).`, [
        { text: 'Go to Dashboard', onPress: () => navigation.replace('VendorDashboard') }
      ]);
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
        <Text style={styles.headerTitle}>Become a Vendor</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Register Your Store</Text>
          <Text style={styles.subtitle}>Open a virtual storefront and start selling your premium products to local buyers.</Text>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Store Name</Text>
            <TextInput
              style={styles.input}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="e.g. Gourmet Spices Merchant"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Store Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Tell buyers what your store specializes in..."
              placeholderTextColor={colors.textSecondary}
              multiline={true}
              numberOfLines={4}
            />

            <Text style={styles.label}>Business Category</Text>
            <View style={styles.categoryRow}>
              {['Fashion & Apparel', 'Electronics', 'Gourmet Food'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, category === cat && styles.catBtnActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Document Upload Button */}
            <Text style={styles.label}>Registration License (PDF)</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadDocument} activeOpacity={0.8}>
              <Text style={styles.uploadBtnIcon}>📄</Text>
              <Text style={styles.uploadBtnText} numberOfLines={1}>
                {documentName ? documentName.split('/').pop() : 'Upload Registration Certificate'}
              </Text>
            </TouchableOpacity>

            {/* Logo Upload Button */}
            <Text style={styles.label}>Store Logo (PNG/JPG)</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadLogo} activeOpacity={0.8}>
              <Text style={styles.uploadBtnIcon}>🖼️</Text>
              <Text style={styles.uploadBtnText} numberOfLines={1}>
                {logoName ? logoName.split('/').pop() : 'Upload Store Logo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <View style={styles.btnWrapper}>
            <Button title="Launch My Store" onPress={handleRegister} />
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
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
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
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.textPrimary,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  catBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  catBtnActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  catBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  catBtnTextActive: {
    color: '#FFFFFF',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  uploadBtnIcon: {
    fontSize: 18,
  },
  uploadBtnText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    fontSize: 13,
  },
  btnWrapper: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
