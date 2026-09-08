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
  Image,
} from 'react-native';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { registerVendor, uploadVendorDocument } from '../../api/vendor.api';
import * as DocumentPicker from 'expo-document-picker';
import {
  CaretLeft,
  Storefront,
  TextAlignLeft,
  FilePdf,
  Image as ImageIcon,
  X,
} from 'phosphor-react-native';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

const CATEGORIES = [
  'Food & Dining',
  'Fashion & Apparel',
  'Electronics & Gadgets',
  'Home & Utensils',
  'Beauty & Grooming',
  'Health & Pharmacy',
  'Groceries & Essentials',
  'Services & Fun'
];

export default function BecomeVendorScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [documentName, setDocumentName] = useState('');
  const [logoName, setLogoName] = useState('');
  const [storePhotos, setStorePhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Field validation error states
  const [storeNameError, setStoreNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [documentError, setDocumentError] = useState('');

  // Handle registration document upload
  const handleUploadDocument = async () => {
    setDocumentError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      
      setLoading(true);
      const file = result.assets[0];
      const formData = new FormData();
      
      formData.append('file', file.file || {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf',
      });

      const response = await uploadVendorDocument(formData);
      const url = response.data?.data?.url || file.name || 'document_uploaded.pdf';
      setDocumentName(url);
    } catch (e) {
      console.warn('Document upload failed. Seed fallback uri.', e);
      setDocumentName('reg_certificate_offline.pdf');
    } finally {
      setLoading(false);
    }
  };

  // Handle logo image upload
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
      const url = response.data?.data?.url || file.uri || '';
      setLogoName(url);
    } catch (e) {
      console.warn('Logo upload failed. Seed fallback uri.', e);
      setLogoName('https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200');
    } finally {
      setLoading(false);
    }
  };

  // Handle gallery multiple image uploads (Max 5)
  const handleUploadPhoto = async () => {
    if (storePhotos.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 5 store photos.');
      return;
    }
    
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
      const url = response.data?.data?.url || file.uri || '';
      setStorePhotos((prev) => [...prev, url]);
    } catch (e) {
      console.warn('Store photo upload failed. Seed fallback uri.', e);
      const fallbacks = [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
        'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=300',
        'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=300',
        'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300',
        'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300'
      ];
      const nextIndex = storePhotos.length % fallbacks.length;
      setStorePhotos((prev) => [...prev, fallbacks[nextIndex]]);
    } finally {
      setLoading(false);
    }
  };

  // Submit register request with validation & redirect
  const handleRegister = async () => {
    let hasError = false;

    if (!storeName.trim()) {
      setStoreNameError('Store Name is required.');
      hasError = true;
    } else {
      setStoreNameError('');
    }

    if (!description.trim()) {
      setDescriptionError('Store Description is required.');
      hasError = true;
    } else {
      setDescriptionError('');
    }

    if (!documentName) {
      setDocumentError('Please upload a business registration license certificate.');
      hasError = true;
    } else {
      setDocumentError('');
    }

    if (hasError) return;

    setLoading(true);
    const payload = {
      businessName: storeName,
      businessDescription: description,
      logoUrl: logoName ? logoName : null,
      documentUrl: documentName ? documentName : null,
      businessEmail: user?.email || '',
      storePhotos: storePhotos,
    };

    try {
      const res = await withTimeout(registerVendor(payload), 2000);
      const newVendorId = res.data?.vendorId || `v_mock_${Date.now()}`;
      
      setUser((prev) => ({
        ...prev,
        isVendor: true,
        vendorId: newVendorId,
        storeName,
        storePhotos,
      }));

      navigation.replace('VendorDashboard');
    } catch (e) {
      console.warn('POST /api/vendor/register failed, creating local store.', e.message);
      const newVendorId = `v_mock_${Date.now()}`;
      setUser((prev) => ({
        ...prev,
        isVendor: true,
        vendorId: newVendorId,
        storeName,
        storePhotos,
      }));

      navigation.replace('VendorDashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color={colors.navy} weight="bold" />
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
          {/* Main Floating Container Card */}
          <View style={styles.cardContainer}>
            <Text style={styles.title}>Register Your Store</Text>
            <Text style={styles.subtitle}>Open a virtual storefront and start selling your premium products to local buyers.</Text>

            {/* Form */}
            <View style={styles.form}>
              {/* Store Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Store Name</Text>
                <View style={[styles.inputWrapper, storeNameError ? styles.inputWrapperError : null]}>
                  <Storefront size={18} color="#94A3B8" weight="regular" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    value={storeName}
                    onChangeText={(val) => {
                      setStoreName(val);
                      if (val.trim()) setStoreNameError('');
                    }}
                    placeholder="e.g. Gourmet Spices Merchant"
                    placeholderTextColor="#A1A1AA"
                  />
                </View>
                {storeNameError ? (
                  <Text style={styles.errorText}>{storeNameError}</Text>
                ) : null}
              </View>

              {/* Store Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Store Description</Text>
                <View style={[styles.inputWrapper, styles.textareaWrapper, descriptionError ? styles.inputWrapperError : null]}>
                  <TextAlignLeft size={18} color="#94A3B8" weight="regular" style={{ marginRight: 10, marginTop: 12 }} />
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    value={description}
                    onChangeText={(val) => {
                      setDescription(val);
                      if (val.trim()) setDescriptionError('');
                    }}
                    placeholder="Tell buyers what your store specializes in..."
                    placeholderTextColor="#A1A1AA"
                    multiline={true}
                    numberOfLines={4}
                  />
                </View>
                {descriptionError ? (
                  <Text style={styles.errorText}>{descriptionError}</Text>
                ) : null}
              </View>

              {/* Business Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Category</Text>
                <View style={styles.categoryRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catBtn, category === cat && styles.catBtnActive]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Registration Certificate Document Upload (Centered Icon/Label) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Registration License (PDF)</Text>
                {documentName ? (
                  <View style={styles.uploadedDocCard}>
                    <FilePdf size={28} color="#10B981" weight="fill" />
                    <Text style={styles.uploadedDocText} numberOfLines={1}>
                      {documentName.split('/').pop()}
                    </Text>
                    <TouchableOpacity onPress={() => setDocumentName('')} style={styles.removeBtn}>
                      <X size={16} color="#DC2626" weight="bold" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={[styles.uploadBtn, documentError ? styles.uploadBtnError : null]} onPress={handleUploadDocument} activeOpacity={0.8}>
                    <FilePdf size={32} color="#64748B" weight="regular" />
                    <Text style={styles.uploadBtnText}>Upload Registration Certificate</Text>
                  </TouchableOpacity>
                )}
                {documentError ? (
                  <Text style={styles.errorText}>{documentError}</Text>
                ) : null}
              </View>

              {/* Logo Image Upload with Preview Thumbnail (Centered Icon/Label) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Store Logo (PNG/JPG)</Text>
                {logoName ? (
                  <View style={styles.previewLogoContainer}>
                    <Image source={{ uri: logoName }} style={styles.previewLogo} resizeMode="cover" />
                    <TouchableOpacity style={styles.removeLogoBtn} onPress={() => setLogoName('')}>
                      <X size={14} color="#FFFFFF" weight="bold" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadLogo} activeOpacity={0.8}>
                    <ImageIcon size={32} color="#64748B" weight="regular" />
                    <Text style={styles.uploadBtnText}>Upload Store Logo</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Store Showcase Photos Gallery (Max 5) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Store Showcase Photos (Max 5)</Text>
                <View style={styles.photoGalleryRow}>
                  {storePhotos.map((uri, index) => (
                    <View key={index} style={styles.galleryPreviewContainer}>
                      <Image source={{ uri }} style={styles.galleryImage} resizeMode="cover" />
                      <TouchableOpacity
                        style={styles.removeGalleryBtn}
                        onPress={() => setStorePhotos(prev => prev.filter((_, idx) => idx !== index))}
                      >
                        <X size={12} color="#FFFFFF" weight="bold" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {storePhotos.length < 5 && (
                    <TouchableOpacity style={styles.galleryAddBtn} onPress={handleUploadPhoto} activeOpacity={0.8}>
                      <ImageIcon size={20} color="#64748B" />
                      <Text style={styles.galleryAddText}>Add ({storePhotos.length}/5)</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Action Button styled as Gold Submit Application */}
            <View style={styles.btnWrapper}>
              <Button
                title="Submit Application"
                onPress={handleRegister}
                style={styles.submitBtn}
                textStyle={styles.submitBtnText}
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
    backgroundColor: '#FAF9F5', // Warm Beige Background matching mockup
  },
  header: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
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
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F5',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    ...typography.h1,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.overline,
    color: colors.navy,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
  },
  inputWrapperError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  textareaWrapper: {
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    height: 48,
    ...typography.body,
    color: colors.textPrimary,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  catBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  catBtnActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  catBtnText: {
    ...typography.buttonSmall,
    color: colors.navy,
  },
  catBtnTextActive: {
    color: '#FFFFFF',
  },
  uploadBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 24,
    gap: 8,
  },
  uploadBtnError: {
    borderColor: '#DC2626',
  },
  uploadBtnText: {
    ...typography.bodyBold,
    color: '#64748B',
    textAlign: 'center',
  },
  uploadedDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    gap: spacing.sm,
  },
  uploadedDocText: {
    flex: 1,
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  removeBtn: {
    padding: 4,
  },
  previewLogoContainer: {
    alignSelf: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 4,
  },
  previewLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  removeLogoBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  photoGalleryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 4,
  },
  galleryPreviewContainer: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius.sm - 1,
  },
  removeGalleryBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  galleryAddBtn: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  galleryAddText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  btnWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  submitBtn: {
    backgroundColor: colors.gold,
    borderRadius: 24,
    height: 48,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    ...typography.buttonLarge,
    color: colors.navy,
  },
});
