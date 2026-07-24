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
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { products as mockProducts } from '../../data/mockData';
import {
  getVendorDashboard,
  getVendorOrders,
  getVendorProducts,
  acceptVendorOrder,
  dispatchVendorOrder,
  deliverVendorOrder,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  uploadProductImages,
} from '../../api/vendor.api';

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

  // States
  const [stats, setStats] = useState({ revenue: 425.50, ordersCount: 2, productsCount: 3 });
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

  const AVAILABLE_EMOJIS = ['🍔', '🍕', '👕', '📱', '👟', '☕', '🎮', '🎁', '🥗', '🍩'];

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
              await withTimeout(deleteVendorProduct(productId), 2000);
              setVendorProducts((prev) => prev.filter((p) => p.id !== productId));
              Alert.alert('Success', 'Listing deleted successfully!');
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
    setUploadedImages(item.images || []);
    setProductModalVisible(true);
  };

  // Save product (create or update)
  const handleSaveProduct = async () => {
    if (!prodName.trim() || !prodPrice.trim()) {
      Alert.alert('Error', 'Name and Price are required.');
      return;
    }

    const priceNum = parseFloat(prodPrice);
    if (isNaN(priceNum)) {
      Alert.alert('Error', 'Please enter a valid price.');
      return;
    }

    setLoading(true);
    const payload = {
      name: prodName,
      price: priceNum,
      categoryId: prodCategory,
      description: prodDescription,
      emoji: prodEmoji,
      images: uploadedImages,
      vendorId: user?.vendorId || 'v_jazari',
    };

    try {
      if (editingProductId) {
        await withTimeout(updateVendorProduct(editingProductId, payload), 2000);
        setVendorProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? { ...p, ...payload } : p))
        );
        Alert.alert('Success', 'Product updated successfully!');
      } else {
        const res = await withTimeout(createVendorProduct(payload), 2000);
        const newId = res.data?.id || `p_mock_${Date.now()}`;
        setVendorProducts((prev) => [{ ...payload, id: newId }, ...prev]);
        Alert.alert('Success', 'Product added successfully!');
      }
      setProductModalVisible(false);
    } catch (e) {
      console.warn('POST/PUT vendor product failed, saving locally.', e.message);
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

  // Upload product image simulator
  const handleUploadImages = async () => {
    setLoading(true);
    const mockImageName = `prod_img_${Math.floor(Math.random() * 9000 + 1000)}.png`;

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: `file:///images/${mockImageName}`,
        name: mockImageName,
        type: 'image/png',
      });

      await withTimeout(uploadProductImages(formData), 2500);
      setUploadedImages((prev) => [...prev, `uploads/${mockImageName}`]);
      Alert.alert('Success', 'Product image uploaded to server!');
    } catch (e) {
      console.warn('POST /api/vendor/products/upload-images failed, saving locally.', e.message);
      setUploadedImages((prev) => [...prev, `uploads/${mockImageName}`]);
      Alert.alert('Success', 'Product image attached (Offline Mode).');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Dashboard Stats, Orders, and Listings
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes] = await withTimeout(
        Promise.all([
          getVendorDashboard(),
          getVendorOrders(),
          getVendorProducts(user?.vendorId || 'v_jazari'),
        ]),
        2500
      );

      if (statsRes.data) setStats(statsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data || []);
      // If productsRes contains seller listings, use it. Otherwise fallback to products matching vendorId
      if (productsRes.data) {
        setVendorProducts(productsRes.data || []);
      } else {
        setVendorProducts(mockProducts.filter((p) => p.vendorId === user?.vendorId || p.vendorId === 'v_jazari'));
      }
    } catch (e) {
      console.warn('GET /api/vendor dashboard endpoints failed, loading offline mocks.', e.message);
      
      // Offline fallback: load mock dashboard metrics
      setStats({
        revenue: 685.90,
        ordersCount: 3,
        productsCount: mockProducts.filter((p) => p.vendorId === user?.vendorId || p.vendorId === 'v_jazari').length || 3
      });

      setOrders([
        {
          id: 'v_ord_1',
          customerName: 'Obinna K.',
          items: '1x Spicy Shawarma, 1x Fresh Orange Juice',
          total: 18.50,
          status: 'Placed',
          date: 'Today, 11:20 AM'
        },
        {
          id: 'v_ord_2',
          customerName: 'Halima S.',
          items: '2x Jollof Rice Premium, 1x Grilled Chicken Wing',
          total: 34.00,
          status: 'Processing',
          date: 'Yesterday, 6:15 PM'
        },
        {
          id: 'v_ord_3',
          customerName: 'Chidi A.',
          items: '1x Jazari special Platter',
          total: 45.00,
          status: 'Dispatched',
          date: 'Jan 22, 2026'
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
      // Offline fallback
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
      case 'Placed': return colors.gold;
      case 'Processing': return colors.navyLight;
      case 'Dispatched': return colors.success;
      case 'Delivered': return colors.textSecondary;
      default: return colors.textSecondary;
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
        <Text style={styles.headerTitle} numberOfLines={1}>Seller Dashboard</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={loadDashboardData}>
          <Text style={styles.refreshText}>🔄</Text>
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
                  <Text style={styles.cardEmoji}>💰</Text>
                  <Text style={styles.cardValue}>${stats.revenue.toFixed(2)}</Text>
                  <Text style={styles.cardLabel}>Total Revenue</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardEmoji}>📦</Text>
                  <Text style={styles.cardValue}>{stats.ordersCount}</Text>
                  <Text style={styles.cardLabel}>Pending Orders</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardEmoji}>🏷️</Text>
                  <Text style={styles.cardValue}>{stats.productsCount}</Text>
                  <Text style={styles.cardLabel}>Active Listings</Text>
                </View>
              </View>

              <View style={styles.bannerInfo}>
                <Text style={styles.bannerText}>💡 Hint: Toggle the Orders tab to update shipping stages and accept bookings from buyers.</Text>
              </View>
            </ScrollView>
          )}

          {activeTab === 'orders' && (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <View style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.customerName}>{item.customerName}</Text>
                    <Text style={styles.orderDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.orderItems}>{item.items}</Text>

                  <View style={styles.orderFooter}>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Status: </Text>
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
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
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📭</Text>
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
                  <Text style={styles.addProductBtnText}>+ Add Product</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={vendorProducts}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                  <View style={styles.productCard}>
                    <View style={styles.productEmojiBox}>
                      <Text style={styles.productEmoji}>{item.emoji || '🎁'}</Text>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productCategory}>{item.categoryId}</Text>
                      <Text style={styles.productPrice}>Price: ${item.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.productActionsRow}>
                      <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEditModal(item)}>
                        <Text style={styles.actionEmoji}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteProduct(item.id)}>
                        <Text style={styles.actionEmoji}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📦</Text>
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
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} contentContainerStyle={styles.modalFormContent}>
              <Text style={styles.fieldLabel}>Product Name</Text>
              <TextInput
                style={styles.modalInput}
                value={prodName}
                onChangeText={setProdName}
                placeholder="Enter product title"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.fieldLabel}>Price ($)</Text>
              <TextInput
                style={styles.modalInput}
                value={prodPrice}
                onChangeText={prodPrice => setProdPrice(prodPrice.replace(/[^0-9.]/g, ''))}
                placeholder="e.g. 19.99"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryPickerRow}>
                {[
                  { id: 'cat_food', name: 'Food' },
                  { id: 'cat_fashion', name: 'Fashion' },
                  { id: 'cat_electronics', name: 'Electronics' }
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.pickerBtn, prodCategory === cat.id && styles.pickerBtnActive]}
                    onPress={() => setProdCategory(cat.id)}
                  >
                    <Text style={[styles.pickerBtnText, prodCategory === cat.id && styles.pickerBtnTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextarea]}
                value={prodDescription}
                onChangeText={setProdDescription}
                placeholder="Enter product description..."
                placeholderTextColor={colors.textSecondary}
                multiline={true}
                numberOfLines={3}
              />

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

              {/* Product Images Upload */}
              <Text style={styles.fieldLabel}>Product Images ({uploadedImages.length})</Text>
              <TouchableOpacity style={styles.modalUploadBtn} onPress={handleUploadImages} activeOpacity={0.8}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadBtnLabel}>Upload Images</Text>
              </TouchableOpacity>
              {uploadedImages.length > 0 && (
                <Text style={styles.uploadedStatus}>✓ {uploadedImages.length} images attached locally</Text>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Cancel" variant="secondary" style={styles.cancelBtn} onPress={() => setProductModalVisible(false)} />
              <Button title={editingProductId ? 'Save changes' : 'Add Listing'} style={styles.saveBtn} onPress={handleSaveProduct} />
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
  refreshText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
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
    borderBottomColor: colors.gold,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    padding: spacing.lg,
  },
  welcomeText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  cardEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  cardValue: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  cardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  bannerInfo: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  bannerText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  listContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
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
    fontSize: 14,
  },
  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  orderItems: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    borderTopWidth: 0.5,
    borderColor: colors.border,
    paddingTop: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  orderTotal: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: colors.navy,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  actionBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  productEmojiBox: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 13,
  },
  productCategory: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  productPrice: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingBadgeText: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
    fontSize: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
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
  },
  addProductBtn: {
    backgroundColor: colors.navy,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  addProductBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  productActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 14,
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
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  modalCloseIcon: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  modalForm: {
    flex: 1,
  },
  modalFormContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -4,
  },
  modalInput: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.textPrimary,
  },
  modalTextarea: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: spacing.sm,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickerBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerBtnActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  pickerBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
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
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiGridItemActive: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '10',
  },
  emojiTextVal: {
    fontSize: 20,
  },
  modalUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  uploadIcon: {
    fontSize: 16,
  },
  uploadBtnLabel: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    fontSize: 13,
  },
  uploadedStatus: {
    ...typography.caption,
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
    marginTop: -4,
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
