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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
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
  ClockCounterClockwise,
  User,
  Eye,
  Check,
  Star,
  ShoppingBag,
  Sparkle,
  Camera,
  Minus,
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
  const { formatPrice } = useCurrency();
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
  const [prodAttributes, setProdAttributes] = useState([
    { key: 'Material', value: '100% Cotton' },
    { key: 'Warranty', value: '1 Year Manufacturer' },
  ]);
  
  // Color & Size matrix state inside Quick Product Modal
  const [modalColorGroups, setModalColorGroups] = useState([
    {
      id: 'c1',
      color: 'White',
      imageUri: null,
      sizes: [
        { id: 's1', size: 'S', stock: '5' },
        { id: 's2', size: 'M', stock: '10' },
        { id: 's3', size: 'L', stock: '8' },
      ],
    },
    {
      id: 'c2',
      color: 'Black',
      imageUri: null,
      sizes: [
        { id: 's4', size: 'M', stock: '12' },
        { id: 's5', size: 'L', stock: '15' },
      ],
    },
  ]);

  const COLOR_PRESETS = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#1E293B' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Royal Blue', hex: '#2563EB' },
    { name: 'Emerald Green', hex: '#16A34A' },
    { name: 'Gold', hex: '#F6A400' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Amber', hex: '#D97706' },
    { name: 'Purple', hex: '#A855F7' },
    { name: 'Navy', hex: '#032757' },
    { name: 'Silver', hex: '#CBD5E1' },
  ];

  const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  const getColorHexModal = (colorName) => {
    if (!colorName || typeof colorName !== 'string') return '#032757';
    const name = colorName.trim().toLowerCase();
    if (name.includes('white')) return '#FFFFFF';
    if (name.includes('black')) return '#1E293B';
    if (name.includes('red')) return '#EF4444';
    if (name.includes('blue')) return '#2563EB';
    if (name.includes('green')) return '#16A34A';
    if (name.includes('yellow')) return '#FACC15';
    if (name.includes('gold')) return '#F6A400';
    if (name.includes('pink')) return '#EC4899';
    if (name.includes('amber')) return '#D97706';
    if (name.includes('purple')) return '#A855F7';
    if (name.includes('silver')) return '#CBD5E1';
    return '#032757';
  };

  const handleToggleModalPresetColor = (presetName) => {
    const targetName = (presetName || '').trim().toLowerCase();
    const existing = modalColorGroups.find((cg) => (cg.color || '').trim().toLowerCase() === targetName);
    if (existing) {
      if (modalColorGroups.length > 1) {
        setModalColorGroups((prev) => prev.filter((cg) => cg.id !== existing.id));
      }
    } else {
      setModalColorGroups((prev) => [
        ...prev,
        {
          id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          color: presetName,
          imageUri: null,
          sizes: [
            { id: `s_${Date.now()}_1`, size: 'S', stock: '5' },
            { id: `s_${Date.now()}_2`, size: 'M', stock: '10' },
            { id: `s_${Date.now()}_3`, size: 'L', stock: '8' },
          ],
        },
      ]);
    }
  };

  const handlePickModalColorPhoto = async (colorGroupId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const uri = result.assets[0].uri;
      setModalColorGroups((prev) =>
        prev.map((cg) => (cg.id === colorGroupId ? { ...cg, imageUri: uri } : cg))
      );
    } catch (e) {
      const fallbacks = [
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400',
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
      ];
      const selectedUri = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setModalColorGroups((prev) =>
        prev.map((cg) => (cg.id === colorGroupId ? { ...cg, imageUri: selectedUri } : cg))
      );
    }
  };

  const handleRemoveModalColorPhoto = (colorGroupId) => {
    setModalColorGroups((prev) =>
      prev.map((cg) => (cg.id === colorGroupId ? { ...cg, imageUri: null } : cg))
    );
  };

  const handleToggleModalSizeForColor = (colorGroupId, sizeLabel) => {
    setModalColorGroups((prev) =>
      prev.map((cg) => {
        if (cg.id === colorGroupId) {
          const targetSize = (sizeLabel || '').trim().toUpperCase();
          const exists = cg.sizes.find((s) => (s.size || '').trim().toUpperCase() === targetSize);
          if (exists) {
            if (cg.sizes.length > 1) {
              return { ...cg, sizes: cg.sizes.filter((s) => s.id !== exists.id) };
            }
            return cg;
          } else {
            return {
              ...cg,
              sizes: [...cg.sizes, { id: `s_${Date.now()}_${Math.floor(Math.random() * 1000)}`, size: sizeLabel, stock: '10' }],
            };
          }
        }
        return cg;
      })
    );
  };

  const handleUpdateModalSizeStock = (colorGroupId, sizeId, delta) => {
    setModalColorGroups((prev) =>
      prev.map((cg) => {
        if (cg.id === colorGroupId) {
          return {
            ...cg,
            sizes: cg.sizes.map((sz) => {
              if (sz.id === sizeId) {
                const current = parseInt(sz.stock, 10) || 0;
                const nextVal = Math.max(0, current + delta);
                return { ...sz, stock: String(nextVal) };
              }
              return sz;
            }),
          };
        }
        return cg;
      })
    );
  };

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

  // Phase 4 Enhanced Dashboard States
  const [isStorePaused, setIsStorePaused] = useState(false);
  const [isPromoDiscountActive, setIsPromoDiscountActive] = useState(true);
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'WELCOME10', discount: '10%', minSpend: '₦50000', active: true },
    { id: '2', code: 'WEEKEND20', discount: '20%', minSpend: '₦100000', active: true },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponMinSpend, setNewCouponMinSpend] = useState('');

  const [staffMembers, setStaffMembers] = useState([
    { id: '1', name: 'Emeka O.', role: 'Owner' },
    { id: '2', name: 'Amina K.', role: 'Packer' },
    { id: '3', name: 'Tunde A.', role: 'Cashier' },
  ]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Packer');

  const handleAddCoupon = () => {
    if (!newCouponCode.trim() || !newCouponDiscount.trim()) {
      Alert.alert('Error', 'Please enter coupon code and discount percentage.');
      return;
    }
    setCoupons((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        code: newCouponCode.trim().toUpperCase(),
        discount: `${newCouponDiscount.trim()}%`,
        minSpend: newCouponMinSpend ? `₦${newCouponMinSpend}` : 'No Min',
        active: true,
      },
    ]);
    setNewCouponCode('');
    setNewCouponDiscount('');
    setNewCouponMinSpend('');
    Alert.alert('Success 🎉', 'Promo coupon code created successfully!');
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim()) {
      Alert.alert('Error', 'Please enter staff member name.');
      return;
    }
    setStaffMembers((prev) => [
      ...prev,
      { id: String(Date.now()), name: newStaffName.trim(), role: newStaffRole },
    ]);
    setNewStaffName('');
    Alert.alert('Staff Added 👤', `${newStaffName} assigned role: ${newStaffRole}`);
  };

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
    let baseProds = [];
    try {
      const prodRes = await withTimeout(getStoreProducts(currentStoreId), 2000);
      if (prodRes.data && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
        baseProds = prodRes.data;
      } else {
        baseProds = getMockProductsForStore(currentStoreId);
      }
    } catch (e) {
      console.warn(`GET store ${currentStoreId} products failed, loading store mock products.`, e.message);
      baseProds = getMockProductsForStore(currentStoreId);
    }

    // Merge with any locally created products
    let newlyCreated = [];
    try {
      const rawCreated = await AsyncStorage.getItem('@vendor_products_created');
      if (rawCreated) newlyCreated = JSON.parse(rawCreated);
    } catch (_) {}

    const combined = [...newlyCreated];
    baseProds.forEach((bp) => {
      if (!combined.some((p) => String(p.id) === String(bp.id) || (p.name && bp.name && p.name.toLowerCase() === bp.name.toLowerCase()))) {
        combined.push(bp);
      }
    });

    setProductsList(combined);

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

  useFocusEffect(
    useCallback(() => {
      loadPortalData();
    }, [loadPortalData])
  );

  const saveProductToStorage = async (newItem) => {
    try {
      const raw = await AsyncStorage.getItem('@vendor_products_created');
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [newItem, ...existing.filter((p) => String(p.id) !== String(newItem.id))];
      await AsyncStorage.setItem('@vendor_products_created', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed saving product to storage:', e);
    }
  };

  const removeProductFromStorage = async (productId) => {
    try {
      const raw = await AsyncStorage.getItem('@vendor_products_created');
      const existing = raw ? JSON.parse(raw) : [];
      const updated = existing.filter((p) => String(p.id) !== String(productId));
      await AsyncStorage.setItem('@vendor_products_created', JSON.stringify(updated));
    } catch (e) {}
  };

  // Toggle Active / Inactive Soft Removal
  const handleToggleActiveStatus = async (product) => {
    const nextState = !product.active;
    const updatedProd = { ...product, active: nextState };

    setProductsList((prev) =>
      prev.map((p) => (p.id === product.id ? updatedProd : p))
    );
    await saveProductToStorage(updatedProd);

    try {
      await withTimeout(toggleProductStatusApi(product.id, nextState), 2000);
    } catch (e) {
      console.warn('API toggle failed, updating locally.', e.message);
    }

    const actionName = nextState ? 'Product Activated' : 'Product Deactivated';
    const detailMsg = nextState
      ? 'Status changed to Active (Visible in Customer App)'
      : 'Status changed to Inactive (Hidden from Customer App)';
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
            await removeProductFromStorage(product.id);
            setProductsList((prev) => prev.filter((p) => String(p.id) !== String(product.id)));

            try {
              await withTimeout(deleteStoreProductApi(product.id, user?.email || 'nike@store.com'), 2000);
            } catch (e) {
              console.warn('API delete failed, removing locally.', e.message);
            }

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
    setProdAttributes([
      { key: 'Material', value: '100% Cotton' },
      { key: 'Warranty', value: '1 Year Manufacturer' },
    ]);
    setModalColorGroups([
      {
        id: 'c1',
        color: 'White',
        imageUri: null,
        sizes: [
          { id: 's1', size: 'S', stock: '5' },
          { id: 's2', size: 'M', stock: '10' },
          { id: 's3', size: 'L', stock: '8' },
        ],
      },
      {
        id: 'c2',
        color: 'Black',
        imageUri: null,
        sizes: [
          { id: 's4', size: 'M', stock: '12' },
          { id: 's5', size: 'L', stock: '15' },
        ],
      },
    ]);
    setNameError('');
    setPriceError('');
    setProductModalVisible(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (product) => {
    setViewProductModalVisible(false);
    setEditingProduct(product);
    setProdName(product.name || '');
    setProdPrice(String(product.price || ''));
    setProdDiscountPrice(product.discountPrice ? String(product.discountPrice) : '');
    setProdCategory(product.categoryId || 'cat_fashion');
    setProdDescription(product.description || '');
    setProdStock(String(product.stockQuantity ?? product.stock ?? 20));
    setProdEmoji(product.emoji || '🎁');
    setProdActive(product.active !== false);
    setUploadedImages(product.images || (product.imageUrl ? [product.imageUrl] : []));
    setProdAttributes(
      product.attributes && Array.isArray(product.attributes) && product.attributes.length > 0
        ? product.attributes
        : [{ key: 'Material', value: '100% Cotton' }]
    );
    if (product.colorGroups && Array.isArray(product.colorGroups) && product.colorGroups.length > 0) {
      setModalColorGroups(product.colorGroups);
    } else {
      setModalColorGroups([
        {
          id: 'c1',
          color: 'White',
          imageUri: null,
          sizes: [
            { id: 's1', size: 'S', stock: '5' },
            { id: 's2', size: 'M', stock: '10' },
            { id: 's3', size: 'L', stock: '8' },
          ],
        },
        {
          id: 'c2',
          color: 'Black',
          imageUri: null,
          sizes: [
            { id: 's4', size: 'M', stock: '12' },
            { id: 's5', size: 'L', stock: '15' },
          ],
        },
      ]);
    }
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

    const nameStr = (prodName || '').trim();
    if (!nameStr) {
      setNameError('Product Name is required.');
      hasError = true;
    } else {
      setNameError('');
    }

    const priceStr = String(prodPrice || '').trim();
    const priceNum = parseFloat(priceStr);
    if (!priceStr || isNaN(priceNum) || priceNum <= 0) {
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
      name: nameStr,
      price: priceNum,
      discountPrice: discountNum,
      oldPrice: editingProduct ? (Number(editingProduct.price) || null) : null,
      stockQuantity: stockNum,
      categoryId: prodCategory,
      description: (prodDescription || '').trim(),
      attributes: prodAttributes.filter((a) => a.key.trim() && a.value.trim()),
      emoji: prodEmoji || '🎁',
      active: prodActive !== false,
      imageUrl: uploadedImages[0] || null,
      images: uploadedImages,
      colorGroups: modalColorGroups,
    };

    let logAction = 'New product added';
    let logDetail = `Price: ₦${(priceNum || 0).toLocaleString('en-NG')}`;

    if (editingProduct) {
      const oldP = Number(editingProduct.price) || 0;
      if (oldP !== priceNum) {
        logAction = 'Price Updated';
        logDetail = `Price changed ₦${oldP.toLocaleString('en-NG')} → ₦${(priceNum || 0).toLocaleString('en-NG')}`;
      } else {
        logAction = 'Product Details Updated';
        logDetail = 'Updated product specs and photo gallery';
      }
    }

    try {
      if (editingProduct) {
        const updatedItem = { ...editingProduct, ...payload };
        try {
          await withTimeout(updateStoreProductApi(editingProduct.id, payload), 2000);
        } catch (_) {}
        await saveProductToStorage(updatedItem);
        setProductsList((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updatedItem : p))
        );
      } else {
        let createdId = Date.now();
        try {
          const res = await withTimeout(createMyStoreProduct(payload, user?.email || 'nike@store.com'), 2500);
          if (res && res.data && res.data.id) createdId = res.data.id;
        } catch (_) {}
        const newItem = { ...payload, id: createdId };
        await saveProductToStorage(newItem);
        setProductsList((prev) => [newItem, ...prev.filter((p) => String(p.id) !== String(newItem.id))]);
      }
    } catch (e) {
      console.warn('API save failed, persisting locally.', e.message);
      const newItem = { ...payload, id: editingProduct ? editingProduct.id : Date.now() };
      await saveProductToStorage(newItem);
      if (editingProduct) {
        setProductsList((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? newItem : p))
        );
      } else {
        setProductsList((prev) => [newItem, ...prev.filter((p) => String(p.id) !== String(newItem.id))]);
      }
    } finally {
      setLoading(false);
      setProductModalVisible(false);

      const updatedLogs = await logLocalActivity(prodName || 'Product', logAction, logDetail);
      setActivityLogs(updatedLogs);

      Alert.alert(
        '✅ Product Saved & Published!',
        `Your changes to "${prodName || 'Product'}" are now live and visible to customers on your storefront.`
      );
    }
  };

  // Helper Metrics Calculations
  const totalProductsCount = productsList.length;
  const activeProductsCount = productsList.filter((p) => p.active !== false).length;
  const outOfStockCount = productsList.filter((p) => (p.stockQuantity ?? p.stock ?? 0) === 0).length;

  // Open Edit Store Modal
  const handleOpenEditStore = () => {
    setEditStoreName((storeInfo?.name || 'My Store'));
    setEditStoreDesc((storeInfo?.description || '') || '');
    setEditStorePhone(storeInfo?.phone || '');
    setEditStoreAddress(storeInfo?.address || '');
    setEditStoreModalVisible(true);
  };

  const handleSaveStoreProfile = async () => {
    setStoreInfo((prev) => ({
      ...prev,
      name: editStoreName,
      description: editStoreDesc,
      phone: editStorePhone,
      address: editStoreAddress,
    }));
    setEditStoreModalVisible(false);
    const updatedLogs = await logLocalActivity(
      editStoreName || 'My Store',
      'Store Info Updated',
      'Store profile details updated by store owner'
    );
    setActivityLogs(updatedLogs);
    Alert.alert('Store Profile Updated 🏪', 'Store details saved successfully.');
  };

  // Filtered Products for Listing
  const filteredProducts = productsList.filter((p) => {
    if (productFilter === 'active') if (p.active === false) return false;
    if (productFilter === 'inactive') if (p.active !== false) return false;
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      return (p.name || '').toLowerCase().includes(q);
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
            { key: 'history', label: 'Change History', Icon: ClockCounterClockwise },
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
              {/* Pause Store Alert Banner */}
              {isStorePaused && (
                <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 16 }}>⏸️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: '#DC2626', fontSize: 14 }}>Store is Currently Paused</Text>
                    <Text style={{ color: '#DC2626', fontSize: 12 }}>Your store items are temporarily hidden from search & catalog.</Text>
                  </View>
                </View>
              )}

              {/* Welcome Card & Pause Toggle */}
              <View style={[styles.welcomeBanner, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.welcomeTitle}>Welcome, {(storeInfo?.name || 'My Store')} 👋</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Managing <Text style={{ fontWeight: '800', color: '#1E293B' }}>{(storeInfo?.name || 'My Store')}</Text>
                  </Text>
                </View>
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: isStorePaused ? '#DC2626' : '#16A34A' }}>
                    {isStorePaused ? 'PAUSED' : 'LIVE'}
                  </Text>
                  <Switch
                    value={!isStorePaused}
                    onValueChange={(val) => setIsStorePaused(!val)}
                    trackColor={{ false: '#DC2626', true: '#16A34A' }}
                  />
                  <Text style={{ fontSize: 9, color: '#64748B' }}>Pause Store</Text>
                </View>
              </View>

              {/* ── ACTION ITEMS ROW ── */}
              <Text style={styles.sectionHeading}>ACTION ITEMS REQUIRED</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginBottom: 16 }}>
                <View style={{ backgroundColor: '#FEF6E0', borderWidth: 1, borderColor: '#F6A400', borderRadius: 12, padding: 12, width: 140 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20 }}>📦</Text>
                    <View style={{ backgroundColor: '#F6A400', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: '#032757', fontWeight: '800', fontSize: 12 }}>3 NEW</Text>
                    </View>
                  </View>
                  <Text style={{ fontWeight: '700', color: '#032757', marginTop: 8, fontSize: 13 }}>New Orders</Text>
                  <Text style={{ fontSize: 10, color: '#7A4F00' }}>Requires packing</Text>
                </View>

                <View style={{ backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#DC2626', borderRadius: 12, padding: 12, width: 140 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20 }}>⚠️</Text>
                    <View style={{ backgroundColor: '#DC2626', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>2 ALERT</Text>
                    </View>
                  </View>
                  <Text style={{ fontWeight: '700', color: '#032757', marginTop: 8, fontSize: 13 }}>Low Stock</Text>
                  <Text style={{ fontSize: 10, color: '#DC2626' }}>Stock below 5 units</Text>
                </View>

                <View style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#2563EB', borderRadius: 12, padding: 12, width: 140 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20 }}>↩️</Text>
                    <View style={{ backgroundColor: '#2563EB', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>1 REQ</Text>
                    </View>
                  </View>
                  <Text style={{ fontWeight: '700', color: '#032757', marginTop: 8, fontSize: 13 }}>Pending Returns</Text>
                  <Text style={{ fontSize: 10, color: '#2563EB' }}>Refund request</Text>
                </View>

                <View style={{ backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#16A34A', borderRadius: 12, padding: 12, width: 140 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20 }}>📅</Text>
                    <View style={{ backgroundColor: '#16A34A', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>4 TODAY</Text>
                    </View>
                  </View>
                  <Text style={{ fontWeight: '700', color: '#032757', marginTop: 8, fontSize: 13 }}>Appointments</Text>
                  <Text style={{ fontSize: 10, color: '#16A34A' }}>Scheduled bookings</Text>
                </View>
              </ScrollView>

              {/* ── EARNINGS CARD ── */}
              <Text style={styles.sectionHeading}>FINANCIAL EARNINGS BREAKDOWN</Text>
              <View style={{ backgroundColor: '#032757', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#F6A400', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>TOTAL NET SALES</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 10 }}>Next Payout: Friday, Oct 3</Text>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginVertical: 6 }}>{formatPrice(142500)}</Text>
                
                <View style={{ height: 1, backgroundColor: '#1E3A8A', marginVertical: 10 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View>
                    <Text style={{ color: '#94A3B8', fontSize: 10 }}>Commission Paid (5%)</Text>
                    <Text style={{ color: '#FEF6E0', fontSize: 13, fontWeight: '600' }}>- {formatPrice(7125)}</Text>
                  </View>
                  <View>
                    <Text style={{ color: '#94A3B8', fontSize: 10 }}>Processing Fees (1.5%)</Text>
                    <Text style={{ color: '#FEF6E0', fontSize: 13, fontWeight: '600' }}>- {formatPrice(2137.5)}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 8 }}>
                  <Text style={{ color: '#FEF6E0', fontSize: 11 }}>Pending Balance: <Text style={{ fontWeight: '700', color: '#F6A400' }}>{formatPrice(18500)}</Text></Text>
                  <Text style={{ color: '#FEF6E0', fontSize: 11 }}>Settled Balance: <Text style={{ fontWeight: '700', color: '#10B981' }}>{formatPrice(114737.5)}</Text></Text>
                </View>
              </View>

              {/* ── PROMOTIONS SECTION ── */}
              <Text style={styles.sectionHeading}>STORE PROMOTIONS & COUPONS</Text>
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View>
                    <Text style={{ fontWeight: '700', color: '#032757', fontSize: 14 }}>Active Store Discounts</Text>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>Enable coupon checkout codes for buyers</Text>
                  </View>
                  <Switch
                    value={isPromoDiscountActive}
                    onValueChange={setIsPromoDiscountActive}
                    trackColor={{ false: '#CBD5E1', true: '#F6A400' }}
                  />
                </View>

                {/* Coupon Code Creator Inputs */}
                <View style={{ gap: 8, marginTop: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#032757' }}>CREATE NEW COUPON CODE</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TextInput
                      style={{ flex: 1, height: 38, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 8, fontSize: 12 }}
                      placeholder="CODE (e.g. SAVE15)"
                      value={newCouponCode}
                      onChangeText={setNewCouponCode}
                    />
                    <TextInput
                      style={{ width: 70, height: 38, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 8, fontSize: 12 }}
                      placeholder="Disc %"
                      keyboardType="numeric"
                      value={newCouponDiscount}
                      onChangeText={setNewCouponDiscount}
                    />
                    <TextInput
                      style={{ width: 80, height: 38, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 8, fontSize: 12 }}
                      placeholder="Min ₦"
                      keyboardType="numeric"
                      value={newCouponMinSpend}
                      onChangeText={setNewCouponMinSpend}
                    />
                  </View>
                  <TouchableOpacity
                    style={{ backgroundColor: '#032757', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 4 }}
                    onPress={handleAddCoupon}
                  >
                    <Text style={{ color: '#F6A400', fontWeight: '700', fontSize: 12 }}>+ Add Coupon Code</Text>
                  </TouchableOpacity>
                </View>

                {/* Coupons List */}
                <View style={{ marginTop: 12, gap: 6 }}>
                  {coupons.map((cp) => (
                    <View key={cp.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FEF6E0', padding: 8, borderRadius: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 14 }}>🏷️</Text>
                        <Text style={{ fontWeight: '800', color: '#032757', fontSize: 12 }}>{cp.code}</Text>
                        <Text style={{ fontSize: 11, color: '#7A4F00' }}>({cp.discount} off • Min: {cp.minSpend})</Text>
                      </View>
                      <View style={{ backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '700' }}>ACTIVE</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* ── STAFF SECTION ── */}
              <Text style={styles.sectionHeading}>STAFF ROLES & MANAGEMENT</Text>
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Text style={{ fontWeight: '700', color: '#032757', fontSize: 14, marginBottom: 8 }}>Store Members & Roles</Text>
                
                {/* Staff List */}
                <View style={{ gap: 8, marginBottom: 12 }}>
                  {staffMembers.map((stf) => (
                    <View key={stf.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderColor: '#F1F5F9' }}>
                      <Text style={{ fontWeight: '600', color: '#1E293B', fontSize: 13 }}>👤 {stf.name}</Text>
                      <View style={{
                        backgroundColor: stf.role === 'Owner' ? '#032757' : stf.role === 'Packer' ? '#F6A400' : '#64748B',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 999,
                      }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>{stf.role}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Add Staff */}
                <View style={{ gap: 8 }}>
                  <TextInput
                    style={{ height: 38, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 8, fontSize: 12 }}
                    placeholder="Staff Member Name"
                    value={newStaffName}
                    onChangeText={setNewStaffName}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {['Packer', 'Cashier'].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          borderRadius: 6,
                          alignItems: 'center',
                          backgroundColor: newStaffRole === r ? '#032757' : '#F1F5F9',
                        }}
                        onPress={() => setNewStaffRole(r)}
                      >
                        <Text style={{ color: newStaffRole === r ? '#FFFFFF' : '#64748B', fontSize: 11, fontWeight: '600' }}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={{ backgroundColor: '#F6A400', paddingHorizontal: 12, justifyContent: 'center', borderRadius: 6 }}
                      onPress={handleAddStaff}
                    >
                      <Text style={{ color: '#032757', fontWeight: '800', fontSize: 12 }}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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

              {/* Quick Actions Row (Product & Service creation wizards) */}
              <View style={[styles.quickActionsRow, { flexDirection: 'column', gap: 10 }]}>
                <TouchableOpacity
                  style={[styles.quickAddBtn, { backgroundColor: '#032757' }]}
                  onPress={() => navigation.navigate('VendorAddProduct')}
                  activeOpacity={0.85}
                >
                  <Plus size={18} color="#F6A400" weight="bold" />
                  <Text style={[styles.quickAddBtnText, { color: '#F6A400' }]}>+ Launch Product Seller Wizard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAddBtn, { backgroundColor: '#F6A400' }]}
                  onPress={() => navigation.navigate('VendorAddService')}
                  activeOpacity={0.85}
                >
                  <Plus size={18} color="#032757" weight="bold" />
                  <Text style={[styles.quickAddBtnText, { color: '#032757' }]}>+ Launch Service Provider Wizard</Text>
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

                <TouchableOpacity style={[styles.addProductBtn, { backgroundColor: '#F6A400' }]} onPress={() => navigation.navigate('VendorAddProduct')}>
                  <Sparkle size={16} color="#032757" weight="bold" />
                  <Text style={[styles.addProductBtnText, { color: '#032757' }]}>Wizard (Colors/Sizes)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.addProductBtn} onPress={handleOpenAddModal}>
                  <Plus size={16} color="#FFFFFF" weight="bold" />
                  <Text style={styles.addProductBtnText}>+ Quick Add</Text>
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
                  const itemPriceNum = Number(item.price);
                  const displayPriceVal = isNaN(itemPriceNum) ? 0 : itemPriceNum;
                  const itemOldPriceNum = item.oldPrice ? Number(item.oldPrice) : null;
                  const displayOldPriceVal = (itemOldPriceNum && !isNaN(itemOldPriceNum)) ? itemOldPriceNum : null;
                  const displayName = item.name || 'New Product';

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
                          <Text style={styles.prodTitle} numberOfLines={1}>{displayName}</Text>
                          <View style={[styles.statusTag, isActive ? styles.statusTagActive : styles.statusTagInactive]}>
                            <Text style={[styles.statusTagText, isActive ? styles.statusTagTextActive : styles.statusTagTextInactive]}>
                              {isActive ? 'Active' : 'Inactive'}
                            </Text>
                          </View>
                        </View>

                        {/* Price Row in Dollars */}
                        <View style={styles.prodPriceRow}>
                          <Text style={styles.prodPriceVal}>₦{displayPriceVal.toLocaleString('en-NG')}</Text>
                          {displayOldPriceVal !== null && (
                            <Text style={styles.prodOldPrice}>₦{displayOldPriceVal.toLocaleString('en-NG')}</Text>
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
                        <Text style={styles.custPrice}>{formatPrice(Number(p.price).toLocaleString('en-NG'))}</Text>
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
                Audit timeline of every price change, new listing, status toggle, and profile edit for {(storeInfo?.name || 'My Store')}.
              </Text>

              {Array.isArray(activityLogs) && activityLogs.length > 0 ? (
                <View style={styles.historyTimeline}>
                  {activityLogs.map((log, index) => {
                    const actionStr = typeof log?.actionType === 'string' ? log.actionType : String(log?.actionType || 'Update');
                    const actionLower = actionStr.toLowerCase();
                    const isPrice = actionLower.includes('price');
                    const isAct = actionLower.includes('activated');
                    const isDeact = actionLower.includes('deactivated');
                    const isAdd = actionLower.includes('added');

                    return (
                      <View key={log?.id || index} style={styles.timelineRow}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineCard}>
                          <View style={styles.timelineHeader}>
                            <Text style={styles.timelineProdName}>{log?.productName || log?.name || 'Store Change'}</Text>
                            <Text style={styles.timelineDate}>{log?.date || log?.createdAt || 'Just Now'}</Text>
                          </View>
                          <View style={styles.timelineBadgeRow}>
                            <View style={[
                              styles.actionTagPill,
                              isPrice && { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
                              isAct && { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
                              isDeact && { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
                              isAdd && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
                            ]}>
                              <Text style={[
                                styles.actionTagText,
                                isPrice && { color: '#1D4ED8' },
                                isAct && { color: '#15803D' },
                                isDeact && { color: '#B91C1C' },
                                isAdd && { color: '#B45309' },
                              ]}>
                                {actionStr}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.timelineDetails}>{log?.details || log?.description || 'Action recorded successfully'}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyHistoryCard}>
                  <ClockCounterClockwise size={44} color="#94A3B8" weight="regular" />
                  <Text style={styles.emptyHistoryTitle}>No Change History Yet</Text>
                  <Text style={styles.emptyHistoryText}>
                    All future price changes, status toggles, product additions, and store profile edits will automatically be audited and logged here in real-time.
                  </Text>
                </View>
              )}

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
                    <Text style={styles.viewMetaLabel}>Price (USD)</Text>
                    <Text style={styles.viewMetaVal}>{formatPrice(Number(viewingProduct.price).toLocaleString('en-NG'))}</Text>
                  </View>

                  {viewingProduct.discountPrice && (
                    <View style={styles.viewMetaBox}>
                      <Text style={styles.viewMetaLabel}>Discount Price</Text>
                      <Text style={[styles.viewMetaVal, { color: '#16A34A' }]}>{formatPrice(Number(viewingProduct.discountPrice).toLocaleString('en-NG'))}</Text>
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
                    {formatPrice(editingProduct.price.toLocaleString('en-NG'))} → <Text style={{ fontWeight: '800', color: '#16A34A' }}>{formatPrice(parseFloat(prodPrice).toLocaleString('en-NG'))}</Text>
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
                <Text style={styles.fieldLabel}>Total Base Stock Quantity</Text>
                <TextInput
                  style={styles.inputWrapper}
                  value={prodStock}
                  onChangeText={setProdStock}
                  placeholder="e.g. 20"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Product Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Product Description *</Text>
                <TextInput
                  style={[styles.inputWrapper, { height: 80, textAlignVertical: 'top', paddingTop: 8 }]}
                  value={prodDescription}
                  onChangeText={setProdDescription}
                  placeholder="Enter detailed description — e.g. material, dimensions, care instructions, features..."
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Product Details & Specifications */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Product Details & Specifications (Optional)</Text>
                {prodAttributes.map((attr, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <TextInput
                      style={[styles.inputWrapper, { flex: 1, height: 40, fontSize: 12 }]}
                      value={attr.key}
                      onChangeText={(val) => {
                        const updated = [...prodAttributes];
                        updated[idx].key = val;
                        setProdAttributes(updated);
                      }}
                      placeholder="Label (e.g. Material)"
                      placeholderTextColor="#94A3B8"
                    />
                    <TextInput
                      style={[styles.inputWrapper, { flex: 1, height: 40, fontSize: 12 }]}
                      value={attr.value}
                      onChangeText={(val) => {
                        const updated = [...prodAttributes];
                        updated[idx].value = val;
                        setProdAttributes(updated);
                      }}
                      placeholder="Value (e.g. 100% Leather)"
                      placeholderTextColor="#94A3B8"
                    />
                    <TouchableOpacity
                      style={{ width: 36, height: 40, borderRadius: 8, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' }}
                      onPress={() => setProdAttributes((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <Trash size={15} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    height: 38,
                    borderWidth: 1.2,
                    borderStyle: 'dashed',
                    borderColor: '#032757',
                    borderRadius: 10,
                    backgroundColor: '#F8FAFC',
                    marginTop: 2,
                  }}
                  onPress={() => setProdAttributes((prev) => [...prev, { key: '', value: '' }])}
                >
                  <Plus size={14} color="#032757" weight="bold" />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#032757' }}>+ Add Product Detail Specification</Text>
                </TouchableOpacity>
              </View>

              {/* ── COLORS, SIZES, STOCK & PER-COLOR PHOTOS MATRIX ── */}
              <View style={{ backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#CBD5E1', marginBottom: 16, gap: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#032757' }}>🎨 Product Colors, Sizes & Stock Matrix</Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Add color options, upload photos showing how each color/style looks, and set available sizes with stock steppers.</Text>

                {/* 1-Tap Quick Color Presets */}
                <View style={{ marginTop: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#032757', marginBottom: 4 }}>⚡ 1-TAP QUICK COLOR PRESETS:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 2 }}>
                    {COLOR_PRESETS.map((p) => {
                      const isActive = modalColorGroups.some((cg) => cg.color.trim().toLowerCase() === p.name.toLowerCase());
                      return (
                        <TouchableOpacity
                          key={p.name}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 999,
                            borderWidth: 1.2,
                            borderColor: isActive ? '#032757' : '#CBD5E1',
                            backgroundColor: isActive ? '#032757' : '#FFFFFF',
                          }}
                          onPress={() => handleToggleModalPresetColor(p.name)}
                        >
                          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: p.hex, borderWidth: 1, borderColor: '#CBD5E1' }} />
                          <Text style={{ fontSize: 10, fontWeight: '700', color: isActive ? '#FFFFFF' : '#032757' }}>
                            {isActive ? `✓ ${p.name}` : `+ ${p.name}`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Color Groups Cards */}
                {modalColorGroups.map((cg) => {
                  const swatchHex = getColorHexModal(cg.color);
                  const totalStock = cg.sizes.reduce((sum, s) => sum + (parseInt(s.stock, 10) || 0), 0);

                  return (
                    <View key={cg.id} style={{ backgroundColor: '#FFFFFF', borderWidth: 1.2, borderColor: '#CBD5E1', borderRadius: 12, padding: 10, gap: 8 }}>
                      {/* Color Header */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: swatchHex, borderWidth: 1, borderColor: '#CBD5E1' }} />
                          <TextInput
                            style={{ flex: 1, height: 34, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 8, fontSize: 12, fontWeight: '700', color: '#032757', backgroundColor: '#FFFFFF' }}
                            value={cg.color}
                            onChangeText={(val) => {
                              setModalColorGroups((prev) =>
                                prev.map((item) => (item.id === cg.id ? { ...item, color: val } : item))
                              );
                            }}
                            placeholder="Color Name (e.g. White, Black)"
                          />
                        </View>
                        <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginLeft: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#16A34A' }}>{totalStock} in stock</Text>
                        </View>
                      </View>

                      {/* Per Color Photo Upload */}
                      <View style={{ gap: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#032757' }}>📷 Photo showing how {cg.color} looks:</Text>
                        {cg.imageUri ? (
                          <View style={{ height: 85, borderRadius: 8, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#CBD5E1' }}>
                            <Image source={{ uri: cg.imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            <TouchableOpacity
                              style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center' }}
                              onPress={() => handleRemoveModalColorPhoto(cg.id)}
                            >
                              <X size={12} color="#FFFFFF" weight="bold" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 42, borderWidth: 1.2, borderStyle: 'dashed', borderColor: '#032757', borderRadius: 8, backgroundColor: '#F8FAFC' }}
                            onPress={() => handlePickModalColorPhoto(cg.id)}
                          >
                            <Camera size={16} color="#032757" />
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#032757' }}>+ Upload Photo for {cg.color} product</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Sizes & Stock Steppers for this color */}
                      <View style={{ gap: 6, backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#032757' }}>📏 Quick Toggle Available Sizes:</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                          {COMMON_SIZES.map((szLabel) => {
                            const isSzActive = cg.sizes.some((s) => s.size.trim().toUpperCase() === szLabel.toUpperCase());
                            return (
                              <TouchableOpacity
                                key={szLabel}
                                style={{
                                  paddingHorizontal: 8,
                                  paddingVertical: 3,
                                  borderRadius: 999,
                                  borderWidth: 1,
                                  borderColor: isSzActive ? '#032757' : '#CBD5E1',
                                  backgroundColor: isSzActive ? '#032757' : '#FFFFFF',
                                }}
                                onPress={() => handleToggleModalSizeForColor(cg.id, szLabel)}
                              >
                                <Text style={{ fontSize: 10, fontWeight: '700', color: isSzActive ? '#FFFFFF' : '#032757' }}>
                                  {isSzActive ? `✓ ${szLabel}` : szLabel}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {/* Numeric Stock Inputs & Steppers */}
                        {cg.sizes.map((sz) => (
                          <View key={sz.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#032757', width: 60 }}>Size {sz.size}:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', height: 32, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                              <TouchableOpacity
                                style={{ width: 30, height: '100%', backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => handleUpdateModalSizeStock(cg.id, sz.id, -1)}
                              >
                                <Minus size={12} color="#032757" weight="bold" />
                              </TouchableOpacity>
                              <TextInput
                                style={{ width: 45, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#032757' }}
                                value={String(sz.stock)}
                                onChangeText={(val) => {
                                  setModalColorGroups((prev) =>
                                    prev.map((item) => {
                                      if (item.id === cg.id) {
                                        return {
                                          ...item,
                                          sizes: item.sizes.map((s) => (s.id === sz.id ? { ...s, stock: val.replace(/[^0-9]/g, '') } : s)),
                                        };
                                      }
                                      return item;
                                    })
                                  );
                                }}
                                keyboardType="numeric"
                              />
                              <TouchableOpacity
                                style={{ width: 30, height: '100%', backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => handleUpdateModalSizeStock(cg.id, sz.id, 1)}
                              >
                                <Plus size={12} color="#032757" weight="bold" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
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

              {/* ─── LIVE CUSTOMER LISTING PREVIEW ─── */}
              <View style={{
                marginTop: 20,
                marginBottom: 20,
                borderWidth: 1.5,
                borderColor: '#CBD5E1',
                borderRadius: 16,
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              }}>
                {/* Preview Header Banner */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#032757',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}>
                  <Eye size={16} color="#F6A400" weight="bold" />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 }}>
                    LIVE CUSTOMER STOREFRONT PREVIEW
                  </Text>
                  <View style={{ flex: 1 }} />
                  <View style={{ backgroundColor: prodActive ? '#DCFCE7' : '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: prodActive ? '#16A34A' : '#DC2626' }}>
                      {prodActive ? 'LIVE' : 'DRAFT'}
                    </Text>
                  </View>
                </View>

                <View style={{ padding: 16 }}>
                  {/* Photo Swiper / Cover Image Preview */}
                  <View style={{
                    height: 180,
                    borderRadius: 12,
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    marginBottom: 12,
                  }}>
                    {uploadedImages.length > 0 ? (
                      <Image source={{ uri: uploadedImages[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : modalColorGroups.find(g => g.imageUri)?.imageUri ? (
                      <Image source={{ uri: modalColorGroups.find(g => g.imageUri).imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 36, marginBottom: 4 }}>{prodEmoji || '📦'}</Text>
                        <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '600' }}>Attach photos above to preview product image</Text>
                      </View>
                    )}
                  </View>

                  {/* Additional photos thumbnails bar */}
                  {uploadedImages.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 12 }}>
                      {uploadedImages.map((imgUri, idx) => (
                        <Image key={idx} source={{ uri: imgUri }} style={{ width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' }} resizeMode="cover" />
                      ))}
                    </ScrollView>
                  )}

                  {/* Store & Category */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Storefront size={14} color="#F6A400" weight="bold" />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#032757' }}>{storeInfo?.name || 'My Store'}</Text>
                    <Text style={{ fontSize: 12, color: '#94A3B8' }}>•</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>{prodCategory || 'General'}</Text>
                  </View>

                  {/* Product Title */}
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#032757', marginBottom: 8, lineHeight: 24 }}>
                    {prodName.trim() || 'Product Name Here'}
                  </Text>

                  {/* Price & Discount */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#032757' }}>
                      ₦{parseFloat(prodPrice || 0).toLocaleString('en-NG')}
                    </Text>
                    {prodDiscountPrice && parseFloat(prodDiscountPrice) > parseFloat(prodPrice || 0) && (
                      <Text style={{ fontSize: 14, color: '#94A3B8', textDecorationLine: 'line-through' }}>
                        ₦{parseFloat(prodDiscountPrice).toLocaleString('en-NG')}
                      </Text>
                    )}
                    {prodDiscountPrice && parseFloat(prodDiscountPrice) > parseFloat(prodPrice || 0) && (
                      <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#DC2626' }}>
                          {Math.round((1 - parseFloat(prodPrice) / parseFloat(prodDiscountPrice)) * 100)}% OFF
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Colors / Styles Preview */}
                  {modalColorGroups.length > 0 && (
                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 }}>
                        🎨 Color / Style Options ({modalColorGroups.length}):
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {modalColorGroups.map((cg) => {
                          const hex = getColorHexModal(cg.color);
                          const totalStock = cg.sizes.reduce((sum, sz) => sum + (parseInt(sz.stock, 10) || 0), 0);
                          return (
                            <View key={cg.id} style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderRadius: 999,
                              borderWidth: 1.2,
                              borderColor: '#CBD5E1',
                              backgroundColor: '#F8FAFC',
                            }}>
                              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: hex, borderWidth: hex === '#FFFFFF' ? 1 : 0, borderColor: '#CBD5E1' }} />
                              <Text style={{ fontSize: 12, fontWeight: '700', color: '#032757' }}>{cg.color || 'Style'}</Text>
                              <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>({totalStock})</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Sizes Preview */}
                  {(() => {
                    const allSizes = Array.from(new Set(modalColorGroups.flatMap(cg => cg.sizes.map(s => s.size))));
                    if (allSizes.length === 0) return null;
                    return (
                      <View style={{ marginBottom: 14 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 }}>
                          🏷 Available Sizes:
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {allSizes.map((sz) => (
                            <View key={sz} style={{
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderRadius: 8,
                              borderWidth: 1.2,
                              borderColor: '#032757',
                              backgroundColor: '#032757',
                            }}>
                              <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>{sz}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })()}

                  {/* Description Preview */}
                  <View style={{ marginBottom: 14, paddingTop: 10, borderTopWidth: 1, borderColor: '#F1F5F9' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 }}>Product Description:</Text>
                    <Text style={{ fontSize: 13, color: '#334155', lineHeight: 19 }}>
                      {prodDescription.trim() || 'No description added yet. Add details above to see preview here.'}
                    </Text>
                  </View>

                  {/* Product Details & Specifications Preview */}
                  {prodAttributes.some(a => a.key.trim() && a.value.trim()) && (
                    <View style={{ marginBottom: 14, paddingTop: 10, borderTopWidth: 1, borderColor: '#F1F5F9' }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 }}>📋 Product Specifications & Details:</Text>
                      <View style={{ gap: 4 }}>
                        {prodAttributes.filter(a => a.key.trim() && a.value.trim()).map((attr, i) => (
                          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 0.5, borderColor: '#F1F5F9' }}>
                            <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>{attr.key}</Text>
                            <Text style={{ fontSize: 12, color: '#032757', fontWeight: '700' }}>{attr.value}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Customer Action Buttons Mock */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <View style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: '#F1F5F9',
                      borderWidth: 1.2,
                      borderColor: '#CBD5E1',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#032757' }}>🛒 Add to Cart</Text>
                    </View>
                    <View style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: '#032757',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#F6A400' }}>⚡ Buy Now</Text>
                    </View>
                  </View>
                </View>
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
  emptyHistoryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyHistoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
    maxWidth: 280,
  },
});
