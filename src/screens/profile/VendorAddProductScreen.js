import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CaretLeft, CaretRight, Check, Plus, Minus, Trash,
  Image as ImgIcon, Tag, TextAlignLeft, ShoppingBag,
  Package, CurrencyNgn, ArrowClockwise, CheckCircle, Info,
  Camera, PaintBucket,
} from 'phosphor-react-native';
import { useTheme } from '../../context/ThemeContext';
import { logLocalActivity } from '../../utils/activityStorage';

// ── Color/size matrix helpers ──────────────────────────────────────────────
const COLOR_PRESETS = [
  { name: 'White',        hex: '#FFFFFF' },
  { name: 'Black',        hex: '#1E293B' },
  { name: 'Red',          hex: '#EF4444' },
  { name: 'Royal Blue',   hex: '#2563EB' },
  { name: 'Emerald Green',hex: '#16A34A' },
  { name: 'Gold',         hex: '#F6A400' },
  { name: 'Pink',         hex: '#EC4899' },
  { name: 'Purple',       hex: '#A855F7' },
  { name: 'Navy',         hex: '#032757' },
  { name: 'Silver',       hex: '#CBD5E1' },
];
const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const mkId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const colorHex = (name) => {
  if (!name) return '#94A3B8';
  const p = COLOR_PRESETS.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
  if (p) return p.hex;
  const n = name.toLowerCase();
  if (n.includes('white'))  return '#FFFFFF';
  if (n.includes('black'))  return '#1E293B';
  if (n.includes('red'))    return '#EF4444';
  if (n.includes('blue'))   return '#2563EB';
  if (n.includes('green'))  return '#16A34A';
  if (n.includes('gold'))   return '#F6A400';
  if (n.includes('pink'))   return '#EC4899';
  if (n.includes('purple')) return '#A855F7';
  if (n.includes('grey') || n.includes('gray')) return '#6B7280';
  if (n.includes('silver')) return '#CBD5E1';
  if (n.includes('navy'))   return '#032757';
  return '#94A3B8';
};

const TOTAL_STEPS = 7;
const CATEGORIES = [
  { id: 'food',        label: 'Food & Dining',     icon: '🍔' },
  { id: 'fashion',     label: 'Fashion & Apparel', icon: '👗' },
  { id: 'electronics', label: 'Electronics',       icon: '📱' },
  { id: 'beauty',      label: 'Beauty',            icon: '💄' },
  { id: 'health',      label: 'Health',            icon: '💊' },
  { id: 'home',        label: 'Home & Utensils',   icon: '🏠' },
  { id: 'groceries',   label: 'Groceries',         icon: '🛒' },
  { id: 'auto',        label: 'Auto & Mobility',   icon: '🚗' },
];
const HTTN_FEE = 0.08;
const STEP_TITLES = ['Category', 'Description', 'Images', 'Variants', 'Pricing', 'Preview', 'Submit'];
const INIT_FORM = {
  category: null, title: '', brand: '', description: '', images: [],
  attributes: [{ key: '', value: '' }],
  variants: [{ sku: '', size: '', color: '', price: '', stock: '10', inStock: true }],
  basePrice: '', comparePrice: '',
};

