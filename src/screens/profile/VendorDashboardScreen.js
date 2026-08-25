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
  Switch,
} from 'react-native';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { products as mockProducts, categories as mockCategories } from '../../data/mockData';
import * as DocumentPicker from 'expo-document-picker';
import { getMyStore } from '../../api/stores.api';
import {
  getStoreProducts,
  createMyStoreProduct,
  updateProduct as updateStoreProductApi,
  toggleProductStatus as toggleProductStatusApi,
  getStoreActivities,
  deleteProduct as deleteStoreProductApi,
} from '../../api/products.api';
import { getLocalActivities, logLocalActivity } from '../../utils/activityStorage';
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
  Plus,
  House,
  Storefront,
  History,
  User,
  Eye,
  Check,
  Star,
  ShoppingBag,
} from 'phosphor-react-native';

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function VendorDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Determine active store identity based on logged in user email
  const getInitialStore = (email) => {
    const e = (email || '').toLowerCase();
    if (e.includes('jazari')) {
      return {
        id: 2,
        name: 'Jazari Restaurant',
        description: 'Authentic gourmet dining & meal platters',
        address: '45 Gourmet Way',
        phone: '+1-800-555-0211',
        category: 'Restaurant & Food',
        rating: 4.7,
      };
    }
    if (e.includes('apple')) {
      return {
        id: 3,
        name: 'Apple Official Store',
        description: 'Premium electronics, iPhones, and MacBooks',
        address: '1 Apple Park Way',
        phone: '+1-800-555-0300',
        category: 'Electronics',
        rating: 4.9,
      };
    }
    // Default to Nike Store (Store ID 1)
    return {
      id: 1,
      name: 'Nike Store',
      description: 'Official Nike footwear and activewear flagship store',
      address: '102 Sports Boulevard',
      phone: '+1-800-555-0199',
      category: 'Fashion & Apparel',
      rating: 4.8,
    };
  };

  // Portal Navigation Tabs: 'products' (default), 'dashboard', 'preview', 'history', 'store', 'profile'
  const [portalTab, setPortalTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const [storeInfo, setStoreInfo] = useState(() => getInitialStore(user?.email));

  // Product sub-filter: 'all', 'active', 'inactive'
  const [productFilter, setProductFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Main Lists
  const [productsList, setProductsList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Product Edit Modal States
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscountPrice, setProdDiscountPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('cat_fashion');
  const [prodDescription, setProdDescription] = useState('');
  const [prodStock, setProdStock] = useState('20');
  const [prodEmoji, setProdEmoji] = useState('🎁');
  const [prodActive, setProdActive] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Dedicated View Product Detail Modal States
  const [viewProductModalVisible, setViewProductModalVisible] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Form Validation Errors
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');

  // Store Edit Modal
  const [editStoreModalVisible, setEditStoreModalVisible] = useState(false);
  const [editStoreName, setEditStoreName] = useState('');
  const [editStoreDesc, setEditStoreDesc] = useState('');
  const [editStorePhone, setEditStorePhone] = useState('');
  const [editStoreAddress, setEditStoreAddress] = useState('');

  // Mock Products strictly scoped by store ID
  const getMockProductsForStore = (sId) => {
    const allStoreCatalog = [
      // Store 1: Nike Store
      {
        id: 1,
        storeId: 1,
        name: 'Air Max 2026',
        price: 8999.0,
        oldPrice: 9999.0,
        discountPrice: 7999.0,
        stockQuantity: 20,
        active: true,
        emoji: '👟',
        categoryId: 'cat_fashion',
        description: 'Next-gen cushioned running shoes with enhanced mesh upper',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400']
      },
      {
        id: 2,
        storeId: 1,
        name: 'Nike Dri-FIT T-Shirt',
        price: 1499.0,
        oldPrice: 1999.0,
        discountPrice: 1299.0,
        stockQuantity: 50,
        active: true,
        emoji: '👕',
        categoryId: 'cat_fashion',
        description: 'Breathable performance training t-shirt',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400']
      },
      {
        id: 3,
        storeId: 1,
        name: 'Nike Heritage Backpack',
        price: 2499.0,
        oldPrice: 2999.0,
        discountPrice: 2199.0,
        stockQuantity: 0,
        active: false,
        emoji: '🎒',
        categoryId: 'cat_fashion',
        description: 'Durable everyday storage bag with padded shoulder straps',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400']
      },

      // Store 2: Jazari Restaurant
      {
        id: 4,
        storeId: 2,
        name: 'Jazari Special Meal Platter',
        price: 450.0,
        oldPrice: 500.0,
        discountPrice: 400.0,
        stockQuantity: 100,
        active: true,
        emoji: '🍔',
        categoryId: 'cat_food',
        description: 'Chef signature gourmet platter with grilled chicken and side salad',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400']
      },
      {
        id: 5,
        storeId: 2,
        name: 'Fresh Citrus Smoothie',
        price: 120.0,
        oldPrice: 150.0,
        discountPrice: 110.0,
        stockQuantity: 80,
        active: true,
        emoji: '🥤',
        categoryId: 'cat_food',
        description: '100% natural cold pressed orange and passionfruit smoothie',
        imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
        images: ['https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400']
      },

      // Store 3: Apple Official Store
      {
        id: 6,
        storeId: 3,
        name: 'iPhone 15 Pro Max',
        price: 119900.0,
        oldPrice: 129900.0,
        discountPrice: 114900.0,
        stockQuantity: 15,
        active: true,
        emoji: '📱',
        categoryId: 'cat_electronics',
        description: 'Titanium design with A17 Pro chip and 48MP camera system',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400']
      }
    ];

    return allStoreCatalog.filter((p) => p.storeId === sId);
  };

  // Load Store-Specific Data
  const loadPortalData = useCallback(async () => {
    setLoading(true);
    const userEmail = user?.email || 'nike@store.com';
    const activeStore = getInitialStore(userEmail);
    setStoreInfo(activeStore);

    // 1. Fetch Store Profile from Backend
    try {
      const storeRes = await withTimeout(getMyStore(userEmail), 2000);
      if (storeRes.data) {
        setStoreInfo(storeRes.data);
      }
    } catch (e) {
      console.warn('GET my-store failed, using default store identity.', e.message);
    }

    // 2. Fetch Store Products STRICTLY for this store ID
    const currentStoreId = activeStore.id;
    try {
      const prodRes = await withTimeout(getStoreProducts(currentStoreId), 2000);
      if (prodRes.data && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
        setProductsList(prodRes.data);
      } else {
        setProductsList(getMockProductsForStore(currentStoreId));
      }
    } catch (e) {
      console.warn(`GET store ${currentStoreId} products failed, loading store mock products.`, e.message);
      setProductsList(getMockProductsForStore(currentStoreId));
    }

    // 3. Fetch Activity Logs
    try {
      const actRes = await withTimeout(getStoreActivities(userEmail), 2000);
      if (actRes.data && Array.isArray(actRes.data)) {
        setActivityLogs(actRes.data.filter((a) => !a.storeId || a.storeId === currentStoreId));
      } else {
        const localLogs = await getLocalActivities();
        setActivityLogs(localLogs);
      }
    } catch (e) {
      console.warn('GET activities failed, using local storage.', e.message);
      const localLogs = await getLocalActivities();
      setActivityLogs(localLogs);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  // Helper Metrics Calculations
  const totalProductsCount = productsList.length;
  const activeProductsCount = productsList.filter((p) => p.active !== false).length;
  const outOfStockCount = productsList.filter((p) => (p.stockQuantity ?? p.stock ?? 0) === 0).length;

  // Toggle Active / Inactive Soft Removal
  const handleToggleActiveStatus = async (product) => {
    const nextState = !product.active;
    const actionName = nextState ? 'Product Activated' : 'Product Deactivated';
    const detailMsg = nextState
      ? 'Status changed to Active (Visible in Customer App)'
      : 'Status changed to Inactive (Hidden from Customer App)';

    // Optimistic UI update
    setProductsList((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, active: nextState } : p))
    );

    try {
      await withTimeout(toggleProductStatusApi(product.id, nextState), 2000);
    } catch (e) {
      if (e.response && e.response.status === 403) {
        Alert.alert('403 Forbidden ❌', 'Access Denied: You do not own this product!');
        setProductsList((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, active: product.active } : p))
        );
        return;
      }
      console.warn('API toggle failed, updating locally.', e.message);
    }

    // Record activity log
    const updatedLogs = await logLocalActivity(product.name, actionName, detailMsg);
    setActivityLogs(updatedLogs);

    Alert.alert(
      nextState ? 'Product Activated 🟢' : 'Product Deactivated 🔴',
      nextState
        ? `"${product.name}" is now live and visible to customers on your storefront.`
        : `"${product.name}" is hidden from customers, but safely saved in your store portal.`
    );
  };

  // Delete Product Handler with 403 Forbidden checks
  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Delete Product 🗑️',
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic UI update
            setProductsList((prev) => prev.filter((p) => p.id !== product.id));

            try {
              await withTimeout(deleteStoreProductApi(product.id, user?.email || 'nike@store.com'), 2000);
            } catch (e) {
              if (e.response && e.response.status === 403) {
                Alert.alert('403 Forbidden ❌', 'Access Denied: You do not own this product!');
                setProductsList((prev) => [product, ...prev]);
                return;
              }
              console.warn('API delete failed, removing locally.', e.message);
            }

            // Log Activity
            const updatedLogs = await logLocalActivity(product.name, 'Product Removed', 'Product listing deleted from store');
            setActivityLogs(updatedLogs);

            Alert.alert('Product Deleted 🗑️', `"${product.name}" has been removed from your store.`);
          },
        },
      ]
    );
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice('');
    setProdDiscountPrice('');
    setProdCategory((storeInfo?.id === 2 ? 'cat_food' : storeInfo?.id === 3 ? 'cat_electronics' : 'cat_fashion'));
    setProdDescription('');
    setProdStock('20');
    setProdEmoji((storeInfo?.id === 2 ? '🍔' : storeInfo?.id === 3 ? '📱' : '👟'));
    setProdActive(true);
    setUploadedImages([]);
    setNameError('');
    setPriceError('');
    setProductModalVisible(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (product) => {
    setViewProductModalVisible(false);
    setEditingProduct(product);
    setProdName(product.name);
    setProdPrice(String(product.price || ''));
    setProdDiscountPrice(product.discountPrice ? String(product.discountPrice) : '');
    setProdCategory(product.categoryId || 'cat_fashion');
    setProdDescription(product.description || '');
    setProdStock(String(product.stockQuantity ?? product.stock ?? 20));
    setProdEmoji(product.emoji || '🎁');
    setProdActive(product.active !== false);
    setUploadedImages(product.images || (product.imageUrl ? [product.imageUrl] : []));
    setNameError('');
    setPriceError('');
    setProductModalVisible(true);
  };

  // Open View Product Detail Modal
  const handleOpenViewModal = (product) => {
    setViewingProduct(product);
    setViewProductModalVisible(true);
  };

  // Upload Product Images
  const handlePickImages = async () => {
    if (uploadedImages.length >= 5) {
      Alert.alert('Image Limit', 'You can attach up to 5 photos per product.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled || !result.assets) return;

      const newUris = result.assets.map((a) => a.uri);
      setUploadedImages((prev) => [...prev, ...newUris].slice(0, 5));
    } catch (e) {
      console.warn('Image picker error:', e);
      const fallbackUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
      setUploadedImages((prev) => [...prev, fallbackUrl].slice(0, 5));
    }
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Save & Publish Flow with 403 Security handling
  const handleSaveAndPublish = async () => {
    let hasError = false;

    if (!prodName.trim()) {
      setNameError('Product Name is required.');
      hasError = true;
    } else {
      setNameError('');
    }

    const priceNum = parseFloat(prodPrice);
    if (!prodPrice.trim() || isNaN(priceNum) || priceNum <= 0) {
      setPriceError('Please enter a valid price in Naira (₦).');
      hasError = true;
    } else {
      setPriceError('');
    }

    if (hasError) return;

    setLoading(true);
    const discountNum = prodDiscountPrice ? parseFloat(prodDiscountPrice) : null;
    const stockNum = parseInt(prodStock, 10) || 0;

    const payload = {
      storeId: storeInfo?.id,
      name: prodName.trim(),
      price: priceNum,
      discountPrice: discountNum,
      oldPrice: editingProduct ? editingProduct.price : null,
      stockQuantity: stockNum,
      categoryId: prodCategory,
      description: prodDescription.trim(),
      emoji: prodEmoji,
      active: prodActive,
      imageUrl: uploadedImages[0] || null,
      images: uploadedImages,
    };

    let logAction = 'New product added';
    let logDetail = `Price: ₦${priceNum.toLocaleString('en-NG')}`;

    if (editingProduct) {
      const oldP = editingProduct.price;
      if (oldP !== priceNum) {
        logAction = 'Price Updated';
        logDetail = `Price changed ₦${oldP.toLocaleString('en-NG')} → ₦${priceNum.toLocaleString('en-NG')}`;
      } else {
        logAction = 'Product Details Updated';
        logDetail = 'Updated product specs and photo gallery';
      }
    }

    try {
      if (editingProduct) {
        await withTimeout(updateStoreProductApi(editingProduct.id, payload), 2000);
        setProductsList((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
        );
      } else {
        const res = await withTimeout(createMyStoreProduct(payload, user?.email || 'nike@store.com'), 2500);
        const newItem = res.data || { ...payload, id: Date.now() };
        setProductsList((prev) => [newItem, ...prev]);
      }
    } catch (e) {
      if (e.response && e.response.status === 403) {
        Alert.alert('403 Forbidden ❌', 'Access Denied: You do not own this product!');
        setLoading(false);
        return;
      }
      console.warn('API save failed, persisting locally.', e.message);
      if (editingProduct) {
        setProductsList((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
        );
      } else {
        const newItem = { ...payload, id: Date.now() };
        setProductsList((prev) => [newItem, ...prev]);
      }
    } finally {
      setLoading(false);
      setProductModalVisible(false);

      // Save activity history
      const updatedLogs = await logLocalActivity(prodName, logAction, logDetail);
      setActivityLogs(updatedLogs);

      Alert.alert(
        '✅ Product Saved & Published!',
        `Your changes to "${prodName}" are now live and visible to customers on your storefront.`
      );
    }
  };

  // Open Edit Store Modal
  const handleOpenEditStore = () => {
    setEditStoreName((storeInfo?.name || 'My Store'));
    setEditStoreDesc((storeInfo?.description || '') || '');
    setEditStorePhone(storeInfo?.phone || '');
    setEditStoreAddress(storeInfo?.address || '');
    setEditStoreModalVisible(true);
  };

  const handleSaveStoreProfile = () => {
    setStoreInfo((prev) => ({
      ...prev,
      name: editStoreName,
      description: editStoreDesc,
      phone: editStorePhone,
      address: editStoreAddress,
    }));
    setEditStoreModalVisible(false);
    Alert.alert('Store Profile Updated 🏪', 'Store details saved successfully.');
  };

  // Filtered Products for Listing
  const filteredProducts = productsList.filter((p) => {
    if (productFilter === 'active') if (p.active === false) return false;
    if (productFilter === 'inactive') if (p.active !== false) return false;
    if (searchQuery.trim()) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Customer View Active Only Products
  const customerViewProducts = productsList.filter((p) => p.active !== false);

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Top Store Header Bar ────────────────────────────────────────── */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.hdrBackBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#1E293B" weight="bold" />
        </TouchableOpacity>

        <View style={styles.hdrTitleCol}>
          <Text style={styles.hdrStoreTitle} numberOfLines={1}>{storeInfo?.name || 'My Store'}</Text>
          <Text style={styles.hdrSubtitle}>Private Vendor Management Portal</Text>
        </View>

        <TouchableOpacity
          style={styles.hdrPreviewBtn}
          onPress={() => setPortalTab('preview')}
        >
          <Eye size={16} color="#FFFFFF" weight="bold" />
          <Text style={styles.hdrPreviewText}>Live Customer View</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Navigation Bar ─────────────────────────────────────────────── */}
      <View style={styles.navContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          {[
            { key: 'dashboard', label: 'Dashboard', Icon: House },
            { key: 'products', label: `My Products (${productsList.length})`, Icon: Package },
            { key: 'add_product', label: '+ Add Product ➕', Icon: Plus, isAction: true },
            { key: 'preview', label: 'Live Customer View 👁️', Icon: Eye },
            { key: 'history', label: 'Change History', Icon: History },
            { key: 'store', label: 'My Store Info', Icon: Storefront },
            { key: 'profile', label: 'Account', Icon: User },
          ].map((item) => {
            const isActive = portalTab === item.key;
            const TabIcon = item.Icon;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.navItem, isActive && styles.navItemActive, item.isAction && { backgroundColor: '#10B981' }]}
                onPress={() => {
                  if (item.isAction) {
                    handleOpenAddModal();
                  } else {
                    setPortalTab(item.key);
                  }
                }}
                activeOpacity={0.8}
              >
                <TabIcon size={16} color={item.isAction ? '#FFFFFF' : (isActive ? '#FFFFFF' : '#94A3B8')} weight={isActive || item.isAction ? 'fill' : 'regular'} />
                <Text style={[styles.navItemText, (isActive || item.isAction) && styles.navItemTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── Main Portal Content ─────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#1E293B" />
        </View>
      ) : (
        <View style={styles.mainContent}>
          {/* ─── 1. DASHBOARD VIEW ────────────────────────────────────────── */}
          {portalTab === 'dashboard' && (
            <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
              {/* Welcome Card */}
              <View style={styles.welcomeBanner}>
                <Text style={styles.welcomeTitle}>Welcome, {(storeInfo?.name || 'My Store')} 👋</Text>
                <Text style={styles.welcomeSubtitle}>
                  You are managing <Text style={{ fontWeight: '800', color: '#1E293B' }}>{(storeInfo?.name || 'My Store')}</Text>. Only your store's products are displayed here.
                </Text>
              </View>

              {/* Metric Cards */}
              <Text style={styles.sectionHeading}>STORE PRODUCTS OVERVIEW</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Package size={22} color="#2563EB" weight="fill" />
                  </View>
                  <Text style={styles.metricVal}>{totalProductsCount}</Text>
                  <Text style={styles.metricLabel}>Total Products</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: '#DCFCE7' }]}>
                    <CheckCircle size={22} color="#16A34A" weight="fill" />
                  </View>
                  <Text style={styles.metricVal}>{activeProductsCount}</Text>
                  <Text style={styles.metricLabel}>Active (Live)</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: '#FEE2E2' }]}>
                    <Clock size={22} color="#DC2626" weight="fill" />
                  </View>
                  <Text style={styles.metricVal}>{outOfStockCount}</Text>
                  <Text style={styles.metricLabel}>Out of Stock</Text>
                </View>
              </View>

              {/* Recent Updates Snippet */}
              <View style={styles.recentUpdatesSection}>
                <View style={styles.recentHeaderRow}>
                  <Text style={styles.sectionHeading}>RECENT CHANGES MADE</Text>
                  <TouchableOpacity onPress={() => setPortalTab('history')}>
                    <Text style={styles.viewAllText}>View All Log →</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.recentCardList}>
                  {activityLogs.slice(0, 4).map((act, idx) => (
                    <View key={act.id || idx} style={styles.recentRow}>
                      <View style={styles.recentIconCircle}>
                        <Clock size={16} color="#1E293B" weight="bold" />
                      </View>
                      <View style={styles.recentTextCol}>
                        <Text style={styles.recentProdName}>{act.productName || 'Product'}</Text>
                        <Text style={styles.recentDetails}>{act.actionType} • {act.details}</Text>
                      </View>
                      <Text style={styles.recentTime}>{act.date || 'Today'}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Quick Actions Row */}
              <View style={styles.quickActionsRow}>
                <TouchableOpacity style={styles.quickAddBtn} onPress={handleOpenAddModal} activeOpacity={0.85}>
                  <Plus size={18} color="#FFFFFF" weight="bold" />
                  <Text style={styles.quickAddBtnText}>+ Add Product to {(storeInfo?.name || 'My Store')}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* ─── 2. MY PRODUCTS VIEW (STRICT STORE SCOPING) ────────────────── */}
          {portalTab === 'products' && (
            <View style={{ flex: 1 }}>
              {/* Product Sub-filter & Search Bar */}
              <View style={styles.prodFilterHeader}>
                <View style={styles.searchWrapper}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder={`Search in ${(storeInfo?.name || 'My Store')}...`}
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                <TouchableOpacity style={styles.addProductBtn} onPress={handleOpenAddModal}>
                  <Plus size={16} color="#FFFFFF" weight="bold" />
                  <Text style={styles.addProductBtnText}>Add Product</Text>
                </TouchableOpacity>
              </View>

              {/* Filter Chips (All | Active | Inactive) */}
              <View style={styles.chipsRow}>
                {[
                  { key: 'all', label: `All Products (${productsList.length})` },
                  { key: 'active', label: `Active (${activeProductsCount})` },
                  { key: 'inactive', label: `Inactive (${productsList.length - activeProductsCount})` },
                ].map((chip) => (
                  <TouchableOpacity
                    key={chip.key}
                    style={[styles.chipBtn, productFilter === chip.key && styles.chipBtnActive]}
                    onPress={() => setProductFilter(chip.key)}
                  >
                    <Text style={[styles.chipText, productFilter === chip.key && styles.chipTextActive]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Products List (ONLY THIS STORE'S PRODUCTS) */}
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.productListContent}
                renderItem={({ item }) => {
                  const isActive = item.active !== false;
                  return (
                    <View style={[styles.prodCard, !isActive && styles.prodCardInactive]}>
                      {/* Product Image / Emoji */}
                      <View style={styles.prodPhotoBox}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={styles.prodPhoto} resizeMode="cover" />
                        ) : (
                          <Text style={styles.prodEmoji}>{item.emoji || '🎁'}</Text>
                        )}
                      </View>

                      {/* Info Column */}
                      <View style={styles.prodDetailsCol}>
                        <View style={styles.prodHeaderRow}>
                          <Text style={styles.prodTitle} numberOfLines={1}>{item.name}</Text>
                          <View style={[styles.statusTag, isActive ? styles.statusTagActive : styles.statusTagInactive]}>
                            <Text style={[styles.statusTagText, isActive ? styles.statusTagTextActive : styles.statusTagTextInactive]}>
                              {isActive ? 'Active' : 'Inactive'}
                            </Text>
                          </View>
                        </View>

                        {/* Price Row in Naira */}
                        <View style={styles.prodPriceRow}>
                          <Text style={styles.prodPriceVal}>₦{Number(item.price).toLocaleString('en-NG')}</Text>
                          {item.oldPrice && (
                            <Text style={styles.prodOldPrice}>₦{Number(item.oldPrice).toLocaleString('en-NG')}</Text>
                          )}
                          <Text style={styles.prodStockText}>Stock: {item.stockQuantity ?? item.stock ?? 20} units</Text>
                        </View>

                        {/* Actions Row ([View] | [Edit / Update Price] | [Delete] | Active Toggle) */}
                        <View style={styles.prodCardActions}>
                          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                            <TouchableOpacity style={styles.viewActionBtn} onPress={() => handleOpenViewModal(item)}>
                              <Eye size={13} color="#FFFFFF" weight="bold" />
                              <Text style={styles.viewActionText}>View</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.editActionBtn} onPress={() => handleOpenEditModal(item)}>
                              <PencilSimple size={13} color="#1E293B" weight="bold" />
                              <Text style={styles.editActionText}>Edit / Price</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteActionBtn} onPress={() => handleDeleteProduct(item)}>
                              <Trash size={13} color="#DC2626" weight="bold" />
                              <Text style={styles.deleteActionText}>Delete</Text>
                            </TouchableOpacity>
                          </View>

                          {/* Soft Toggle Active / Inactive Switch */}
                          <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>{isActive ? 'Visible' : 'Hidden'}</Text>
                            <Switch
                              value={isActive}
                              onValueChange={() => handleToggleActiveStatus(item)}
                              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                              thumbColor="#FFFFFF"
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Package size={48} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>No Products Found for {(storeInfo?.name || 'My Store')}</Text>
                    <Text style={styles.emptySub}>Click "+ Add Product" above to create your store's first listing.</Text>
                  </View>
                }
              />
            </View>
          )}

          {/* ─── 3. LIVE CUSTOMER VIEW PREVIEW TAB ────────────────────────── */}
          {portalTab === 'preview' && (
            <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.previewNoticeCard}>
                <Eye size={20} color="#2563EB" weight="fill" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.previewNoticeTitle}>Live Customer View Preview</Text>
                  <Text style={styles.previewNoticeSub}>
                    This is exactly how buyers view <Text style={{ fontWeight: '800' }}>{(storeInfo?.name || 'My Store')}</Text> in the e-commerce app. Inactive products are hidden here.
                  </Text>
                </View>
              </View>

              {/* Customer Storefront Card */}
              <View style={styles.customerStoreCard}>
                <View style={styles.customerHeaderBanner}>
                  <View style={styles.storeAvatarBox}>
                    <Storefront size={28} color="#1E293B" weight="bold" />
                  </View>
                  <View style={styles.customerStoreInfo}>
                    <Text style={styles.customerStoreName}>{(storeInfo?.name || 'My Store')}</Text>
                    <View style={styles.ratingRow}>
                      <Star size={14} color="#F59E0B" weight="fill" />
                      <Text style={styles.ratingText}>{storeInfo?.rating || 4.8} (120+ Shopper Reviews)</Text>
                    </View>
                    <Text style={styles.customerStoreDesc}>{(storeInfo?.description || '')}</Text>
                  </View>
                </View>

                {/* Catalog Listing */}
                <View style={styles.customerCatalogBody}>
                  <Text style={styles.catalogHeading}>LIVE STORE CATALOG ({customerViewProducts.length} Active Items)</Text>
                  
                  <View style={styles.customerGrid}>
                    {customerViewProducts.map((p) => (
                      <View key={p.id} style={styles.customerItemCard}>
                        <View style={styles.custPhotoFrame}>
                          {p.imageUrl ? (
                            <Image source={{ uri: p.imageUrl }} style={styles.custImg} resizeMode="cover" />
                          ) : (
                            <Text style={{ fontSize: 32 }}>{p.emoji || '🎁'}</Text>
                          )}
                        </View>
                        <Text style={styles.custTitle} numberOfLines={1}>{p.name}</Text>
                        <Text style={styles.custPrice}>₦{Number(p.price).toLocaleString('en-NG')}</Text>
                        <TouchableOpacity style={styles.custBuyBtn} activeOpacity={0.8}>
                          <ShoppingBag size={12} color="#FFFFFF" weight="bold" />
                          <Text style={styles.custBuyBtnText}>Add to Cart</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* ─── 4. CHANGE HISTORY LOG VIEW ───────────────────────────────── */}
          {portalTab === 'history' && (
            <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeading}>CHANGE HISTORY LOG</Text>
              <Text style={styles.historySub}>
                Audit timeline of every price change, new listing, and status toggle for {(storeInfo?.name || 'My Store')}.
              </Text>

              <View style={styles.historyTimeline}>
                {activityLogs.map((log, index) => (
                  <View key={log.id || index} style={styles.timelineRow}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineCard}>
                      <View style={styles.timelineHeader}>
                        <Text style={styles.timelineProdName}>{log.productName || 'Product Change'}</Text>
                        <Text style={styles.timelineDate}>{log.date || 'Just Now'}</Text>
                      </View>
                      <View style={styles.timelineBadgeRow}>
                        <View style={styles.actionTagPill}>
                          <Text style={styles.actionTagText}>{log.actionType}</Text>
                        </View>
                      </View>
                      <Text style={styles.timelineDetails}>{log.details}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* ─── 5. MY STORE INFO VIEW ────────────────────────────────────── */}
          {portalTab === 'store' && (
            <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeading}>STORE DETAILS</Text>

              <View style={styles.storeCard}>
                <View style={styles.storeHeaderRow}>
                  <Text style={styles.storeCardTitle}>{(storeInfo?.name || 'My Store')}</Text>
                  <TouchableOpacity style={styles.storeEditBtn} onPress={handleOpenEditStore}>
                    <PencilSimple size={16} color="#1E293B" weight="bold" />
                    <Text style={styles.storeEditBtnText}>Edit Store Info</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.storeDesc}>{(storeInfo?.description || '')}</Text>

                <View style={styles.storeDetailRow}>
                  <Text style={styles.storeDetailLabel}>Category:</Text>
                  <Text style={styles.storeDetailVal}>{storeInfo?.category || 'General'}</Text>
                </View>

                <View style={styles.storeDetailRow}>
                  <Text style={styles.storeDetailLabel}>Address:</Text>
                  <Text style={styles.storeDetailVal}>{storeInfo?.address || 'Not set'}</Text>
                </View>

                <View style={styles.storeDetailRow}>
                  <Text style={styles.storeDetailLabel}>Contact Phone:</Text>
                  <Text style={styles.storeDetailVal}>{storeInfo?.phone || 'Not set'}</Text>
                </View>

                <TouchableOpacity
                  style={styles.previewStorefrontCardBtn}
                  onPress={() => setPortalTab('preview')}
                >
                  <Eye size={18} color="#FFFFFF" weight="bold" />
                  <Text style={styles.previewStorefrontCardBtnText}>View Customer Store Page</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* ─── 6. ACCOUNT PROFILE VIEW ─────────────────────────────────── */}
          {portalTab === 'profile' && (
            <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeading}>STORE OWNER ACCOUNT</Text>

              <View style={styles.profileBox}>
                <Text style={styles.profileName}>{user?.fullName || user?.name || 'Store Owner'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'nike@store.com'}</Text>
                <Text style={styles.profileRole}>Managed Store: {(storeInfo?.name || 'My Store')}</Text>

                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                  <Text style={styles.logoutBtnText}>Sign Out of Vendor Portal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* ─── DEDICATED VIEW PRODUCT DETAIL MODAL ─────────────────────────── */}
      <Modal visible={viewProductModalVisible} animationType="slide" transparent onRequestClose={() => setViewProductModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Product Details</Text>
              <TouchableOpacity onPress={() => setViewProductModalVisible(false)}>
                <X size={22} color="#1E293B" weight="bold" />
              </TouchableOpacity>
            </View>

            {viewingProduct && (
              <ScrollView style={styles.modalFormContent} showsVerticalScrollIndicator={false}>
                <View style={styles.viewHeroBox}>
                  {viewingProduct.imageUrl ? (
                    <Image source={{ uri: viewingProduct.imageUrl }} style={styles.viewHeroImg} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 56 }}>{viewingProduct.emoji || '🎁'}</Text>
                  )}
                </View>

                <View style={styles.viewTitleRow}>
                  <Text style={styles.viewProdTitle}>{viewingProduct.name}</Text>
                  <View style={[styles.statusTag, viewingProduct.active !== false ? styles.statusTagActive : styles.statusTagInactive]}>
                    <Text style={[styles.statusTagText, viewingProduct.active !== false ? styles.statusTagTextActive : styles.statusTagTextInactive]}>
                      {viewingProduct.active !== false ? 'Active 🟢' : 'Inactive 🔴'}
                    </Text>
                  </View>
                </View>

                <View style={styles.viewMetaGrid}>
                  <View style={styles.viewMetaBox}>
                    <Text style={styles.viewMetaLabel}>Price (Naira)</Text>
                    <Text style={styles.viewMetaVal}>₦{Number(viewingProduct.price).toLocaleString('en-NG')}</Text>
                  </View>

                  {viewingProduct.discountPrice && (
                    <View style={styles.viewMetaBox}>
                      <Text style={styles.viewMetaLabel}>Discount Price</Text>
                      <Text style={[styles.viewMetaVal, { color: '#16A34A' }]}>₦{Number(viewingProduct.discountPrice).toLocaleString('en-NG')}</Text>
                    </View>
                  )}

                  <View style={styles.viewMetaBox}>
                    <Text style={styles.viewMetaLabel}>Stock Available</Text>
                    <Text style={styles.viewMetaVal}>{viewingProduct.stockQuantity ?? viewingProduct.stock ?? 20} units</Text>
                  </View>
                </View>

                <View style={styles.viewDescBox}>
                  <Text style={styles.viewDescHeading}>Description & Specs</Text>
                  <Text style={styles.viewDescText}>{viewingProduct.description || 'No detailed description specified.'}</Text>
                </View>

                <TouchableOpacity
                  style={styles.publishBtn}
                  onPress={() => handleOpenEditModal(viewingProduct)}
                  activeOpacity={0.85}
                >
                  <PencilSimple size={18} color="#FFFFFF" weight="bold" />
                  <Text style={styles.publishBtnText}>Edit This Product</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── ADD / EDIT PRODUCT MODAL ────────────────────────────────────── */}
      <Modal visible={productModalVisible} animationType="slide" transparent onRequestClose={() => setProductModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingProduct ? `Edit Product (${(storeInfo?.name || 'My Store')})` : `Add Product to ${(storeInfo?.name || 'My Store')}`}</Text>
              <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                <X size={22} color="#1E293B" weight="bold" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalFormContent} showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Product Name *</Text>
                <TextInput
                  style={[styles.inputWrapper, nameError ? styles.inputError : null]}
                  value={prodName}
                  onChangeText={(val) => {
                    setProdName(val);
                    if (val.trim()) setNameError('');
                  }}
                  placeholder="e.g. Air Max 2026"
                  placeholderTextColor="#94A3B8"
                />
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </View>

              {/* Price Diff Preview if editing */}
              {editingProduct && prodPrice.trim() && parseFloat(prodPrice) !== editingProduct.price ? (
                <View style={styles.priceDiffCard}>
                  <Text style={styles.priceDiffTitle}>Price Update Preview:</Text>
                  <Text style={styles.priceDiffText}>
                    ₦{editingProduct.price.toLocaleString('en-NG')} → <Text style={{ fontWeight: '800', color: '#16A34A' }}>₦{parseFloat(prodPrice).toLocaleString('en-NG')}</Text>
                  </Text>
                </View>
              ) : null}

              {/* Price & Discount Price */}
              <View style={styles.rowTwoCols}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Price (₦) *</Text>
                  <TextInput
                    style={[styles.inputWrapper, priceError ? styles.inputError : null]}
                    value={prodPrice}
                    onChangeText={(val) => {
                      setProdPrice(val);
                      if (val.trim()) setPriceError('');
                    }}
                    placeholder="e.g. 8999"
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                  />
                  {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Discount Price (₦)</Text>
                  <TextInput
                    style={styles.inputWrapper}
                    value={prodDiscountPrice}
                    onChangeText={setProdDiscountPrice}
                    placeholder="e.g. 7999"
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Stock Quantity */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Stock Quantity</Text>
                <TextInput
                  style={styles.inputWrapper}
                  value={prodStock}
                  onChangeText={setProdStock}
                  placeholder="e.g. 20"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Photos Upload & Preview */}
              <View style={styles.inputGroup}>
                <View style={styles.photoHeaderRow}>
                  <Text style={styles.fieldLabel}>Product Photos (Preview)</Text>
                  <TouchableOpacity style={styles.pickPhotoBtn} onPress={handlePickImages}>
                    <ImageIcon size={16} color="#FFFFFF" weight="bold" />
                    <Text style={styles.pickPhotoText}>+ Add Photos</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoPreviewRow}>
                  {uploadedImages.map((uri, idx) => (
                    <View key={idx} style={styles.previewThumbBox}>
                      <Image source={{ uri }} style={styles.previewThumbImg} resizeMode="cover" />
                      <TouchableOpacity style={styles.removeThumbBtn} onPress={() => handleRemoveImage(idx)}>
                        <X size={12} color="#FFFFFF" weight="bold" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {uploadedImages.length === 0 && (
                    <View style={styles.noImagePlaceholder}>
                      <ImageIcon size={24} color="#94A3B8" />
                      <Text style={styles.noImageText}>No photos attached yet</Text>
                    </View>
                  )}
                </ScrollView>
              </View>

              {/* Status Switch */}
              <View style={styles.statusSwitchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Product Active Status</Text>
                  <Text style={styles.switchSub}>Active products appear immediately on customer storefront.</Text>
                </View>
                <Switch
                  value={prodActive}
                  onValueChange={setProdActive}
                  trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.inputWrapper, { height: 75, textAlignVertical: 'top' }]}
                  value={prodDescription}
                  onChangeText={setProdDescription}
                  placeholder="Enter product details, sizes, or specifications"
                  multiline
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Save & Publish Button */}
              <TouchableOpacity style={styles.publishBtn} onPress={handleSaveAndPublish} activeOpacity={0.85}>
                <Check size={18} color="#FFFFFF" weight="bold" />
                <Text style={styles.publishBtnText}>Save & Publish Changes</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── EDIT STORE INFO MODAL ─────────────────────────────────────── */}
      <Modal visible={editStoreModalVisible} animationType="slide" transparent onRequestClose={() => setEditStoreModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Store Profile</Text>
              <TouchableOpacity onPress={() => setEditStoreModalVisible(false)}>
                <X size={22} color="#1E293B" weight="bold" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalFormContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Store Name</Text>
                <TextInput style={styles.inputWrapper} value={editStoreName} onChangeText={setEditStoreName} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Store Description</Text>
                <TextInput style={[styles.inputWrapper, { height: 60 }]} value={editStoreDesc} onChangeText={setEditStoreDesc} multiline />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Contact Phone</Text>
                <TextInput style={styles.inputWrapper} value={editStorePhone} onChangeText={setEditStorePhone} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Store Address</Text>
                <TextInput style={styles.inputWrapper} value={editStoreAddress} onChangeText={setEditStoreAddress} />
              </View>

              <TouchableOpacity style={styles.publishBtn} onPress={handleSaveStoreProfile}>
                <Text style={styles.publishBtnText}>Save Store Details</Text>
              </TouchableOpacity>
            </ScrollView>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  hdrBackBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hdrTitleCol: {
    flex: 1,
    marginLeft: 8,
  },
  hdrStoreTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  hdrSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  hdrPreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  hdrPreviewText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  navContainer: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
  },
  navScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  navItemActive: {
    backgroundColor: '#334155',
  },
  navItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  navItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
  },
  tabScroll: {
    flex: 1,
    padding: 16,
  },
  welcomeBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  recentUpdatesSection: {
    marginBottom: 20,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  recentCardList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  recentIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  recentProdName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  recentDetails: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  recentTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  quickActionsRow: {
    marginTop: 4,
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  quickAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  prodFilterHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  searchWrapper: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: 13,
    color: '#1E293B',
  },
  addProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 8,
    gap: 6,
  },
  addProductBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipBtnActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  chipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  productListContent: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  prodCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  prodCardInactive: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
  },
  prodPhotoBox: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  prodPhoto: {
    width: '100%',
    height: '100%',
  },
  prodEmoji: {
    fontSize: 36,
  },
  prodDetailsCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  prodHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 6,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTagActive: {
    backgroundColor: '#DCFCE7',
  },
  statusTagInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTagTextActive: {
    color: '#16A34A',
  },
  statusTagTextInactive: {
    color: '#64748B',
  },
  prodPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  prodPriceVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  prodOldPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  prodStockText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 'auto',
  },
  prodCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  viewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  deleteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  previewNoticeCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  previewNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  previewNoticeSub: {
    fontSize: 11,
    color: '#1E3A8A',
    marginTop: 2,
    lineHeight: 16,
  },
  customerStoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  customerHeaderBanner: {
    backgroundColor: '#1E293B',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeAvatarBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerStoreInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerStoreName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  customerStoreDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  customerCatalogBody: {
    padding: 16,
  },
  catalogHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  customerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  customerItemCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  custPhotoFrame: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  custImg: {
    width: '100%',
    height: '100%',
  },
  custTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  custPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  custBuyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },
  custBuyBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  historySub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  historyTimeline: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E293B',
    marginTop: 6,
    marginRight: 10,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineProdName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  timelineDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  timelineBadgeRow: {
    marginTop: 4,
  },
  actionTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  timelineDetails: {
    fontSize: 12,
    color: '#334155',
    marginTop: 6,
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  storeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  storeEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeEditBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  storeDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  storeDetailRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  storeDetailLabel: {
    width: 100,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  storeDetailVal: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
  },
  previewStorefrontCardBtn: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewStorefrontCardBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  profileBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  profileRole: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 6,
  },
  logoutBtn: {
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalFormContent: {
    padding: 16,
  },
  viewHeroBox: {
    height: 180,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 14,
  },
  viewHeroImg: {
    width: '100%',
    height: '100%',
  },
  viewTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewProdTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
  },
  viewMetaGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 12,
    marginBottom: 14,
  },
  viewMetaBox: {
    flex: 1,
  },
  viewMetaLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  viewMetaVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  viewDescBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 16,
  },
  viewDescHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  viewDescText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1E293B',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  photoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  pickPhotoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  photoPreviewRow: {
    flexDirection: 'row',
    gap: 10,
  },
  previewThumbBox: {
    width: 70,
    height: 70,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  previewThumbImg: {
    width: '100%',
    height: '100%',
  },
  removeThumbBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagePlaceholder: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  noImageText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statusSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  switchSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  priceDiffCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  priceDiffTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  priceDiffText: {
    fontSize: 13,
    color: '#047857',
    marginTop: 2,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 10,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
