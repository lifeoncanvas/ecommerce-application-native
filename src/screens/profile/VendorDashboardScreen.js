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
  TextInput,
  Image,
  Switch,
  Platform,
} from 'react-native';
import { typography, spacing, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  CaretLeft,
  Package,
  Tag,
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
  ArrowLeft,
  FloppyDisk,
} from 'phosphor-react-native';
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

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

const EMOJI_OPTIONS = ['👟', '👕', '🎒', '🍔', '🥤', '📱', '🎁', '👗', '💄', '🛒', '📦', '🌿'];

export default function VendorDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  const getInitialStore = (email) => {
    const e = (email || '').toLowerCase();
    if (e.includes('jazari')) return { id: 2, name: 'Jazari Restaurant', description: 'Authentic gourmet dining & meal platters', address: '45 Gourmet Way', phone: '+1-800-555-0211', category: 'Restaurant & Food', rating: 4.7 };
    if (e.includes('apple')) return { id: 3, name: 'Apple Official Store', description: 'Premium electronics, iPhones, and MacBooks', address: '1 Apple Park Way', phone: '+1-800-555-0300', category: 'Electronics', rating: 4.9 };
    return { id: 1, name: 'Nike Store', description: 'Official Nike footwear and activewear flagship store', address: '102 Sports Boulevard', phone: '+1-800-555-0199', category: 'Fashion & Apparel', rating: 4.8 };
  };

  const getMockProducts = (sId) => {
    const all = [
      { id: 1, storeId: 1, name: 'Air Max 2026', price: 8999, oldPrice: 9999, discountPrice: 7999, stockQuantity: 20, active: true, emoji: '👟', description: 'Next-gen cushioned running shoes', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
      { id: 2, storeId: 1, name: 'Nike Dri-FIT T-Shirt', price: 1499, oldPrice: 1999, discountPrice: 1299, stockQuantity: 50, active: true, emoji: '👕', description: 'Breathable performance training t-shirt', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400' },
      { id: 3, storeId: 1, name: 'Nike Heritage Backpack', price: 2499, oldPrice: 2999, discountPrice: 2199, stockQuantity: 0, active: false, emoji: '🎒', description: 'Durable everyday storage bag', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
      { id: 4, storeId: 2, name: 'Jazari Special Meal Platter', price: 4500, oldPrice: 5000, discountPrice: 3999, stockQuantity: 100, active: true, emoji: '🍔', description: 'Chef signature gourmet platter', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
      { id: 5, storeId: 2, name: 'Fresh Citrus Smoothie', price: 1200, oldPrice: 1500, discountPrice: 999, stockQuantity: 80, active: true, emoji: '🥤', description: '100% natural cold pressed smoothie', imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400' },
      { id: 6, storeId: 3, name: 'iPhone 15 Pro Max', price: 119900, oldPrice: 129900, discountPrice: 114900, stockQuantity: 15, active: true, emoji: '📱', description: 'Titanium design with A17 Pro chip', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
    ];
    return all.filter(p => p.storeId === sId);
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storeInfo, setStoreInfo] = useState(() => getInitialStore(user?.email));
  const [products, setProducts] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  // Form state (for Add/Edit inline tab)
  const [editingProduct, setEditingProduct] = useState(null); // null = add mode
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscount, setFormDiscount] = useState('');
  const [formStock, setFormStock] = useState('20');
  const [formDesc, setFormDesc] = useState('');
  const [formEmoji, setFormEmoji] = useState('🎁');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [nameErr, setNameErr] = useState('');
  const [priceErr, setPriceErr] = useState('');

  // Store edit form
  const [storeName, setStoreName] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  // ── Data Loading ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const email = user?.email || 'nike@store.com';
    const localStore = getInitialStore(email);
    setStoreInfo(localStore);
    const sid = localStore.id;

    try {
      const r = await withTimeout(getMyStore(email), 2000);
      if (r?.data) setStoreInfo(r.data);
    } catch (_) {}

    try {
      const r = await withTimeout(getStoreProducts(sid), 2000);
      if (Array.isArray(r?.data) && r.data.length > 0) setProducts(r.data);
      else setProducts(getMockProducts(sid));
    } catch (_) {
      setProducts(getMockProducts(sid));
    }

    try {
      const r = await withTimeout(getStoreActivities(email), 2000);
      if (Array.isArray(r?.data)) setActivityLogs(r.data.filter(a => !a.storeId || a.storeId === sid));
      else setActivityLogs(await getLocalActivities());
    } catch (_) {
      setActivityLogs(await getLocalActivities());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Metrics ───────────────────────────────────────────────────────────────
  const totalCount = products.length;
  const activeCount = products.filter(p => p.active !== false).length;
  const inactiveCount = totalCount - activeCount;
  const outOfStockCount = products.filter(p => (p.stockQuantity ?? 0) === 0).length;

  const filtered = products.filter(p => {
    if (filterMode === 'active' && p.active === false) return false;
    if (filterMode === 'inactive' && p.active !== false) return false;
    if (searchQuery.trim()) return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  // ── Open Form ─────────────────────────────────────────────────────────────
  const openAddForm = () => {
    setEditingProduct(null);
    setFormName(''); setFormPrice(''); setFormDiscount(''); setFormStock('20');
    setFormDesc(''); setFormEmoji(storeInfo?.id === 2 ? '🍔' : storeInfo?.id === 3 ? '📱' : '👟');
    setFormImageUrl(''); setFormActive(true);
    setNameErr(''); setPriceErr('');
    setTab('form');
  };

  const openEditForm = (p) => {
    setEditingProduct(p);
    setFormName(p.name || '');
    setFormPrice(String(p.price || ''));
    setFormDiscount(p.discountPrice ? String(p.discountPrice) : '');
    setFormStock(String(p.stockQuantity ?? 20));
    setFormDesc(p.description || '');
    setFormEmoji(p.emoji || '🎁');
    setFormImageUrl(p.imageUrl || '');
    setFormActive(p.active !== false);
    setNameErr(''); setPriceErr('');
    setTab('form');
  };

  // ── Save Product ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    let err = false;
    if (!formName.trim()) { setNameErr('Product name is required.'); err = true; } else setNameErr('');
    const priceNum = parseFloat(formPrice);
    if (!formPrice.trim() || isNaN(priceNum) || priceNum <= 0) { setPriceErr('Enter a valid price.'); err = true; } else setPriceErr('');
    if (err) return;

    setSaving(true);
    const payload = {
      name: formName.trim(),
      price: priceNum,
      discountPrice: formDiscount ? parseFloat(formDiscount) : null,
      oldPrice: editingProduct ? editingProduct.price : null,
      stockQuantity: parseInt(formStock, 10) || 0,
      description: formDesc.trim(),
      emoji: formEmoji,
      imageUrl: formImageUrl.trim() || null,
      active: formActive,
      storeId: storeInfo?.id,
    };

    const isEdit = !!editingProduct;
    const logAction = isEdit ? (editingProduct.price !== priceNum ? 'Price Updated' : 'Product Details Updated') : 'Product Added';
    const logDetail = isEdit && editingProduct.price !== priceNum
      ? `₦${editingProduct.price.toLocaleString('en-NG')} → ₦${priceNum.toLocaleString('en-NG')}`
      : isEdit ? 'Product details updated' : `Added at ₦${priceNum.toLocaleString('en-NG')}`;

    try {
      if (isEdit) {
        await withTimeout(updateStoreProductApi(editingProduct.id, payload), 2500);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload, id: p.id } : p));
      } else {
        const res = await withTimeout(createMyStoreProduct(payload, user?.email || 'nike@store.com'), 2500);
        setProducts(prev => [res?.data || { ...payload, id: Date.now() }, ...prev]);
      }
    } catch (e) {
      if (e?.response?.status === 403) {
        Alert.alert('Access Denied', 'You can only manage products belonging to your own store.');
        setSaving(false); return;
      }
      // Offline fallback
      if (isEdit) setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload, id: p.id } : p));
      else setProducts(prev => [{ ...payload, id: Date.now() }, ...prev]);
    }

    const updatedLogs = await logLocalActivity(formName, logAction, logDetail);
    setActivityLogs(updatedLogs);
    setSaving(false);
    setTab('products');
    Alert.alert('✅ Saved!', `"${formName}" has been ${isEdit ? 'updated' : 'added'} to your store.`);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (p) => {
    Alert.alert('Delete Product', `Remove "${p.name}" from your store?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setProducts(prev => prev.filter(x => x.id !== p.id));
        try { await withTimeout(deleteStoreProductApi(p.id, user?.email), 2000); } catch (_) {}
        const logs = await logLocalActivity(p.name, 'Product Removed', 'Product deleted from store');
        setActivityLogs(logs);
        Alert.alert('Deleted', `"${p.name}" removed.`);
      }},
    ]);
  };

  // ── Toggle Active ─────────────────────────────────────────────────────────
  const handleToggle = async (p) => {
    const next = !p.active;
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: next } : x));
    try { await withTimeout(toggleProductStatusApi(p.id, next), 2000); } catch (_) {}
    const logs = await logLocalActivity(p.name, next ? 'Product Activated' : 'Product Deactivated', next ? 'Now visible to customers' : 'Hidden from customers');
    setActivityLogs(logs);
  };

  // ── Pick Image (web-safe) ─────────────────────────────────────────────────
  const handlePickImage = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) setFormImageUrl(URL.createObjectURL(file));
      };
      input.click();
    } else {
      Alert.prompt('Image URL', 'Paste a product image URL:', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set', onPress: (url) => { if (url?.trim()) setFormImageUrl(url.trim()); } },
      ], 'plain-text', '');
    }
  };

  // ── Save Store Profile ────────────────────────────────────────────────────
  const openStoreEditor = () => {
    setStoreName(storeInfo?.name || '');
    setStoreDesc(storeInfo?.description || '');
    setStorePhone(storeInfo?.phone || '');
    setStoreAddress(storeInfo?.address || '');
    setTab('store');
  };
  const handleSaveStore = () => {
    setStoreInfo(prev => ({ ...prev, name: storeName, description: storeDesc, phone: storePhone, address: storeAddress }));
    setTab('store_view');
    Alert.alert('Store Updated', 'Your store details have been saved.');
  };

  // ── NAV TABS CONFIG ───────────────────────────────────────────────────────
  const navTabs = [
    { key: 'dashboard', label: 'Dashboard', Icon: House },
    { key: 'products', label: `Products (${totalCount})`, Icon: Package },
    { key: 'add', label: '+ Add', Icon: Plus, isAdd: true },
    { key: 'history', label: 'History', Icon: History },
    { key: 'store_view', label: 'My Store', Icon: Storefront },
    { key: 'profile', label: 'Account', Icon: User },
  ];

  const customerProducts = products.filter(p => p.active !== false);

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.root}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#1E293B" weight="bold" />
        </TouchableOpacity>
        <View style={S.headerCenter}>
          <Text style={S.headerTitle} numberOfLines={1}>{storeInfo?.name || 'My Store'}</Text>
          <Text style={S.headerSub}>Vendor Management Portal</Text>
        </View>
        <TouchableOpacity style={S.liveBtn} onPress={() => setTab('preview')}>
          <Eye size={14} color="#fff" weight="bold" />
          <Text style={S.liveBtnText}>Preview</Text>
        </TouchableOpacity>
      </View>

      {/* ── NAV BAR ────────────────────────────────────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.navBar} contentContainerStyle={S.navContent}>
        {navTabs.map(t => {
          const isActive = tab === t.key || (t.key === 'add' && tab === 'form');
          const Ico = t.Icon;
          return (
            <TouchableOpacity
              key={t.key}
              style={[S.navTab, isActive && S.navTabActive, t.isAdd && S.navTabAdd]}
              onPress={() => t.isAdd ? openAddForm() : setTab(t.key)}
            >
              <Ico size={14} color={t.isAdd ? '#fff' : isActive ? '#fff' : '#94A3B8'} weight={isActive ? 'fill' : 'regular'} />
              <Text style={[S.navTabText, (isActive || t.isAdd) && S.navTabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={S.loadingBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={S.loadingText}>Loading your store…</Text>
        </View>
      ) : (

        <View style={{ flex: 1 }}>

          {/* ══════════════════════════════════════════════════════════════
              TAB: DASHBOARD
          ══════════════════════════════════════════════════════════════ */}
          {tab === 'dashboard' && (
            <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
              {/* Welcome */}
              <View style={S.welcomeCard}>
                <Text style={S.welcomeTitle}>Welcome back, {storeInfo?.name?.split(' ')[0]} 👋</Text>
                <Text style={S.welcomeSub}>You are managing <Text style={S.bold}>{storeInfo?.name}</Text>. Only your store's products appear here.</Text>
              </View>

              {/* Stats Grid */}
              <Text style={S.sectionLabel}>STORE OVERVIEW</Text>
              <View style={S.statsGrid}>
                {[
                  { label: 'Total Products', val: totalCount, color: '#2563EB', bg: '#EFF6FF', Icon: Package },
                  { label: 'Active (Live)', val: activeCount, color: '#16A34A', bg: '#DCFCE7', Icon: CheckCircle },
                  { label: 'Hidden', val: inactiveCount, color: '#D97706', bg: '#FEF3C7', Icon: Clock },
                  { label: 'Out of Stock', val: outOfStockCount, color: '#DC2626', bg: '#FEE2E2', Icon: Tag },
                ].map(s => (
                  <View key={s.label} style={S.statCard}>
                    <View style={[S.statIcon, { backgroundColor: s.bg }]}>
                      <s.Icon size={20} color={s.color} weight="fill" />
                    </View>
                    <Text style={[S.statVal, { color: s.color }]}>{s.val}</Text>
                    <Text style={S.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Recent Activity */}
              <View style={S.recentSection}>
                <View style={S.recentHeader}>
                  <Text style={S.sectionLabel}>RECENT CHANGES</Text>
                  <TouchableOpacity onPress={() => setTab('history')}>
                    <Text style={S.linkText}>View All →</Text>
                  </TouchableOpacity>
                </View>
                {activityLogs.slice(0, 4).map((a, i) => (
                  <View key={a.id || i} style={S.actRow}>
                    <View style={S.actDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={S.actProd}>{a.productName || 'Product'}</Text>
                      <Text style={S.actDetail}>{a.actionType} · {a.details}</Text>
                    </View>
                  </View>
                ))}
                {activityLogs.length === 0 && <Text style={S.emptyNote}>No recent changes yet.</Text>}
              </View>

              {/* Quick Add Button */}
              <TouchableOpacity style={S.bigAddBtn} onPress={openAddForm}>
                <Plus size={20} color="#fff" weight="bold" />
                <Text style={S.bigAddBtnText}>+ Add New Product to {storeInfo?.name}</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: PRODUCTS LIST
          ══════════════════════════════════════════════════════════════ */}
          {tab === 'products' && (
            <View style={{ flex: 1 }}>
              {/* Search + Add */}
              <View style={S.listToolbar}>
                <TextInput
                  style={S.searchBox}
                  placeholder={`Search in ${storeInfo?.name || 'store'}…`}
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={S.addBtnSmall} onPress={openAddForm}>
                  <Plus size={16} color="#fff" weight="bold" />
                  <Text style={S.addBtnSmallText}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Filter Chips */}
              <View style={S.chips}>
                {[
                  { k: 'all', label: `All (${totalCount})` },
                  { k: 'active', label: `Active (${activeCount})` },
                  { k: 'inactive', label: `Hidden (${inactiveCount})` },
                ].map(c => (
                  <TouchableOpacity key={c.k} style={[S.chip, filterMode === c.k && S.chipActive]} onPress={() => setFilterMode(c.k)}>
                    <Text style={[S.chipText, filterMode === c.k && S.chipTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Product Cards */}
              <FlatList
                data={filtered}
                keyExtractor={i => String(i.id)}
                contentContainerStyle={S.listContent}
                renderItem={({ item: p }) => {
                  const isActive = p.active !== false;
                  return (
                    <View style={[S.prodCard, !isActive && S.prodCardOff]}>
                      {/* Image / Emoji */}
                      <View style={S.prodImg}>
                        {p.imageUrl
                          ? <Image source={{ uri: p.imageUrl }} style={S.prodImgPhoto} resizeMode="cover" />
                          : <Text style={S.prodEmoji}>{p.emoji || '🎁'}</Text>}
                      </View>

                      {/* Info */}
                      <View style={S.prodInfo}>
                        <View style={S.prodTopRow}>
                          <Text style={S.prodName} numberOfLines={1}>{p.name}</Text>
                          <View style={[S.badge, isActive ? S.badgeGreen : S.badgeGray]}>
                            <Text style={[S.badgeText, isActive ? S.badgeTextGreen : S.badgeTextGray]}>
                              {isActive ? 'Live' : 'Hidden'}
                            </Text>
                          </View>
                        </View>

                        <View style={S.prodPriceRow}>
                          <Text style={S.prodPrice}>₦{Number(p.price).toLocaleString('en-NG')}</Text>
                          {p.discountPrice && (
                            <Text style={S.prodSale}>₦{Number(p.discountPrice).toLocaleString('en-NG')} sale</Text>
                          )}
                        </View>
                        <Text style={S.prodStock}>Stock: {p.stockQuantity ?? 0} units</Text>

                        {/* Action Buttons */}
                        <View style={S.prodActions}>
                          <TouchableOpacity style={S.editBtn} onPress={() => openEditForm(p)}>
                            <PencilSimple size={13} color="#1E293B" weight="bold" />
                            <Text style={S.editBtnText}>Edit</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={S.deleteBtn} onPress={() => handleDelete(p)}>
                            <Trash size={13} color="#DC2626" weight="bold" />
                            <Text style={S.deleteBtnText}>Delete</Text>
                          </TouchableOpacity>

                          <View style={S.toggleRow}>
                            <Text style={S.toggleLabel}>{isActive ? 'Visible' : 'Hidden'}</Text>
                            <Switch
                              value={isActive}
                              onValueChange={() => handleToggle(p)}
                              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                              thumbColor="#fff"
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View style={S.emptyBox}>
                    <Package size={48} color="#CBD5E1" />
                    <Text style={S.emptyTitle}>No products yet</Text>
                    <Text style={S.emptySub}>Tap "+ Add" above to create your first product listing.</Text>
                    <TouchableOpacity style={S.bigAddBtn} onPress={openAddForm}>
                      <Plus size={18} color="#fff" weight="bold" />
                      <Text style={S.bigAddBtnText}>Add First Product</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: ADD / EDIT PRODUCT FORM (INLINE)
          ══════════════════════════════════════════════════════════════ */}
          {tab === 'form' && (
            <ScrollView style={S.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Form Header */}
              <View style={S.formHeader}>
                <TouchableOpacity style={S.formBackBtn} onPress={() => setTab('products')}>
                  <ArrowLeft size={18} color="#64748B" weight="bold" />
                </TouchableOpacity>
                <View>
                  <Text style={S.formTitle}>{editingProduct ? 'Edit Product' : 'Add New Product'}</Text>
                  <Text style={S.formSub}>Store: {storeInfo?.name}</Text>
                </View>
              </View>

              {/* Price Change Preview Banner (edit only) */}
              {editingProduct && formPrice && parseFloat(formPrice) !== editingProduct.price && !isNaN(parseFloat(formPrice)) && (
                <View style={S.priceBanner}>
                  <Text style={S.priceBannerText}>
                    Price update: ₦{editingProduct.price.toLocaleString('en-NG')} → <Text style={S.priceBannerNew}>₦{parseFloat(formPrice).toLocaleString('en-NG')}</Text>
                  </Text>
                </View>
              )}

              {/* PRODUCT NAME */}
              <View style={S.field}>
                <Text style={S.fieldLabel}>Product Name <Text style={S.required}>*</Text></Text>
                <TextInput
                  style={[S.input, nameErr && S.inputErr]}
                  value={formName}
                  onChangeText={v => { setFormName(v); if (v.trim()) setNameErr(''); }}
                  placeholder="e.g. Air Max 2026"
                  placeholderTextColor="#94A3B8"
                />
                {nameErr ? <Text style={S.errText}>{nameErr}</Text> : null}
              </View>

              {/* PRICE + DISCOUNT */}
              <View style={S.rowFields}>
                <View style={[S.field, { flex: 1 }]}>
                  <Text style={S.fieldLabel}>Price (₦) <Text style={S.required}>*</Text></Text>
                  <TextInput
                    style={[S.input, priceErr && S.inputErr]}
                    value={formPrice}
                    onChangeText={v => { setFormPrice(v); if (v.trim()) setPriceErr(''); }}
                    placeholder="8999"
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                  />
                  {priceErr ? <Text style={S.errText}>{priceErr}</Text> : null}
                </View>
                <View style={[S.field, { flex: 1 }]}>
                  <Text style={S.fieldLabel}>Sale Price (₦)</Text>
                  <TextInput
                    style={S.input}
                    value={formDiscount}
                    onChangeText={setFormDiscount}
                    placeholder="7999"
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* STOCK */}
              <View style={S.field}>
                <Text style={S.fieldLabel}>Stock Quantity</Text>
                <TextInput
                  style={S.input}
                  value={formStock}
                  onChangeText={setFormStock}
                  placeholder="20"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* DESCRIPTION */}
              <View style={S.field}>
                <Text style={S.fieldLabel}>Description</Text>
                <TextInput
                  style={[S.input, S.textArea]}
                  value={formDesc}
                  onChangeText={setFormDesc}
                  placeholder="Enter product details, size guide, or specs…"
                  multiline
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* EMOJI PICKER */}
              <View style={S.field}>
                <Text style={S.fieldLabel}>Product Emoji</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.emojiRow}>
                  {EMOJI_OPTIONS.map(e => (
                    <TouchableOpacity
                      key={e}
                      style={[S.emojiBtn, formEmoji === e && S.emojiBtnActive]}
                      onPress={() => setFormEmoji(e)}
                    >
                      <Text style={S.emojiChar}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* IMAGE URL */}
              <View style={S.field}>
                <Text style={S.fieldLabel}>Product Image</Text>
                <View style={S.imageRow}>
                  <TextInput
                    style={[S.input, { flex: 1 }]}
                    value={formImageUrl}
                    onChangeText={setFormImageUrl}
                    placeholder="Paste image URL or tap Upload"
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity style={S.uploadBtn} onPress={handlePickImage}>
                    <ImageIcon size={16} color="#fff" weight="bold" />
                    <Text style={S.uploadBtnText}>Upload</Text>
                  </TouchableOpacity>
                </View>
                {formImageUrl ? (
                  <View style={S.imagePreviewBox}>
                    <Image source={{ uri: formImageUrl }} style={S.imagePreview} resizeMode="cover" />
                    <TouchableOpacity style={S.removeImageBtn} onPress={() => setFormImageUrl('')}>
                      <X size={14} color="#fff" weight="bold" />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>

              {/* ACTIVE STATUS */}
              <View style={S.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={S.fieldLabel}>Publish to Store</Text>
                  <Text style={S.switchSub}>Active products are visible to customers immediately.</Text>
                </View>
                <Switch
                  value={formActive}
                  onValueChange={setFormActive}
                  trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                  thumbColor="#fff"
                />
              </View>

              {/* SAVE BUTTON */}
              <TouchableOpacity style={S.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <FloppyDisk size={20} color="#fff" weight="bold" />
                      <Text style={S.saveBtnText}>{editingProduct ? 'Save Changes' : 'Add Product to Store'}</Text>
                    </>
                }
              </TouchableOpacity>

              {/* CANCEL */}
              <TouchableOpacity style={S.cancelBtn} onPress={() => setTab('products')}>
                <Text style={S.cancelBtnText}>Cancel — Go Back to Products</Text>
              </TouchableOpacity>

              <View style={{ height: 60 }} />
            </ScrollView>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: CUSTOMER PREVIEW
          ══════════════════════════════════════════════════════════════ */}
          {tab === 'preview' && (
            <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
              <View style={S.previewBanner}>
                <Eye size={18} color="#2563EB" weight="fill" />
                <Text style={S.previewBannerText}>This is how customers see <Text style={S.bold}>{storeInfo?.name}</Text></Text>
              </View>

              <View style={S.previewStoreCard}>
                <View style={S.previewStoreHeader}>
                  <Storefront size={32} color="#1E293B" weight="bold" />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={S.previewStoreName}>{storeInfo?.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Star size={13} color="#F59E0B" weight="fill" />
                      <Text style={S.previewRating}>{storeInfo?.rating || 4.8} · {customerProducts.length} items</Text>
                    </View>
                    <Text style={S.previewStoreDesc} numberOfLines={2}>{storeInfo?.description || ''}</Text>
                  </View>
                </View>

                <Text style={S.sectionLabel}>LIVE CATALOG ({customerProducts.length} active products)</Text>
                <View style={S.previewGrid}>
                  {customerProducts.map(p => (
                    <View key={p.id} style={S.previewItem}>
                      <View style={S.previewItemImg}>
                        {p.imageUrl
                          ? <Image source={{ uri: p.imageUrl }} style={S.previewItemPhoto} resizeMode="cover" />
                          : <Text style={{ fontSize: 30 }}>{p.emoji || '🎁'}</Text>}
                      </View>
                      <Text style={S.previewItemName} numberOfLines={2}>{p.name}</Text>
                      <Text style={S.previewItemPrice}>₦{Number(p.price).toLocaleString('en-NG')}</Text>
                      {p.discountPrice && (
                        <Text style={S.previewItemSale}>Sale ₦{Number(p.discountPrice).toLocaleString('en-NG')}</Text>
                      )}
                      <View style={S.previewAddBtn}>
                        <ShoppingBag size={11} color="#fff" weight="bold" />
                        <Text style={S.previewAddBtnText}>Add to Cart</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: CHANGE HISTORY
          ══════════════════════════════════════════════════════════════ */}
          {tab === 'history' && (
            <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
              <Text style={S.sectionLabel}>CHANGE HISTORY LOG</Text>
              <Text style={S.historySub}>Audit timeline for {storeInfo?.name}</Text>

              {activityLogs.length === 0 && (
                <View style={S.emptyBox}>
                  <History size={40} color="#CBD5E1" />
                  <Text style={S.emptyNote}>No changes recorded yet.</Text>
                </View>
              )}

              {activityLogs.map((log, i) => (
                <View key={log.id || i} style={S.logRow}>
                  <View style={S.logDot} />
                  <View style={S.logCard}>
                    <View style={S.logTop}>
                      <Text style={S.logProd}>{log.productName || 'Product'}</Text>
                      <View style={S.logPill}>
                        <Text style={S.logPillText}>{log.actionType}</Text>
                      </View>
                    </View>
                    <Text style={S.logDetail}>{log.details}</Text>
                    <Text style={S.logTime}>{log.date || log.timestamp || 'Just now'}</Text>
                  </View>
                </View>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: MY STORE INFO VIEW
          ══════════════════════════════════════════════════════════════ */}
          {tab === 'store_view' && (
            <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
              <Text style={S.sectionLabel}>MY STORE</Text>

              <View style={S.storeCard}>
                <View style={S.storeCardTop}>
                  <Text style={S.storeCardName}>{storeInfo?.name}</Text>
                  <TouchableOpacity style={S.storeEditBtn} onPress={openStoreEditor}>
                    <PencilSimple size={15} color="#1E293B" weight="bold" />
                    <Text style={S.storeEditBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={S.storeCardDesc}>{storeInfo?.description || 'No description set.'}</Text>
                {[
                  { label: 'Category', val: storeInfo?.category || '—' },
                  { label: 'Address', val: storeInfo?.address || '—' },
                  { label: 'Phone', val: storeInfo?.phone || '—' },
                  { label: 'Rating', val: `⭐ ${storeInfo?.rating || 4.8}` },
                ].map(r => (
                  <View key={r.label} style={S.storeRow}>
                    <Text style={S.storeRowLabel}>{r.label}</Text>
                    <Text style={S.storeRowVal}>{r.val}</Text>
                  </View>
                ))}

                <TouchableOpacity style={S.previewStorefrontBtn} onPress={() => setTab('preview')}>
                  <Eye size={16} color="#fff" weight="bold" />
                  <Text style={S.previewStorefrontBtnText}>View Customer Storefront</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: EDIT STORE (INLINE FORM)
          ══════════════════════════════════════════════════════════════ */}
          {tab === 'store' && (
            <ScrollView style={S.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={S.formHeader}>
                <TouchableOpacity style={S.formBackBtn} onPress={() => setTab('store_view')}>
                  <ArrowLeft size={18} color="#64748B" weight="bold" />
                </TouchableOpacity>
                <View>
                  <Text style={S.formTitle}>Edit Store Details</Text>
                  <Text style={S.formSub}>Changes apply immediately</Text>
                </View>
              </View>

              {[
                { label: 'Store Name', val: storeName, set: setStoreName, ph: 'e.g. Nike Store' },
                { label: 'Phone Number', val: storePhone, set: setStorePhone, ph: '+1 800 555 0199' },
                { label: 'Address', val: storeAddress, set: setStoreAddress, ph: '102 Sports Boulevard' },
              ].map(f => (
                <View key={f.label} style={S.field}>
                  <Text style={S.fieldLabel}>{f.label}</Text>
                  <TextInput style={S.input} value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor="#94A3B8" />
                </View>
              ))}

              <View style={S.field}>
                <Text style={S.fieldLabel}>Store Description</Text>
                <TextInput
                  style={[S.input, S.textArea]}
                  value={storeDesc}
                  onChangeText={setStoreDesc}
                  placeholder="Describe your store…"
                  multiline
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <TouchableOpacity style={S.saveBtn} onPress={handleSaveStore} activeOpacity={0.85}>
                <FloppyDisk size={20} color="#fff" weight="bold" />
                <Text style={S.saveBtnText}>Save Store Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setTab('store_view')}>
                <Text style={S.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 60 }} />
            </ScrollView>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: ACCOUNT
          ══════════════════════════════════════════════════════════════ */}
          {tab === 'profile' && (
            <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
              <Text style={S.sectionLabel}>ACCOUNT</Text>
              <View style={S.accountCard}>
                <View style={S.accountAvatar}>
                  <Text style={S.accountAvatarText}>{(user?.name || user?.email || 'V').charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={S.accountName}>{user?.fullName || user?.name || 'Store Owner'}</Text>
                <Text style={S.accountEmail}>{user?.email || 'vendor@store.com'}</Text>
                <View style={S.accountBadge}>
                  <Storefront size={13} color="#2563EB" weight="fill" />
                  <Text style={S.accountBadgeText}>Managing: {storeInfo?.name}</Text>
                </View>

                <TouchableOpacity style={S.logoutBtn} onPress={logout}>
                  <Text style={S.logoutBtnText}>Sign Out of Vendor Portal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

        </View>
      )}
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// STYLES
// ────────────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  headerSub: { fontSize: 11, color: '#64748B' },
  liveBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, gap: 4 },
  liveBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Nav Bar
  navBar: { backgroundColor: '#1E293B', maxHeight: 50 },
  navContent: { paddingHorizontal: 10, gap: 6, alignItems: 'center', paddingVertical: 8 },
  navTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 5 },
  navTabActive: { backgroundColor: '#334155' },
  navTabAdd: { backgroundColor: '#10B981' },
  navTabText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  navTabTextActive: { color: '#fff', fontWeight: '700' },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontSize: 14 },

  scroll: { flex: 1, padding: 16 },

  // Dashboard
  welcomeCard: { backgroundColor: '#fff', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  welcomeTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  welcomeSub: { fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 18 },
  bold: { fontWeight: '800', color: '#1E293B' },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, marginBottom: 10, marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statVal: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2, textAlign: 'center' },

  recentSection: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  linkText: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  actRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderColor: '#F1F5F9' },
  actDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB', marginTop: 5 },
  actProd: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  actDetail: { fontSize: 11, color: '#64748B', marginTop: 1 },
  emptyNote: { fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: 12 },

  bigAddBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 12, padding: 16, justifyContent: 'center', gap: 8, marginTop: 8 },
  bigAddBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Products List
  listToolbar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  searchBox: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  addBtnSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, gap: 4 },
  addBtnSmallText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#1E293B' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: '#fff' },

  listContent: { padding: 12, gap: 10, paddingBottom: 30 },
  prodCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  prodCardOff: { opacity: 0.65 },
  prodImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  prodImgPhoto: { width: '100%', height: '100%' },
  prodEmoji: { fontSize: 30 },
  prodInfo: { flex: 1 },
  prodTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  prodName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1E293B' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeGray: { backgroundColor: '#F1F5F9' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextGreen: { color: '#16A34A' },
  badgeTextGray: { color: '#64748B' },
  prodPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  prodPrice: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  prodSale: { fontSize: 11, color: '#16A34A', fontWeight: '700', backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  prodStock: { fontSize: 11, color: '#64748B', marginBottom: 8 },
  prodActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  editBtnText: { fontSize: 12, fontWeight: '600', color: '#1E293B' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  deleteBtnText: { fontSize: 12, fontWeight: '600', color: '#DC2626' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },
  toggleLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },

  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  emptySub: { fontSize: 13, color: '#64748B', textAlign: 'center', maxWidth: 280 },

  // Form Tab
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  formBackBtn: { width: 36, height: 36, backgroundColor: '#F8FAFC', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  formTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  formSub: { fontSize: 12, color: '#64748B', marginTop: 1 },

  priceBanner: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', borderRadius: 10, padding: 12, marginBottom: 12 },
  priceBannerText: { fontSize: 13, color: '#92400E', fontWeight: '600' },
  priceBannerNew: { color: '#16A34A', fontWeight: '800' },

  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
  required: { color: '#DC2626' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#1E293B' },
  inputErr: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  errText: { fontSize: 11, color: '#DC2626', marginTop: 4 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  rowFields: { flexDirection: 'row', gap: 10 },

  emojiRow: { gap: 8, paddingVertical: 4 },
  emojiBtn: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  emojiBtnActive: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' },
  emojiChar: { fontSize: 22 },

  imageRow: { flexDirection: 'row', gap: 8 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10 },
  uploadBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  imagePreviewBox: { marginTop: 10, borderRadius: 10, overflow: 'hidden', height: 140, position: 'relative' },
  imagePreview: { width: '100%', height: '100%' },
  removeImageBtn: { position: 'absolute', top: 8, right: 8, width: 26, height: 26, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 13, justifyContent: 'center', alignItems: 'center' },

  switchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, gap: 10 },
  switchSub: { fontSize: 11, color: '#64748B', marginTop: 2 },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#16A34A', borderRadius: 14, padding: 16, gap: 8, marginBottom: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelBtn: { alignItems: 'center', padding: 14 },
  cancelBtnText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },

  // Preview
  previewBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, marginBottom: 14 },
  previewBannerText: { fontSize: 13, color: '#1D4ED8', fontWeight: '600', flex: 1 },
  previewStoreCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  previewStoreHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  previewStoreName: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  previewRating: { fontSize: 12, color: '#64748B' },
  previewStoreDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  previewItem: { width: '47%', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  previewItemImg: { height: 90, borderRadius: 8, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 8 },
  previewItemPhoto: { width: '100%', height: '100%' },
  previewItemName: { fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  previewItemPrice: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  previewItemSale: { fontSize: 10, color: '#16A34A', fontWeight: '700', marginTop: 1 },
  previewAddBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB', borderRadius: 6, paddingVertical: 5, marginTop: 8, gap: 4 },
  previewAddBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // History
  historySub: { fontSize: 12, color: '#64748B', marginBottom: 16 },
  logRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  logDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563EB', marginTop: 8 },
  logCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  logTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  logProd: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1E293B' },
  logPill: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  logPillText: { fontSize: 10, fontWeight: '700', color: '#1D4ED8' },
  logDetail: { fontSize: 12, color: '#64748B', lineHeight: 17 },
  logTime: { fontSize: 10, color: '#94A3B8', marginTop: 4 },

  // Store Info
  storeCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  storeCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  storeCardName: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  storeEditBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  storeEditBtnText: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  storeCardDesc: { fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 14 },
  storeRow: { flexDirection: 'row', paddingVertical: 9, borderTopWidth: 1, borderColor: '#F1F5F9' },
  storeRowLabel: { fontSize: 13, color: '#64748B', fontWeight: '600', width: 90 },
  storeRowVal: { flex: 1, fontSize: 13, color: '#1E293B', fontWeight: '600' },
  previewStorefrontBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', borderRadius: 10, padding: 13, gap: 8, marginTop: 14 },
  previewStorefrontBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Account
  accountCard: { backgroundColor: '#fff', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 8 },
  accountAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  accountAvatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  accountName: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  accountEmail: { fontSize: 13, color: '#64748B' },
  accountBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  accountBadgeText: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  logoutBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 10 },
  logoutBtnText: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
});