export default function VendorAddProductScreen({ navigation }) {
  const { colors } = useTheme();
  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState(INIT_FORM);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const scrollRef = useRef(null);
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Color / size matrix state ──────────────────────────────────────────────
  const [hasVariants, setHasVariants] = useState(false);
  // colorGroups: [{ id, name, imageUri, sizes: [{ id, label, stock }] }]
  const [colorGroups, setColorGroups] = useState([
    { id: mkId(), name: 'White', imageUri: null, sizes: [
      { id: mkId(), label: 'S', stock: 5 },
      { id: mkId(), label: 'M', stock: 10 },
      { id: mkId(), label: 'L', stock: 8 },
    ]},
  ]);
  const [simpleStock, setSimpleStock] = useState(10);

  // Toggle a color preset on/off
  const toggleColorPreset = (presetName) => {
    const exists = colorGroups.find(g => g.name.toLowerCase() === presetName.toLowerCase());
    if (exists) {
      if (colorGroups.length > 1) setColorGroups(prev => prev.filter(g => g.id !== exists.id));
    } else {
      setColorGroups(prev => [...prev, {
        id: mkId(), name: presetName, imageUri: null,
        sizes: [{ id: mkId(), label: 'M', stock: 10 }],
      }]);
    }
  };

  // Toggle a size chip for a color group
  const toggleSize = (groupId, sizeLabel) => {
    setColorGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const exists = g.sizes.find(s => s.label.toUpperCase() === sizeLabel.toUpperCase());
      if (exists) {
        return g.sizes.length > 1 ? { ...g, sizes: g.sizes.filter(s => s.id !== exists.id) } : g;
      }
      return { ...g, sizes: [...g.sizes, { id: mkId(), label: sizeLabel, stock: 10 }] };
    }));
  };

  const setGroupStock = (groupId, sizeId, delta, absolute) => {
    setColorGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, sizes: g.sizes.map(s => {
        if (s.id !== sizeId) return s;
        const next = absolute !== undefined ? Math.max(0, absolute) : Math.max(0, s.stock + delta);
        return { ...s, stock: next };
      })};
    }));
  };

  const setGroupColorName = (groupId, name) => {
    setColorGroups(prev => prev.map(g => g.id === groupId ? { ...g, name } : g));
  };

  const totalVariantStock = colorGroups.reduce((sum, g) => sum + g.sizes.reduce((s2, sz) => s2 + sz.stock, 0), 0);

  // Autosave
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        await AsyncStorage.setItem('@vendor_product_draft', JSON.stringify({ form, step }));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch (_) {}
    }, 800);
    return () => clearTimeout(t);
  }, [form]);

  // Load draft
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@vendor_product_draft');
        if (raw) { const { form: f } = JSON.parse(raw); if (f?.title) setForm(f); }
      } catch (_) {}
    })();
  }, []);

  const fee      = parseFloat(form.basePrice || 0) * HTTN_FEE;
  const earnings = parseFloat(form.basePrice || 0) - fee;
  const discount = (form.comparePrice && form.basePrice)
    ? Math.round((1 - parseFloat(form.basePrice) / parseFloat(form.comparePrice)) * 100)
    : 0;

  const validate = () => {
    const e = {};
    if (step === 0 && !form.category)          e.category    = 'Choose a category.';
    if (step === 0 && !form.title.trim())       e.title       = 'Product title is required.';
    if (step === 1 && !form.description.trim()) e.description = 'Description is required.';
    if (step === 2 && form.images.length < 3)   e.images      = 'Upload at least 3 images.';
    if (step === 4 && !form.basePrice)          e.basePrice   = 'Enter a selling price.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate()) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    step === 6 ? doSubmit() : setStep(s => s + 1);
  };

  const goBack = () => {
    if (step === 0) { navigation.goBack(); return; }
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setStep(s => s - 1);
  };

  const addImage = () => {
    if (form.images.length >= 6) return;
    upd('images', [...form.images, `img_${form.images.length + 1}`]);
    setErrors(p => ({ ...p, images: undefined }));
  };

  const addVariant    = () => upd('variants', [...form.variants, { sku: '', size: '', color: '', price: form.basePrice, stock: '10', inStock: true }]);
  const removeVariant = i  => upd('variants', form.variants.filter((_, idx) => idx !== i));
  const setVariant    = (i, k, v) => { const n = [...form.variants]; n[i] = { ...n[i], [k]: v }; upd('variants', n); };

  const doSubmit = async () => {
    setSaving(true);
    const newProd = {
      id: Date.now(),
      name: form.title.trim() || 'New Product',
      price: parseFloat(form.basePrice) || 0,
      oldPrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      stockQuantity: hasVariants ? totalVariantStock : simpleStock,
      categoryId: form.category || 'cat_fashion',
      description: form.description || '',
      images: form.images,
      imageUrl: form.images[0] || null,
      colorGroups: hasVariants ? colorGroups : [],
      active: true,
      emoji: '🛍️',
    };
    try {
      const existingRaw = await AsyncStorage.getItem('@vendor_products_created');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      await AsyncStorage.setItem('@vendor_products_created', JSON.stringify([newProd, ...existing]));

      // Log activity to change history
      await logLocalActivity(
        newProd.name,
        'Product Added',
        `New product listing created with ${hasVariants ? colorGroups.length + ' color variants' : '1 variant'} (Price: $${newProd.price})`
      );
    } catch (_) {}
    await new Promise(r => setTimeout(r, 1000));
    await AsyncStorage.removeItem('@vendor_product_draft');
    setSaving(false);
    setSubmitted(true);
  };

  // Total variant count for submit summary
  const variantCount = hasVariants
    ? colorGroups.reduce((sum, g) => sum + g.sizes.length, 0)
    : 1;

  const styles = getStyles(colors);

  // ── Step 0: Category / Title / Brand ──────────────────────────────────────
  const step0 = () => (
    <View>
      <Text style={styles.stepTitle}>Category, Title & Brand</Text>
      <Text style={styles.stepSub}>Start with the right category — it determines how buyers find your product.</Text>
      <Text style={styles.fieldLabel}>Category *</Text>
      <View style={styles.catGrid}>
        {CATEGORIES.map(cat => {
          const active = form.category === cat.id;
          return (
            <TouchableOpacity key={cat.id}
              style={[styles.catChip, active && { backgroundColor: colors.navy, borderColor: colors.navy }]}
              onPress={() => { upd('category', cat.id); setErrors(p => ({ ...p, category: undefined })); }}
              activeOpacity={0.8}>
              <Text style={styles.catEmoji}>{cat.icon}</Text>
              <Text style={[styles.catTxt, active && { color: '#fff' }]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {errors.category && <Text style={styles.err}>{errors.category}</Text>}
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Product Title *</Text>
      <View style={[styles.inputRow, errors.title && styles.inputErr]}>
        <ShoppingBag size={18} color="#94A3B8" />
        <TextInput style={styles.textIn} value={form.title}
          onChangeText={v => { upd('title', v); setErrors(p => ({ ...p, title: undefined })); }}
          placeholder="e.g. Nike Air Max 270 Sneakers" placeholderTextColor="#A1A1AA" />
      </View>
      {errors.title && <Text style={styles.err}>{errors.title}</Text>}
      <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Brand (Optional)</Text>
      <View style={styles.inputRow}>
        <Tag size={18} color="#94A3B8" />
        <TextInput style={styles.textIn} value={form.brand} onChangeText={v => upd('brand', v)}
          placeholder="e.g. Nike, Samsung, Puredent" placeholderTextColor="#A1A1AA" />
      </View>
    </View>
  );

  // ── Step 1: Description / Attributes ──────────────────────────────────────
  const step1 = () => (
    <View>
      <Text style={styles.stepTitle}>Product Description</Text>
      <Text style={styles.stepSub}>Great descriptions increase conversion by 40%. Be specific about material, dimensions, and what's included.</Text>
      <View style={[styles.inputRow, styles.textareaRow, errors.description && styles.inputErr]}>
        <TextAlignLeft size={18} color="#94A3B8" style={{ marginTop: 3 }} />
        <TextInput style={[styles.textIn, { height: 160, textAlignVertical: 'top' }]}
          value={form.description} multiline numberOfLines={8}
          onChangeText={v => { upd('description', v); setErrors(p => ({ ...p, description: undefined })); }}
          placeholder="Describe your product — material, dimensions, use-case, what's included…"
          placeholderTextColor="#A1A1AA" />
      </View>
      {errors.description && <Text style={styles.err}>{errors.description}</Text>}
      <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>{form.description.length}/2000 characters</Text>
      <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Attributes (Optional)</Text>
      {form.attributes.map((attr, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          <View style={[styles.inputRow, { flex: 1, marginBottom: 0 }]}>
            <TextInput style={styles.textIn} value={attr.key} placeholder="Key e.g. Material" placeholderTextColor="#A1A1AA"
              onChangeText={v => { const n = [...form.attributes]; n[i] = { ...n[i], key: v }; upd('attributes', n); }} />
          </View>
          <View style={[styles.inputRow, { flex: 1, marginBottom: 0 }]}>
            <TextInput style={styles.textIn} value={attr.value} placeholder="Value e.g. Cotton" placeholderTextColor="#A1A1AA"
              onChangeText={v => { const n = [...form.attributes]; n[i] = { ...n[i], value: v }; upd('attributes', n); }} />
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => upd('attributes', form.attributes.filter((_, idx) => idx !== i))}>
            <Trash size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={[styles.addRow, { borderColor: colors.border }]}
        onPress={() => upd('attributes', [...form.attributes, { key: '', value: '' }])} activeOpacity={0.8}>
        <Plus size={16} color={colors.navy} />
        <Text style={[styles.addRowTxt, { color: colors.navy }]}>Add Attribute</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Step 2: Images ────────────────────────────────────────────────────────
  const step2 = () => (
    <View>
      <Text style={styles.stepTitle}>Product Images</Text>
      <Text style={styles.stepSub}>Upload 3–6 high-quality images. The first becomes the cover photo.</Text>
      <View style={[styles.tipBox, { backgroundColor: colors.goldLight, borderColor: colors.gold }]}>
        <Info size={16} color={colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#7A4F00', marginBottom: 4 }}>Image Quality Tips</Text>
          <Text style={{ fontSize: 12, color: '#7A4F00', lineHeight: 18 }}>
            • Use natural light, avoid harsh flash{'\n'}
            • White or neutral background for the main shot{'\n'}
            • Show multiple angles{'\n'}
            • Minimum 800×800 px
          </Text>
        </View>
      </View>
      <View style={styles.imgGrid}>
        {form.images.map((_, i) => (
          <View key={i} style={[styles.imgSlot, i === 0 && { borderColor: colors.gold, borderWidth: 2 }]}>
            <View style={[styles.imgFill, { backgroundColor: colors.goldLight }]}>
              <CheckCircle size={22} color={colors.gold} weight="fill" />
              <Text style={{ fontSize: 10, color: '#7A4F00', fontWeight: '700', marginTop: 3 }}>
                {i === 0 ? 'COVER' : `IMG ${i + 1}`}
              </Text>
            </View>
            <TouchableOpacity style={styles.removeImgBtn}
              onPress={() => upd('images', form.images.filter((_, idx) => idx !== i))}>
              <Trash size={11} color="#fff" weight="bold" />
            </TouchableOpacity>
          </View>
        ))}
        {form.images.length < 6 && (
          <TouchableOpacity style={[styles.imgAdd, { borderColor: colors.border }]} onPress={addImage} activeOpacity={0.8}>
            <Plus size={22} color={colors.navy} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.navy, marginTop: 4 }}>
              {form.images.length}/6
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {errors.images && <Text style={styles.err}>{errors.images}</Text>}
      {form.images.length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <ArrowClockwise size={13} color="#94A3B8" />
          <Text style={{ fontSize: 12, color: '#94A3B8' }}>Images are compressed automatically on upload</Text>
        </View>
      )}
    </View>
  );

  // ── Step 3: Variants / Stock ──────────────────────────────────────────────
  const step3 = () => (
    <View>
      <Text style={styles.stepTitle}>Product Options & Stock</Text>
      <Text style={styles.stepSub}>Configure your product availability and variant options.</Text>

      {/* ── Master toggle ── */}
      <View style={[styles.toggleCard, { borderColor: hasVariants ? colors.navy : colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.toggleCardTitle, { color: colors.navy }]}>
            Does this product have a size and color matrix?
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>
            {hasVariants
              ? 'Yes — add color/style options, photos, sizes & stock matrix below.'
              : 'No — single product with simple total stock count.'}
          </Text>
        </View>
        <Switch
          value={hasVariants}
          onValueChange={v => setHasVariants(v)}
          trackColor={{ true: colors.navy, false: '#E2E8F0' }}
          thumbColor={hasVariants ? colors.gold : '#fff'}
        />
      </View>

      {/* ── No-variant path: simple stock ── */}
      {!hasVariants && (
        <View style={[styles.simpleStockCard, { borderColor: colors.border }]}>
          <Text style={styles.miniLabel}>How many do you have in stock?</Text>
          <View style={styles.stockStepperRow}>
            <TouchableOpacity style={[styles.stepperBtn, { borderColor: colors.border }]}
              onPress={() => setSimpleStock(s => Math.max(0, s - 1))}>
              <Minus size={18} color={colors.navy} weight="bold" />
            </TouchableOpacity>
            <TextInput
              style={[styles.stockInput, { color: colors.navy, borderColor: colors.border }]}
              value={String(simpleStock)}
              onChangeText={v => setSimpleStock(Math.max(0, parseInt(v) || 0))}
              keyboardType="numeric"
            />
            <TouchableOpacity style={[styles.stepperBtn, { borderColor: colors.border }]}
              onPress={() => setSimpleStock(s => s + 1)}>
              <Plus size={18} color={colors.navy} weight="bold" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Variant path: color / size matrix ── */}
      {hasVariants && (
        <View style={[styles.matrixContainer, { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' }]}>
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 18 }}>🎨</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.navy }}>Product Colors, Sizes & Stock Matrix</Text>
            </View>
            <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 18 }}>
              Add color options, upload photos showing how each color/style looks, and set available sizes with stock steppers.
            </Text>
          </View>

          {/* Stock summary banner */}
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <View style={[styles.stockBanner, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Package size={16} color={colors.navy} weight="duotone" />
              <Text style={{ fontSize: 13, color: '#1E40AF' }}>
                <Text style={{ fontWeight: '800' }}>{totalVariantStock} total units</Text>
                {` across ${colorGroups.reduce((s, g) => s + g.sizes.length, 0)} variant option${colorGroups.reduce((s, g) => s + g.sizes.length, 0) !== 1 ? 's' : ''}`}
              </Text>
            </View>
          </View>

          {/* Color presets quick-tap */}
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={[styles.miniLabel, { marginBottom: 8, color: colors.navy }]}>⚡ 1-TAP QUICK COLOR PRESETS:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
              {COLOR_PRESETS.map(p => {
                const active = colorGroups.some(g => g.name.toLowerCase() === p.name.toLowerCase());
                return (
                  <TouchableOpacity key={p.name}
                    style={[styles.colorPresetChip, active && { backgroundColor: colors.navy, borderColor: colors.navy }]}
                    onPress={() => toggleColorPreset(p.name)}
                    activeOpacity={0.8}>
                    <View style={[styles.colorDot, {
                      backgroundColor: p.hex,
                      borderWidth: p.hex === '#FFFFFF' ? 1 : 0,
                      borderColor: '#CBD5E1',
                    }]} />
                    <Text style={[styles.colorPresetTxt, active && { color: '#fff' }]}>
                      {active ? `✓ ${p.name}` : `+ ${p.name}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Per-color group cards */}
          <View style={{ paddingHorizontal: 16 }}>
            {colorGroups.map((group) => {
              const hex = colorHex(group.name);
              const totalStock = group.sizes.reduce((s, sz) => s + sz.stock, 0);
              return (
                <View key={group.id} style={[styles.colorGroupCard, { borderColor: '#E2E8F0' }]}>
                  {/* Card header: swatch + name input + stock badge */}
                  <View style={styles.colorCardHeader}>
                    <View style={[styles.swatchCircle, { backgroundColor: hex, borderColor: hex === '#FFFFFF' ? '#CBD5E1' : 'transparent' }]} />
                    <TextInput
                      style={[styles.colorNameInput, { color: colors.navy, borderColor: colors.border }]}
                      value={group.name}
                      onChangeText={v => setGroupColorName(group.id, v)}
                      placeholder="Color or style name (e.g. White)"
                      placeholderTextColor="#94A3B8"
                    />
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockBadgeText}>{totalStock} in stock</Text>
                    </View>
                    {colorGroups.length > 1 && (
                      <TouchableOpacity onPress={() => setColorGroups(prev => prev.filter(g => g.id !== group.id))} style={{ padding: 4 }}>
                        <Trash size={15} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Photo upload section */}
                  <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
                    <Text style={[styles.miniLabel, { marginBottom: 6, color: '#475569' }]}>
                      📷 Photo showing how {group.name || 'this color/style'} looks:
                    </Text>
                    <TouchableOpacity style={[styles.colorPhotoBtn, { borderColor: colors.navy }]} activeOpacity={0.8}>
                      <Camera size={18} color={colors.navy} />
                      <Text style={[styles.colorPhotoTxt, { color: colors.navy }]}>
                        + Upload Photo for {group.name || 'this product'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Size quick-toggle */}
                  <View style={{ paddingTop: 14 }}>
                    <Text style={[styles.miniLabel, { paddingHorizontal: 14, marginBottom: 8, color: '#475569' }]}>
                      🏷 Quick Toggle Available Sizes:
                    </Text>
                    <View style={styles.sizeChipsRow}>
                      {SIZE_PRESETS.map(sz => {
                        const active = group.sizes.some(s => s.label.toUpperCase() === sz.toUpperCase());
                        return (
                          <TouchableOpacity key={sz}
                            style={[styles.sizeChip, active && { backgroundColor: colors.navy, borderColor: colors.navy }]}
                            onPress={() => toggleSize(group.id, sz)}
                            activeOpacity={0.8}>
                            <Text style={[styles.sizeChipTxt, active && { color: '#fff' }]}>
                              {active ? `✓ ${sz}` : sz}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Next fields: Dynamic per-size stock steppers based on selected sizes */}
                  <View style={{ marginHorizontal: 14, marginVertical: 14, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12, gap: 10 }}>
                    {group.sizes.map(sz => (
                      <View key={sz.id} style={styles.sizeStockRow}>
                        <Text style={[styles.sizeStockLabel, { color: colors.navy }]}>Size {sz.label}:</Text>
                        <View style={{ flex: 1 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
                          <TouchableOpacity
                            style={[styles.stepperBtnSm, { borderRightWidth: 1, borderColor: colors.border }]}
                            onPress={() => setGroupStock(group.id, sz.id, -1)}>
                            <Minus size={13} color={colors.navy} weight="bold" />
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.stockInputSm, { color: colors.navy }]}
                            value={String(sz.stock)}
                            onChangeText={v => setGroupStock(group.id, sz.id, 0, parseInt(v) || 0)}
                            keyboardType="numeric"
                          />
                          <TouchableOpacity
                            style={[styles.stepperBtnSm, { borderLeftWidth: 1, borderColor: colors.border }]}
                            onPress={() => setGroupStock(group.id, sz.id, 1)}>
                            <Plus size={13} color={colors.navy} weight="bold" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            {/* Add another color/style */}
            <TouchableOpacity
              style={[styles.addRow, { borderColor: colors.navy, backgroundColor: '#fff', marginBottom: 16 }]}
              onPress={() => setColorGroups(prev => [...prev, { id: mkId(), name: '', imageUri: null, sizes: [{ id: mkId(), label: 'M', stock: 10 }] }])}
              activeOpacity={0.8}>
              <Plus size={16} color={colors.navy} />
              <Text style={[styles.addRowTxt, { color: colors.navy }]}>+ Add Another Color / Style</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  // ── Step 4: Pricing ───────────────────────────────────────────────────────
  const step4 = () => (
    <View>
      <Text style={styles.stepTitle}>Pricing</Text>
      <Text style={styles.stepSub}>See your exact earnings before publishing — platform fee is shown live below.</Text>
      <Text style={styles.fieldLabel}>Selling Price (₦) *</Text>
      <View style={[styles.inputRow, errors.basePrice && styles.inputErr]}>
        <CurrencyNgn size={18} color="#94A3B8" />
        <TextInput style={styles.textIn} value={form.basePrice} keyboardType="numeric"
          onChangeText={v => { upd('basePrice', v); setErrors(p => ({ ...p, basePrice: undefined })); }}
          placeholder="e.g. 15000" placeholderTextColor="#A1A1AA" />
      </View>
      {errors.basePrice && <Text style={styles.err}>{errors.basePrice}</Text>}
      <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Compare-at Price (₦) — Optional</Text>
      <View style={styles.inputRow}>
        <CurrencyNgn size={18} color="#94A3B8" />
        <TextInput style={styles.textIn} value={form.comparePrice} keyboardType="numeric"
          onChangeText={v => upd('comparePrice', v)} placeholder="e.g. 20000 (shows strikethrough)" placeholderTextColor="#A1A1AA" />
      </View>
      {form.basePrice ? (
        <View style={[styles.feeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.feeTitle, { color: colors.navy }]}>Live Earnings Preview</Text>
          <View style={{ gap: 10, marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Selling Price</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>₦{parseFloat(form.basePrice).toLocaleString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Platform Fee (8%)</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#DC2626' }}>- ₦{fee.toFixed(2)}</Text>
            </View>
            {discount > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>Discount shown to buyer</Text>
                <View style={{ backgroundColor: '#FEF2F2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626' }}>{discount}% OFF</Text>
                </View>
              </View>
            )}
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.navy }}>Your Earnings</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.navy }}>
                ₦{earnings.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );

  // ── Step 5: Preview ───────────────────────────────────────────────────────
  const step5 = () => {
    const cat = CATEGORIES.find(c => c.id === form.category);
    return (
      <View>
        <Text style={styles.stepTitle}>Preview</Text>
        <Text style={styles.stepSub}>This is how your listing appears to buyers. Review before submitting.</Text>
        <View style={[styles.previewCard, { borderColor: colors.border }]}>
          <View style={[styles.previewImg, { backgroundColor: colors.surface }]}>
            <ImgIcon size={36} color="#CBD5E1" />
            <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
              {form.images.length} image{form.images.length !== 1 ? 's' : ''} uploaded
            </Text>
          </View>
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              {cat && <Text style={{ fontSize: 12 }}>{cat.icon}</Text>}
              <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>{cat?.label || '—'}</Text>
              {form.brand ? <Text style={{ fontSize: 12, color: '#94A3B8' }}>· {form.brand}</Text> : null}
            </View>
            <Text style={{ fontSize: 17, fontWeight: '800', color: colors.navy, marginBottom: 6 }}>{form.title || '—'}</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 }} numberOfLines={4}>
              {form.description || '—'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              {form.basePrice && <Text style={{ fontSize: 20, fontWeight: '800', color: colors.navy }}>₦{parseFloat(form.basePrice).toLocaleString()}</Text>}
              {form.comparePrice && <Text style={{ fontSize: 14, color: '#94A3B8', textDecorationLine: 'line-through' }}>₦{parseFloat(form.comparePrice).toLocaleString()}</Text>}
              {discount > 0 && <View style={{ backgroundColor: '#FEF2F2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}><Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>{discount}% OFF</Text></View>}
            </View>

            {hasVariants && colorGroups.length > 0 && (
              <View style={{ marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderColor: '#F1F5F9' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.navy, marginBottom: 6 }}>🎨 Colors / Styles ({colorGroups.length}):</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {colorGroups.map(g => {
                    const hex = colorHex(g.name);
                    return (
                      <View key={g.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: '#F8FAFC' }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: hex, borderWidth: hex === '#FFFFFF' ? 1 : 0, borderColor: '#CBD5E1' }} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.navy }}>{g.name || 'Style'}</Text>
                      </View>
                    );
                  })}
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.navy, marginBottom: 6 }}>🏷 Available Sizes:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {Array.from(new Set(colorGroups.flatMap(g => g.sizes.map(s => s.label)))).map(sz => (
                    <View key={sz} style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, backgroundColor: colors.navy }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{sz}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.listingBadge, { backgroundColor: '#FEF9E7', borderColor: colors.gold }]}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#7A4F00' }}>📋 Draft</Text>
          <Text style={{ fontSize: 12, color: '#7A4F00' }}>Moves to Pending Review after submit</Text>
        </View>
      </View>
    );
  };

  // ── Step 6: Submit ────────────────────────────────────────────────────────
  const step6 = () => {
    if (submitted) return (
      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <View style={[styles.successBox, { backgroundColor: colors.goldLight, borderColor: colors.gold }]}>
          <CheckCircle size={48} color={colors.gold} weight="fill" />
        </View>
        <Text style={[styles.stepTitle, { textAlign: 'center', marginTop: 20 }]}>Listing Submitted!</Text>
        <Text style={[styles.stepSub, { textAlign: 'center' }]}>
          "{form.title}" is now Pending Review. You'll be notified once approved.
        </Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.navy, marginTop: 28 }]}
          onPress={() => navigation.goBack()} activeOpacity={0.88}>
          <Text style={[styles.primaryBtnTxt, { color: '#fff' }]}>Back to Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.goldLight, borderWidth: 1.5, borderColor: colors.gold, marginTop: 12 }]}
          onPress={() => { setForm(INIT_FORM); setStep(0); setSubmitted(false); }} activeOpacity={0.88}>
          <Text style={[styles.primaryBtnTxt, { color: colors.navy }]}>Add Another Product</Text>
        </TouchableOpacity>
      </View>
    );
    return (
      <View>
        <Text style={styles.stepTitle}>Ready to Submit?</Text>
        <Text style={styles.stepSub}>Our team reviews listings within 2–4 hours. You'll get a push notification on approval.</Text>
        <View style={[styles.submitSummary, { borderColor: colors.border }]}>
          {[
            { l: 'Title',    v: form.title },
            { l: 'Category', v: CATEGORIES.find(c => c.id === form.category)?.label || '—' },
            { l: 'Price',    v: form.basePrice ? `₦${parseFloat(form.basePrice).toLocaleString()}` : '—' },
            { l: 'Variants', v: hasVariants
                ? `${variantCount} variant${variantCount !== 1 ? 's' : ''} (${colorGroups.length} color${colorGroups.length !== 1 ? 's' : ''})`
                : `1 variant — ${simpleStock} in stock` },
            { l: 'Images',   v: `${form.images.length} image${form.images.length !== 1 ? 's' : ''}` },
          ].map(r => (
            <View key={r.l} style={[styles.reviewRow, { borderColor: colors.border }]}>
              <Text style={[styles.reviewLabel, { color: '#6B7280' }]}>{r.l}</Text>
              <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>{r.v}</Text>
            </View>
          ))}
        </View>
        {saving && (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <ActivityIndicator size="large" color={colors.gold} />
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 10 }}>Submitting listing…</Text>
          </View>
        )}
      </View>
    );
  };

  const STEPS = [step0, step1, step2, step3, step4, step5, step6];
  const progressPct = `${((step + 1) / TOTAL_STEPS) * 100}%`;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.surface }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={goBack}><CaretLeft size={22} color={colors.navy} weight="bold" /></TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: colors.navy }]}>Add Product</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Step {step + 1} of {TOTAL_STEPS} · {STEP_TITLES[step]}</Text>
        </View>
        <View style={[styles.headerBtn, { alignItems: 'flex-end' }]}>
          {draftSaved && <Text style={{ fontSize: 10, color: colors.gold, fontWeight: '600' }}>✓ Saved</Text>}
        </View>
      </View>

      {/* Progress */}
      <View style={[styles.progTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progFill, { width: progressPct, backgroundColor: colors.gold }]} />
      </View>

      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {STEPS[step]?.()}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom nav */}
      {!submitted && (
        <View style={[styles.bottomBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {step > 0
            ? <TouchableOpacity style={[styles.backBtn, { borderColor: colors.border }]} onPress={goBack}>
                <CaretLeft size={18} color={colors.navy} />
                <Text style={[styles.backBtnTxt, { color: colors.navy }]}>Back</Text>
              </TouchableOpacity>
            : <View style={{ flex: 1 }} />}
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.navy }, saving && { opacity: 0.65 }]}
            onPress={goNext} disabled={saving} activeOpacity={0.88}>
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <><Text style={styles.nextBtnTxt}>{step === 6 ? 'Submit Listing' : 'Continue'}</Text>{step < 6 && <CaretRight size={18} color="#fff" weight="bold" />}</>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root:         { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 58, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerBtn:    { width: 44, height: 44, justifyContent: 'center' },
  headerTitle:  { fontSize: 16, fontWeight: '700' },
  headerSub:    { fontSize: 11, fontWeight: '500', marginTop: 1 },
  progTrack:    { height: 3 },
  progFill:     { height: 3, borderRadius: 2 },
  scroll:       { flex: 1 },
  scrollContent:{ padding: 20 },
  stepTitle:    { fontSize: 22, fontWeight: '800', color: colors.navy, marginBottom: 8, letterSpacing: -0.3 },
  stepSub:      { fontSize: 14, color: colors.textSecondary, lineHeight: 21, marginBottom: 22 },
  fieldLabel:   { fontSize: 13, fontWeight: '600', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4, color: colors.navy },
  miniLabel:    { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 },
  err:          { fontSize: 12, color: '#DC2626', fontWeight: '600', marginBottom: 6, marginTop: 2 },
  catGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  catChip:      { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.2, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: '#fff' },
  catEmoji:     { fontSize: 15 },
  catTxt:       { fontSize: 13, fontWeight: '600', color: colors.navy },
  inputRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.2, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, height: 50, backgroundColor: '#fff', marginBottom: 4 },
  textareaRow:  { alignItems: 'flex-start', paddingTop: 12, height: 'auto' },
  textIn:       { flex: 1, fontSize: 15, color: colors.textPrimary },
  inputErr:     { borderColor: '#DC2626' },
  iconBtn:      { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEF2F2' },
  addRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, padding: 14, marginTop: 4 },
  addRowTxt:    { fontSize: 14, fontWeight: '700' },
  tipBox:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 20 },
  imgGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  imgSlot:      { width: 90, height: 90, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, overflow: 'hidden', position: 'relative' },
  imgFill:      { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  removeImgBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center' },
  imgAdd:       { width: 90, height: 90, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  variantCard:  { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 14, backgroundColor: '#fff' },
  variantTitle: { fontSize: 14, fontWeight: '700' },
  qtyBtn:       { width: 36, height: 36, borderRadius: 10, borderWidth: 1.2, justifyContent: 'center', alignItems: 'center' },
  qtyTxt:       { fontSize: 16, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  feeCard:      { borderWidth: 1, borderRadius: 14, padding: 16, marginTop: 20 },
  feeTitle:     { fontSize: 14, fontWeight: '700' },
  previewCard:  { borderWidth: 1, borderRadius: 16, overflow: 'hidden', marginBottom: 14, backgroundColor: '#fff' },
  previewImg:   { height: 160, justifyContent: 'center', alignItems: 'center' },
  listingBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 4 },
  submitSummary:{ borderWidth: 1, borderRadius: 14, overflow: 'hidden', marginBottom: 14, backgroundColor: '#fff' },
  reviewRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1 },
  reviewLabel:  { fontSize: 13, fontWeight: '600' },
  reviewValue:  { fontSize: 14, fontWeight: '600', textAlign: 'right', flex: 1 },
  successBox:   { width: 90, height: 90, borderRadius: 45, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  primaryBtn:   { width: '100%', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  primaryBtnTxt:{ fontSize: 16, fontWeight: '800' },
  bottomBar:    { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28, borderTopWidth: 1 },
  backBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14 },
  backBtnTxt:   { fontSize: 15, fontWeight: '700' },
  nextBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 15 },
  nextBtnTxt:   { fontSize: 16, fontWeight: '800', color: '#fff' },

  // ── Variant / stock styles ──────────────────────────────────────────────
  toggleCard:       { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderRadius: 14, padding: 16, backgroundColor: '#fff', marginBottom: 20 },
  toggleCardTitle:  { fontSize: 15, fontWeight: '700' },
  simpleStockCard:  { borderWidth: 1, borderRadius: 14, padding: 18, backgroundColor: '#fff', alignItems: 'center', gap: 14, marginBottom: 16 },
  stockStepperRow:  { flexDirection: 'row', alignItems: 'center', gap: 0, borderRadius: 14, overflow: 'hidden', borderWidth: 1.2 },
  stepperBtn:       { width: 52, height: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  stepperBtnSm:     { width: 36, height: 36, borderRadius: 10, borderWidth: 1.2 },
  stockInput:       { width: 90, height: 52, textAlign: 'center', fontSize: 24, fontWeight: '800', borderLeftWidth: 1, borderRightWidth: 1 },
  stockInputSm:     { width: 52, height: 36, textAlign: 'center', fontSize: 15, fontWeight: '700', borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 0, borderBottomWidth: 0 },
  stockBanner:      { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  colorPresetChip:  { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1.3, borderColor: '#CBD5E1', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#fff' },
  colorDot:         { width: 13, height: 13, borderRadius: 7 },
  colorPresetTxt:   { fontSize: 13, fontWeight: '700', color: colors.navy },
  colorGroupCard:   { borderWidth: 1, borderRadius: 16, backgroundColor: '#fff', marginBottom: 16, overflow: 'hidden' },
  colorCardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#E8ECF4' },
  swatchCircle:     { width: 20, height: 20, borderRadius: 10, borderWidth: 1 },
  colorNameInput:   { flex: 1, height: 36, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 14, fontWeight: '700', backgroundColor: '#fff' },
  stockBadge:       { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  stockBadgeText:   { fontSize: 11, fontWeight: '800', color: '#16A34A' },
  colorPhotoBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 14, marginTop: 12, height: 46, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, backgroundColor: '#F8FAFC' },
  colorPhotoTxt:    { fontSize: 13, fontWeight: '700' },
  sizeChipsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14 },
  sizeChip:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1.2, borderColor: '#CBD5E1', backgroundColor: '#fff' },
  sizeChipTxt:      { fontSize: 13, fontWeight: '700', color: colors.navy },
  sizeStockRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingBottom: 4 },
  sizeStockLabel:   { fontSize: 14, fontWeight: '700', minWidth: 70 },
  matrixContainer:  { borderWidth: 1, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
});
