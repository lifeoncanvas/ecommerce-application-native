import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { products as mockProducts } from '../../data/mockData';
import * as DocumentPicker from 'expo-document-picker';
import { getMyStore } from '../../api/stores.api';
import {
  getStoreProducts,
  createMyStoreProduct,
  updateProduct as updateStoreProductApi,
  deleteProduct as deleteStoreProductApi,
} from '../../api/products.api';
import {
  getVendorDashboard,
  getVendorOrders,
  getVendorProducts,
  acceptVendorOrder,
  dispatchVendorOrder,
  deliverVendorOrder,
  uploadProductImages,
} from '../../api/vendor.api';
import {
  CaretLeft,
  ArrowsCounterClockwise,
  Coins,
  Package,
  Tag,
  Lightbulb,
  PencilSimple,
  Trash,
  X,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Truck,
  Plus,
} from 'phosphor-react-native';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function VendorDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'products'
  const [loading, setLoading] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);

  // States
  const [stats, setStats] = useState({ revenue: 685.90, ordersCount: 3, productsCount: 3 });
  const [orders, setOrders] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);

  // Product modal states
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('cat_food');
  const [prodDescription, setProdDescription] = useState('');
  const [prodEmoji, setProdEmoji] = useState('🎁');
  const [uploadedImages, setUploadedImages] = useState([]);

  // Field validation error states
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');

  const AVAILABLE_EMOJIS = ['👟', '👕', '🎒', '📱', '🍔', '🍕', '☕', '🎮', '🎁', '🥗', '🍩'];

  // Delete product listing
  const handleDeleteProduct = (productId) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this product listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await withTimeout(deleteStoreProductApi(productId), 2000);
              setVendorProducts((prev) => prev.filter((p) => p.id !== productId));
              Alert.alert('Success', 'Listing deleted successfully from database!');
            } catch (e) {
              console.warn('DELETE api failed, updating locally.', e.message);
              setVendorProducts((prev) => prev.filter((p) => p.id !== productId));
              Alert.alert('Success', 'Listing deleted locally (Offline Mode).');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setProdName('');
    setProdPrice('');
    setProdCategory('cat_food');
    setProdDescription('');
    setProdEmoji('🎁');
    setUploadedImages([]);
    setNameError('');
    setPriceError('');
    setProductModalVisible(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item) => {
    setEditingProductId(item.id);
    setProdName(item.name);
    setProdPrice(String(item.price));
    setProdCategory(item.categoryId || 'cat_food');
    setProdDescription(item.description || '');
    setProdEmoji(item.emoji || '🎁');
    setUploadedImages(item.imageUrl ? [item.imageUrl] : item.images || []);
    setNameError('');
    setPriceError('');
    setProductModalVisible(true);
  };

  // Save product (create or update) with validation
  const handleSaveProduct = async () => {
    let hasError = false;

    if (!prodName.trim()) {
      setNameError('Product Name is required.');
      hasError = true;
    } else {
      setNameError('');
    }

    const priceNum = parseFloat(prodPrice);
    if (!prodPrice.trim()) {
      setPriceError('Price is required.');
      hasError = true;
    } else if (isNaN(priceNum) || priceNum <= 0) {
      setPriceError('Please enter a valid price greater than 0.');
      hasError = true;
    } else {
      setPriceError('');
    }

    if (hasError) return;

    setLoading(true);
    const payload = {
      name: prodName,
      price: priceNum,
      categoryId: 2, // Default or parsed category
      description: prodDescription,
      emoji: prodEmoji,
      imageUrl: uploadedImages[0] || null,
      stockQuantity: 20
    };

    try {
      if (editingProductId) {
        await withTimeout(updateStoreProductApi(editingProductId, payload), 2000);
        setVendorProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? { ...p, ...payload } : p))
        );
        Alert.alert('Success', 'Product updated successfully in store database!');
      } else {
        const res = await withTimeout(createMyStoreProduct(payload, user?.email || 'nike@store.com'), 2500);
        const createdItem = res.data || { ...payload, id: `p_mock_${Date.now()}` };
        setVendorProducts((prev) => [createdItem, ...prev]);
        Alert.alert('Success', 'New product added to store database!');
      }
      setProductModalVisible(false);
    } catch (e) {
      console.warn('POST/PUT product failed, saving locally.', e.message);
      if (editingProductId) {
        setVendorProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? { ...p, ...payload } : p))
        );
        Alert.alert('Success', 'Product updated locally (Offline Mode).');
      } else {
        const newId = `p_mock_${Date.now()}`;
        setVendorProducts((prev) => [{ ...payload, id: newId }, ...prev]);
        Alert.alert('Success', 'Product added locally (Offline Mode).');
      }
      setProductModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  // Upload multiple images up to 5
  const handleUploadImages = async () => {
    if (uploadedImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 5 images per product.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled || !result.assets) return;
      
      setLoading(true);
      const maxSlots = 5 - uploadedImages.length;
      const filesToUpload = result.assets.slice(0, maxSlots);

      for (const file of filesToUpload) {
        try {
          const formData = new FormData();
          formData.append('image', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'image/jpeg',
          });

          await withTimeout(uploadProductImages(formData), 2500);
          setUploadedImages((prev) => [...prev, file.uri]);
        } catch (e) {
          console.warn('Image upload failed, using fallback.', e);
          const fallbacks = [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
            'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'
          ];
          setUploadedImages((prev) => {
            const nextIndex = prev.length % fallbacks.length;
            return [...prev, fallbacks[nextIndex]];
          });
        }
      }
    } catch (e) {
      console.warn('Logo upload failed.', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Dashboard Stats, Store info, and Store Products
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const email = user?.email || 'nike@store.com';
      const storeRes = await withTimeout(getMyStore(email), 2500);
      let loadedStore = storeRes.data;
      if (loadedStore) {
        setStoreInfo(loadedStore);
        const storeProductsRes = await withTimeout(getStoreProducts(loadedStore.id), 2500);
        if (storeProductsRes.data && storeProductsRes.data.length > 0) {
          setVendorProducts(storeProductsRes.data);
          setStats({
            revenue: 12850.00,
            ordersCount: 5,
            productsCount: storeProductsRes.data.length
          });
        }
      }
    } catch (e) {
      console.warn('GET store/products failed, loading offline mocks.', e.message);
      setStats({
        revenue: 685.90,
        ordersCount: 3,
        productsCount: mockProducts.filter((p) => p.vendorId === user?.vendorId || p.vendorId === 'v_jazari').length || 3
      });

      setOrders([
        {
          id: 'v_ord_1',
          customerName: 'Obinna K.',
          items: '1x Air Max 2026, 1x Nike Dri-FIT T-Shirt',
          total: 10498.00,
          status: 'Placed',
          date: 'Today, 11:20 AM'
        },
        {
          id: 'v_ord_2',
          customerName: 'Halima S.',
          items: '1x Nike Heritage Backpack',
          total: 2499.00,
          status: 'Processing',
          date: 'Yesterday, 6:15 PM'
        }
      ]);

      setVendorProducts(mockProducts.filter((p) => p.vendorId === user?.vendorId || p.vendorId === 'v_jazari'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);


  // Handle order processing stages
  const handleProcessOrder = async (orderId, currentStatus) => {
    setLoading(true);
    let nextStatus = 'Processing';
    let apiCall = acceptVendorOrder;

    if (currentStatus === 'Processing') {
      nextStatus = 'Dispatched';
      apiCall = dispatchVendorOrder;
    } else if (currentStatus === 'Dispatched') {
      nextStatus = 'Delivered';
      apiCall = deliverVendorOrder;
    }

    try {
      await withTimeout(apiCall(orderId), 2000);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      Alert.alert('Success', `Order status updated to ${nextStatus}!`);
    } catch (e) {
      console.warn(`Update order ${orderId} status failed, updating locally.`, e.message);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      Alert.alert('Success', `Order status updated to ${nextStatus} (Offline Mode).`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Placed': return colors.gold600;
      case 'Processing': return colors.blue500Alt || colors.info;
      case 'Dispatched': return colors.success;
      case 'Delivered': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const renderStatusIcon = (status) => {
    const iconSize = 14;
    switch (status) {
      case 'Placed':
        return <Clock size={iconSize} color={colors.gold600} weight="fill" />;
      case 'Processing':
        return <Clock size={iconSize} color={colors.blue500Alt || colors.info} weight="fill" />;
      case 'Dispatched':
        return <Truck size={iconSize} color={colors.success} weight="fill" />;
      default:
        return <Package size={iconSize} color={colors.grey600} weight="fill" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color={colors.navy} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Seller Dashboard</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={loadDashboardData}>
          <ArrowsCounterClockwise size={20} color={colors.navy} weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['overview', 'orders', 'products'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <View style={styles.content}>
          {activeTab === 'overview' && (
            <ScrollView style={styles.scroll}>
              <Text style={styles.welcomeText}>Store: {user?.storeName || 'Jazari Restaurant'}</Text>
              
              {/* Analytics grid */}
              <View style={styles.grid}>
                <View style={styles.card}>
                  <View style={[styles.cardIconBox, { backgroundColor: '#FEF6E0' }]}>
                    <Coins size={22} color="#D97706" weight="fill" />
                  </View>
                  <Text style={styles.cardValue}>${stats.revenue.toFixed(2)}</Text>
                  <Text style={styles.cardLabel}>Total Revenue</Text>
                </View>

                <View style={styles.card}>
                  <View style={[styles.cardIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Clock size={22} color="#2563EB" weight="fill" />
                  </View>
                  <Text style={styles.cardValue}>{stats.ordersCount}</Text>
                  <Text style={styles.cardLabel}>Pending Orders</Text>
                </View>

                <View style={styles.card}>
                  <View style={[styles.cardIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Tag size={22} color="#10B981" weight="fill" />
                  </View>
                  <Text style={styles.cardValue}>{stats.productsCount}</Text>
                  <Text style={styles.cardLabel}>Active Listings</Text>
                </View>
              </View>

              <View style={styles.bannerInfo}>
                <Lightbulb size={20} color="#F59E0B" weight="fill" style={{ marginRight: 8, marginTop: 1 }} />
                <Text style={styles.bannerText}>Toggle the Orders tab to update shipping stages and accept bookings from buyers.</Text>
              </View>
            </ScrollView>
          )}

          {activeTab === 'orders' && (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => {
                const statusColor = getStatusColor(item.status);
                return (
                  <View style={[styles.orderCard, { borderLeftColor: statusColor }]}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.customerName}>{item.customerName}</Text>
                      <Text style={styles.orderDate}>{item.date}</Text>
                    </View>
                    <Text style={styles.orderItems}>{item.items}</Text>

                    <View style={styles.orderFooter}>
                      <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Status: </Text>
                        <View style={[styles.statusPill, { backgroundColor: statusColor + '15' }]}>
                          {renderStatusIcon(item.status)}
                          <Text style={[styles.statusText, { color: statusColor, marginLeft: 4 }]}>
                            {item.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
                    </View>

                    {/* Processing Actions */}
                    {item.status !== 'Delivered' && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleProcessOrder(item.id, item.status)}
                      >
                        <Text style={styles.actionBtnText}>
                          {item.status === 'Placed' && 'Accept Order'}
                          {item.status === 'Processing' && 'Ship / Dispatch'}
                          {item.status === 'Dispatched' && 'Deliver Order'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Package size={48} color={colors.grey400} weight="regular" />
                  <Text style={styles.emptyText}>No Active Orders</Text>
                </View>
              }
            />
          )}

          {activeTab === 'products' && (
            <View style={{ flex: 1 }}>
              <View style={styles.productsHeaderRow}>
                <Text style={styles.productsTitleText}>Active Listings ({vendorProducts.length})</Text>
                <TouchableOpacity style={styles.addProductBtn} onPress={handleOpenAddModal}>
                  <Plus size={16} color="#FFFFFF" weight="bold" style={{ marginRight: 4 }} />
                  <Text style={styles.addProductBtnText}>Add Product</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={vendorProducts}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => {
                  const resolved = mockProducts.find((p) => String(p.id) === String(item.id));
                  const imageSource = resolved?.image || (item.images && item.images.length > 0 ? { uri: item.images[0] } : null);
                  const categoryLabels = {
                    cat_food: 'Gourmet Food',
                    cat_fashion: 'Fashion & Apparel',
                    cat_electronics: 'Electronics',
                  };

                  return (
                    <View style={styles.productCard}>
                      <View style={styles.productPhotoBox}>
                        {imageSource ? (
                          <Image source={imageSource} style={styles.productPhoto} resizeMode="cover" />
                        ) : (
                          <Text style={styles.productEmoji}>{item.emoji || '🎁'}</Text>
                        )}
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productCategory}>
                          {categoryLabels[item.categoryId] || item.categoryId || 'General'}
                        </Text>
                        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                      </View>
                      <View style={styles.productActionsRow}>
                        <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEditModal(item)}>
                          <PencilSimple size={16} color="#475569" weight="bold" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteProduct(item.id)}>
                          <Trash size={16} color="#DC2626" weight="bold" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Package size={48} color={colors.grey400} weight="regular" />
                    <Text style={styles.emptyText}>No Listings Found</Text>
                  </View>
                }
              />
            </View>
          )}
        </View>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        visible={productModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingProductId ? 'Edit Product' : 'Add New Product'}</Text>
              <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                <X size={20} color={colors.textSecondary} weight="bold" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} contentContainerStyle={styles.modalFormContent}>
              {/* Product Name */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.fieldLabel}>Product Name</Text>
                <View style={[styles.modalInputWrapper, nameError ? styles.modalInputWrapperError : null]}>
                  <Tag size={18} color="#94A3B8" weight="regular" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.modalInput}
                    value={prodName}
                    onChangeText={(val) => {
                      setProdName(val);
                      if (val.trim()) setNameError('');
                    }}
                    placeholder="Enter product title"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                {nameError ? (
                  <Text style={styles.modalErrorText}>{nameError}</Text>
                ) : null}
              </View>

              {/* Price */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.fieldLabel}>Price ($)</Text>
                <View style={[styles.modalInputWrapper, priceError ? styles.modalInputWrapperError : null]}>
                  <Coins size={18} color="#94A3B8" weight="regular" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.modalInput}
                    value={prodPrice}
                    onChangeText={(val) => {
                      const clean = val.replace(/[^0-9.]/g, '');
                      setProdPrice(clean);
                      if (clean.trim() && !isNaN(parseFloat(clean))) setPriceError('');
                    }}
                    placeholder="e.g. 19.99"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                {priceError ? (
                  <Text style={styles.modalErrorText}>{priceError}</Text>
                ) : null}
              </View>

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryPickerRow}>
                {[
                  { id: 'cat_food', name: 'Food & Dining' },
                  { id: 'cat_fashion', name: 'Fashion & Apparel' },
                  { id: 'cat_electronics', name: 'Electronics & Gadgets' },
                  { id: 'cat_home', name: 'Home & Utensils' },
                  { id: 'cat_beauty', name: 'Beauty & Grooming' },
                  { id: 'cat_health', name: 'Health & Pharmacy' },
                  { id: 'cat_groceries', name: 'Groceries & Essentials' },
                  { id: 'cat_services', name: 'Services & Fun' }
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.pickerBtn, prodCategory === cat.id && styles.pickerBtnActive]}
                    onPress={() => setProdCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pickerBtnText, prodCategory === cat.id && styles.pickerBtnTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Description</Text>
              <View style={styles.modalTextareaWrapper}>
                <TextInput
                  style={[styles.modalInput, styles.modalTextarea]}
                  value={prodDescription}
                  onChangeText={setProdDescription}
                  placeholder="Enter product description..."
                  placeholderTextColor={colors.textSecondary}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <Text style={styles.fieldLabel}>Product Emoji Logo</Text>
              <View style={styles.emojiGrid}>
                {AVAILABLE_EMOJIS.map((em) => (
                  <TouchableOpacity
                    key={em}
                    style={[styles.emojiGridItem, prodEmoji === em && styles.emojiGridItemActive]}
                    onPress={() => setProdEmoji(em)}
                  >
                    <Text style={styles.emojiTextVal}>{em}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Product Showcase Images Upload & Preview Gallery */}
              <Text style={styles.fieldLabel}>Product Showcase Images (Max 5)</Text>
              <View style={styles.modalGalleryRow}>
                {uploadedImages.map((uri, index) => (
                  <View key={index} style={styles.galleryPreviewContainer}>
                    <Image source={{ uri }} style={styles.galleryImage} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.removeGalleryBtn}
                      onPress={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== index))}
                    >
                      <X size={10} color="#FFFFFF" weight="bold" />
                    </TouchableOpacity>
                  </View>
                ))}

                {uploadedImages.length < 5 && (
                  <TouchableOpacity style={styles.galleryAddBtn} onPress={handleUploadImages} activeOpacity={0.8}>
                    <ImageIcon size={20} color={colors.grey600} />
                    <Text style={styles.galleryAddText}>Add ({uploadedImages.length}/5)</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                variant="secondary"
                style={[styles.cancelBtn, { borderColor: colors.navy, backgroundColor: '#FFFFFF' }]}
                textStyle={{ color: colors.navy, fontWeight: '700' }}
                onPress={() => setProductModalVisible(false)}
              />
              <Button
                title={editingProductId ? 'Save changes' : 'Add Listing'}
                style={[styles.saveBtn, { backgroundColor: colors.navy }]}
                textStyle={{ color: '#FFFFFF', fontWeight: '800' }}
                onPress={handleSaveProduct}
              />
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
    backgroundColor: '#FAF9F5', // Warm Beige Background
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
    fontFamily: 'PlusJakartaSans-Bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.gold || '#A8824B',
  },
  tabLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  tabLabelActive: {
    color: colors.navy,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F5',
  },
  content: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    padding: spacing.lg,
  },
  welcomeText: {
    ...typography.h3,
    color: colors.navy,
    marginBottom: spacing.md,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    padding: spacing.md,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12, // rounded square look fits premium dashboards
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardValue: {
    ...typography.hero,
    color: colors.navy,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  bannerInfo: {
    backgroundColor: '#FFFDF5', // Soft golden tint background toast
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bannerText: {
    flex: 1,
    ...typography.caption,
    color: '#B45309',
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  listContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderLeftWidth: 4.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  customerName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  orderItems: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginVertical: spacing.xs,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    borderTopWidth: 0.5,
    borderColor: '#F1F5F9',
    paddingTop: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    ...typography.overline,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  orderTotal: {
    ...typography.h3,
    color: colors.textPrimary,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  actionBtn: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnText: {
    ...typography.buttonSmall,
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  productPhotoBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productPhoto: {
    width: '100%',
    height: '100%',
  },
  productEmoji: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  productName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  productCategory: {
    ...typography.overline,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  productPrice: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2.5,
  },
  emptyText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  productsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  productsTitleText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  addProductBtn: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  addProductBtnText: {
    ...typography.buttonSmall,
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  productActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1.2,
    borderRadius: 10,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1.2,
    borderRadius: 10,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    height: '85%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.navy,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  modalForm: {
    flex: 1,
  },
  modalFormContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  modalInputGroup: {
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
  },
  modalInputWrapperError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  modalInput: {
    flex: 1,
    height: 48,
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  modalErrorText: {
    ...typography.caption,
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  modalTextareaWrapper: {
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
  },
  modalTextarea: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: spacing.sm,
    borderWidth: 0,
    outlineStyle: 'none',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  pickerBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerBtnActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  pickerBtnText: {
    ...typography.buttonSmall,
    color: colors.navy,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  pickerBtnTextActive: {
    color: '#FFFFFF',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emojiGridItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  emojiGridItemActive: {
    borderColor: colors.gold || '#A8824B',
    backgroundColor: '#FFFBEB',
  },
  emojiTextVal: {
    fontSize: 20,
  },
  modalGalleryRow: {
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
    width: 18,
    height: 18,
    borderRadius: 9,
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
    gap: 2,
  },
  galleryAddText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 1,
  },
});
