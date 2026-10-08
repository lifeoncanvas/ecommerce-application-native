import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CaretLeft, CaretRight, CaretDown, Check, CheckCircle,
  Clock, Warning, Info, Storefront, ShoppingBag, Wrench,
  Buildings, User, IdentificationCard, Phone, Bank, MapPin,
  Tag, ArrowClockwise, SealCheck, X, MagnifyingGlass,
  TextAlignLeft, PencilSimple, Confetti,
} from 'phosphor-react-native';
import { typography, spacing, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { registerVendor } from '../../api/vendor.api';

// ─── Static Data ──────────────────────────────────────────────────────────────

const TOTAL_STEPS = 8;

const NIGERIAN_BANKS = [
  { id: 'access',      name: 'Access Bank',                code: '044' },
  { id: 'first',       name: 'First Bank of Nigeria',      code: '011' },
  { id: 'gtbank',      name: 'Guaranty Trust Bank',        code: '058' },
  { id: 'uba',         name: 'United Bank for Africa',     code: '033' },
  { id: 'zenith',      name: 'Zenith Bank',                code: '057' },
  { id: 'stanbic',     name: 'Stanbic IBTC Bank',          code: '221' },
  { id: 'fidelity',    name: 'Fidelity Bank',              code: '070' },
  { id: 'union',       name: 'Union Bank',                 code: '032' },
  { id: 'sterling',    name: 'Sterling Bank',              code: '232' },
  { id: 'polaris',     name: 'Polaris Bank',               code: '076' },
  { id: 'fcmb',        name: 'FCMB',                       code: '214' },
  { id: 'wema',        name: 'Wema Bank',                  code: '035' },
  { id: 'ecobank',     name: 'Ecobank Nigeria',            code: '050' },
  { id: 'kuda',        name: 'Kuda Bank',                  code: '090267' },
  { id: 'opay',        name: 'OPay',                       code: '304' },
  { id: 'palmpay',     name: 'PalmPay',                    code: '999991' },
  { id: 'moniepoint',  name: 'Moniepoint MFB',             code: '50515' },
  { id: 'carbon',      name: 'Carbon (One Finance)',       code: '565' },
  { id: 'parallex',    name: 'Parallex Bank',              code: '526' },
];

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa',
  'Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti',
  'Enugu','FCT – Abuja','Gombe','Imo','Jigawa','Kaduna','Kano',
  'Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger',
  'Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

const CATEGORIES = [
  { id: 'food',        label: 'Food & Dining',         icon: '🍔', nafdac: true,  licence: false },
  { id: 'fashion',     label: 'Fashion & Apparel',     icon: '👗', nafdac: false, licence: false },
  { id: 'electronics', label: 'Electronics & Tech',    icon: '📱', nafdac: false, licence: false },
  { id: 'beauty',      label: 'Beauty & Grooming',     icon: '💄', nafdac: true,  licence: false },
  { id: 'health',      label: 'Health & Pharmacy',     icon: '💊', nafdac: true,  licence: true  },
  { id: 'home',        label: 'Home & Utensils',       icon: '🏠', nafdac: false, licence: false },
  { id: 'services',    label: 'Services',              icon: '🔧', nafdac: false, licence: true  },
  { id: 'groceries',   label: 'Groceries',             icon: '🛒', nafdac: true,  licence: false },
  { id: 'auto',        label: 'Auto & Mobility',       icon: '🚗', nafdac: false, licence: true  },
  { id: 'education',   label: 'Education & Training',  icon: '🎓', nafdac: false, licence: false },
];

const MOCK_NAMES = {
  '1234567890': 'ADAEZE CHIOMA OKONKWO',
  '0987654321': 'EMEKA CHUKWUEMEKA EZE',
  '1111111111': 'FATIMA ABUBAKAR MUSA',
};

// ─── Reusable Components ──────────────────────────────────────────────────────

function InfoBanner({ text, icon, colors }) {
  return (
    <View style={[bannerS.wrap, { backgroundColor: colors.goldLight, borderColor: colors.gold }]}>
      {icon || <Info size={18} color={colors.gold} weight="fill" />}
      <Text style={[bannerS.text, { color: '#7A4F00' }]}>{text}</Text>
    </View>
  );
}
const bannerS = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  text: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '500' },
});

function TrackerStep({ step, label, status, isLast, colors }) {
  const isDone    = status === 'done';
  const isActive  = status === 'active';
  const isFailed  = status === 'failed';
  const dotBg     = isDone ? (colors.success || '#16A34A') : isActive ? colors.gold : isFailed ? '#DC2626' : '#fff';
  const dotBorder = isDone ? (colors.success || '#16A34A') : isActive ? colors.gold : isFailed ? '#DC2626' : '#CBD5E1';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: isLast ? 0 : 4 }}>
      <View style={{ alignItems: 'center', marginRight: 14 }}>
        <View style={[trkS.dot, { backgroundColor: dotBg, borderColor: dotBorder }]}>
          {isDone   && <Check size={13} color="#fff" weight="bold" />}
          {isFailed && <Warning size={13} color="#fff" weight="bold" />}
          {!isDone && !isFailed && <Text style={{ fontSize: 11, fontWeight: '700', color: isActive ? colors.navy : '#94A3B8' }}>{step}</Text>}
        </View>
        {!isLast && <View style={[trkS.line, { backgroundColor: isDone ? (colors.success || '#16A34A') : '#E2E8F0' }]} />}
      </View>
      <View style={{ flex: 1, paddingTop: 5 }}>
        <Text style={[trkS.label, isActive && { color: colors.gold }, isDone && { color: colors.navy }, isFailed && { color: '#DC2626' }]}>{label}</Text>
      </View>
    </View>
  );
}
const trkS = StyleSheet.create({
  dot:   { width: 28, height: 28, borderRadius: 14, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  line:  { width: 2, height: 32, marginTop: 4 },
  label: { fontSize: 15, fontWeight: '600', color: '#94A3B8', marginBottom: 4 },
});

function SelectDropdown({ label, value, options, onSelect, placeholder, colors }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const filtered = options.filter(o => (typeof o === 'string' ? o : o.name).toLowerCase().includes(q.toLowerCase()));
  const display  = value ? (typeof value === 'string' ? value : value.name) : null;
  return (
    <View style={{ marginBottom: 4 }}>
      {label ? <Text style={[dpS.label, { color: colors.navy }]}>{label}</Text> : null}
      <TouchableOpacity style={[dpS.trigger, { borderColor: colors.border }]} onPress={() => { setOpen(true); setQ(''); }} activeOpacity={0.8}>
        <Text style={[dpS.value, !display && { color: '#A1A1AA' }]} numberOfLines={1}>{display || placeholder}</Text>
        <CaretDown size={16} color="#94A3B8" />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dpS.overlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={[dpS.sheet, { backgroundColor: colors.background }]}>
          <View style={[dpS.sheetHead, { borderColor: colors.border }]}>
            <Text style={[dpS.sheetTitle, { color: colors.navy }]}>{label || placeholder}</Text>
            <TouchableOpacity onPress={() => setOpen(false)}><X size={22} color={colors.navy} /></TouchableOpacity>
          </View>
          <View style={[dpS.searchWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <MagnifyingGlass size={16} color="#94A3B8" />
            <TextInput style={[dpS.searchInput, { color: colors.textPrimary }]} placeholder="Search…" placeholderTextColor="#A1A1AA" value={q} onChangeText={setQ} />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => {
              const txt = typeof item === 'string' ? item : item.name;
              const sel = display === txt;
              return (
                <TouchableOpacity style={[dpS.item, sel && { backgroundColor: colors.goldLight }]} onPress={() => { onSelect(item); setOpen(false); }}>
                  <Text style={[dpS.itemTxt, { color: colors.textPrimary }, sel && { color: colors.navy, fontWeight: '700' }]}>{txt}</Text>
                  {sel && <Check size={16} color={colors.gold} weight="bold" />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
const dpS = StyleSheet.create({
  label:      { fontSize: 13, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  trigger:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.2, borderRadius: 12, paddingHorizontal: 14, height: 50, backgroundColor: '#fff' },
  value:      { flex: 1, fontSize: 15, fontWeight: '500', color: '#111827' },
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet:      { maxHeight: '70%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 24 },
  sheetHead:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  sheetTitle: { fontSize: 17, fontWeight: '700' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', margin: 16, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, gap: 8 },
  searchInput:{ flex: 1, height: 42, fontSize: 15 },
  item:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  itemTxt:    { fontSize: 15 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

const INIT = {
  tier: null, sellerType: null, idType: 'nin', idNumber: '', phone: '',
  cacNumber: '', tin: '', directorName: '',
  verificationStatus: 'pending', verificationRef: null,
  storeName: '', storeDescription: '', state: '', area: '', landmark: '',
  bank: null, accountNumber: '', accountName: '', accountResolved: false,
  categories: [], nafdacNumber: '', licenceAttached: false, agreedToTerms: false,
};

const STEP_TITLES = ['Seller Tier','Seller Type','Identity','Store Details','Payout','Categories','Review','Status'];

export default function BecomeVendorScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const { colors } = useTheme();
  const S = getStyles(colors);

  const [step, setStep]   = useState(0);
  const [form, setForm]   = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const scrollRef = useRef(null);

  const set = useCallback((k, v) => setForm(p => ({ ...p, [k]: v })), []);

  const needsNafdac  = form.categories.some(id => CATEGORIES.find(c => c.id === id)?.nafdac);
  const needsLicence = form.categories.some(id => CATEGORIES.find(c => c.id === id)?.licence);

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (step === 0 && !form.tier)                         e.tier = 'Please choose a tier.';
    if (step === 1 && !form.sellerType)                   e.sellerType = 'Please choose what you will sell.';
    if (step === 2) {
      if (!form.idNumber.trim() || form.idNumber.length < 11) e.idNumber = 'Enter a valid 11-digit ' + form.idType.toUpperCase() + '.';
      if (form.tier === 'business') {
        if (!form.cacNumber.trim())    e.cacNumber    = 'CAC number is required.';
        if (!form.tin.trim())          e.tin          = 'TIN is required.';
        if (!form.directorName.trim()) e.directorName = 'Director name is required.';
      }
    }
    if (step === 3) {
      if (!form.storeName.trim())        e.storeName        = 'Store name is required.';
      if (!form.storeDescription.trim()) e.storeDescription = 'Description is required.';
      if (!form.state)                   e.state            = 'Please select your state.';
      if (!form.area.trim())             e.area             = 'Area / neighbourhood is required.';
    }
    if (step === 4) {
      if (!form.bank)                              e.bank            = 'Please select your bank.';
      if (form.accountNumber.trim().length < 10)   e.accountNumber   = 'Enter a valid 10-digit account number.';
      if (!form.accountResolved)                   e.accountResolved = 'Please verify your account name first.';
    }
    if (step === 5 && form.categories.length === 0) e.categories = 'Select at least one category.';
    if (step === 6 && !form.agreedToTerms)           e.agreedToTerms = 'You must agree to the Seller Agreement.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate()) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (step === 6) { doSubmit(); } else { setStep(s => s + 1); }
  };

  const goBack = () => {
    if (step === 0) { navigation.goBack(); return; }
    if (step === 7) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setStep(s => s - 1);
  };

  const resolveAccount = async () => {
    setResolving(true);
    await new Promise(r => setTimeout(r, 1400));
    const name = MOCK_NAMES[form.accountNumber.trim()] || 'AMINA OLADELE IBRAHIM';
    set('accountName', name);
    set('accountResolved', true);
    setErrors(p => ({ ...p, accountResolved: undefined }));
    setResolving(false);
  };

  const doSubmit = async () => {
    setLoading(true);
    setStep(7);
    set('verificationStatus', 'submitted');
    await new Promise(r => setTimeout(r, 800));
    set('verificationStatus', 'verifying');
    try { await registerVendor({ businessName: form.storeName, tier: form.tier }); } catch (_) {}
    setTimeout(() => {
      set('verificationStatus', 'approved');
      set('verificationRef', `VRF-${Date.now()}`);
      setUser(p => ({ ...p, isVendor: true, vendorId: `v_${Date.now()}`, storeName: form.storeName }));
      setLoading(false);
    }, 2000);
  };

  // ── Step Renderers ──────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <View>
      <Text style={S.stepTitle}>Choose your seller tier</Text>
      <Text style={S.stepSub}>Select the option that best describes you. You can upgrade anytime.</Text>
      {[
        {
          key: 'individual', Icon: User, title: 'Individual Seller', badge: 'Tier 1',
          desc: 'Sell with your personal identity (NIN / BVN). Near-instant approval.',
          perks: ['NIN or BVN verification', 'Personal bank account', 'Near-instant approval', 'Limited payout per cycle'],
        },
        {
          key: 'business', Icon: Buildings, title: 'Registered Business', badge: 'Tier 2',
          desc: 'Sell under your CAC-registered company. Higher limits, business badge.',
          perks: ['CAC + TIN required', 'Business bank account', 'Manual review (1–2 days)', 'Higher / unlimited limits', 'Business badge on store'],
        },
      ].map(opt => {
        const active = form.tier === opt.key;
        return (
          <TouchableOpacity key={opt.key}
            style={[S.tierCard, active && { borderColor: colors.gold, backgroundColor: colors.navy }]}
            onPress={() => { set('tier', opt.key); setErrors({}); }} activeOpacity={0.85}>
            <View style={[S.tierIcon, active && { backgroundColor: colors.gold }]}>
              <opt.Icon size={26} color={active ? colors.navy : colors.navy} weight="fill" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={[S.tierTitle, active && { color: '#fff' }]}>{opt.title}</Text>
                <View style={[S.tierBadge, active && { backgroundColor: colors.gold }]}>
                  <Text style={[S.tierBadgeTxt, active && { color: colors.navy }]}>{opt.badge}</Text>
                </View>
              </View>
              <Text style={[S.tierDesc, active && { color: 'rgba(255,255,255,0.72)' }]}>{opt.desc}</Text>
              <View style={{ marginTop: 10, gap: 5 }}>
                {opt.perks.map(p => (
                  <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <Check size={12} color={active ? colors.gold : colors.success || '#16A34A'} weight="bold" />
                    <Text style={[S.tierPerk, active && { color: 'rgba(255,255,255,0.75)' }]}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
      {errors.tier && <Text style={S.err}>{errors.tier}</Text>}
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={S.stepTitle}>What will you sell?</Text>
      <Text style={S.stepSub}>You can enable both and manage Products and Services separately from your dashboard.</Text>
      {[
        { key: 'products',  Icon: ShoppingBag, title: 'Products', desc: 'Physical or digital goods with inventory, SKUs, and variants.' },
        { key: 'services',  Icon: Wrench,       title: 'Services', desc: 'Bookable appointments with scheduling and availability.' },
        { key: 'both',      Icon: Storefront,   title: 'Products & Services', desc: 'Run a full store with two sections — items and bookings.' },
      ].map(opt => {
        const active = form.sellerType === opt.key;
        return (
          <TouchableOpacity key={opt.key}
            style={[S.typeCard, active && { borderColor: colors.gold, backgroundColor: colors.navy }]}
            onPress={() => { set('sellerType', opt.key); setErrors({}); }} activeOpacity={0.85}>
            <View style={[S.typeIcon, active && { backgroundColor: colors.gold }]}>
              <opt.Icon size={24} color={colors.navy} weight="fill" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[S.typeTitle, active && { color: '#fff' }]}>{opt.title}</Text>
              <Text style={[S.typeDesc, active && { color: 'rgba(255,255,255,0.7)' }]}>{opt.desc}</Text>
            </View>
            {active && <Check size={20} color={colors.gold} weight="bold" />}
          </TouchableOpacity>
        );
      })}
      {errors.sellerType && <Text style={S.err}>{errors.sellerType}</Text>}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={S.stepTitle}>Verify your identity</Text>
      <Text style={S.stepSub}>
        {form.tier === 'individual'
          ? 'We use NIN or BVN to confirm your identity — this protects buyers and makes payouts safer.'
          : 'Business verification requires CAC, TIN, and a director identity check.'}
      </Text>

      <InfoBanner colors={colors}
        text="Your ID number is sent directly to our licensed verification partner and is never stored on our servers — we only record a status and reference code." />

      <Text style={S.fieldLabel}>Verification Method</Text>
      <View style={S.toggleRow}>
        {['nin', 'bvn'].map(t => (
          <TouchableOpacity key={t}
            style={[S.toggleBtn, form.idType === t && { backgroundColor: colors.navy }]}
            onPress={() => set('idType', t)}>
            <Text style={[S.toggleTxt, form.idType === t && { color: '#fff' }]}>
              {t === 'nin' ? '🪪  NIN' : '🏦  BVN'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <InfoBanner colors={colors}
        text={form.idType === 'nin'
          ? 'Your NIN is an 11-digit number on your NIN slip or national ID card. It confirms your legal name matches your payout account.'
          : 'Your BVN is an 11-digit number linked to all your bank accounts, issued by the CBN. It lets us confirm your identity quickly.'} />

      <Text style={S.fieldLabel}>{form.idType === 'nin' ? 'NIN (11 digits)' : 'BVN (11 digits)'} *</Text>
      <View style={[S.inputRow, errors.idNumber && S.inputErr]}>
        <IdentificationCard size={18} color="#94A3B8" />
        <TextInput style={S.textIn} value={form.idNumber} secureTextEntry
          onChangeText={v => { set('idNumber', v.replace(/\D/g,'').slice(0,11)); setErrors(p => ({ ...p, idNumber: undefined })); }}
          placeholder="e.g. 12345678901" placeholderTextColor="#A1A1AA" keyboardType="numeric" maxLength={11} />
        {form.idNumber.length === 11 && <Check size={18} color={colors.success || '#16A34A'} weight="bold" />}
      </View>
      {errors.idNumber && <Text style={S.err}>{errors.idNumber}</Text>}

      <Text style={[S.fieldLabel, { marginTop: 14 }]}>Phone Number (+234)</Text>
      <View style={S.inputRow}>
        <Phone size={18} color="#94A3B8" />
        <Text style={[S.textIn, { width: 46, color: '#94A3B8' }]}>+234</Text>
        <TextInput style={[S.textIn, { flex: 1 }]} placeholder="8012345678" placeholderTextColor="#A1A1AA"
          value={form.phone} onChangeText={v => set('phone', v.replace(/\D/g,'').slice(0,10))} keyboardType="phone-pad" />
      </View>
      <Text style={S.hint}>OTP will be sent via SMS or WhatsApp — your choice.</Text>

      {form.tier === 'business' && (
        <View style={{ marginTop: 20 }}>
          <View style={[S.divider, { marginBottom: 18 }]} />
          <Text style={[S.sectionLabel, { color: colors.navy }]}>Business Registration (Tier 2)</Text>

          <Text style={S.fieldLabel}>CAC Number *</Text>
          <View style={[S.inputRow, errors.cacNumber && S.inputErr]}>
            <Buildings size={18} color="#94A3B8" />
            <TextInput style={S.textIn} value={form.cacNumber}
              onChangeText={v => { set('cacNumber', v); setErrors(p => ({ ...p, cacNumber: undefined })); }}
              placeholder="e.g. CAC/BN/1234567" placeholderTextColor="#A1A1AA" />
          </View>
          {errors.cacNumber && <Text style={S.err}>{errors.cacNumber}</Text>}

          <Text style={[S.fieldLabel, { marginTop: 14 }]}>TIN (Tax Identification Number) *</Text>
          <View style={[S.inputRow, errors.tin && S.inputErr]}>
            <Tag size={18} color="#94A3B8" />
            <TextInput style={S.textIn} value={form.tin}
              onChangeText={v => { set('tin', v); setErrors(p => ({ ...p, tin: undefined })); }}
              placeholder="e.g. 12345678-0001" placeholderTextColor="#A1A1AA" />
          </View>
          {errors.tin && <Text style={S.err}>{errors.tin}</Text>}

          <Text style={[S.fieldLabel, { marginTop: 14 }]}>Director / Owner Full Name *</Text>
          <View style={[S.inputRow, errors.directorName && S.inputErr]}>
            <User size={18} color="#94A3B8" />
            <TextInput style={S.textIn} value={form.directorName}
              onChangeText={v => { set('directorName', v); setErrors(p => ({ ...p, directorName: undefined })); }}
              placeholder="Full legal name as on CAC" placeholderTextColor="#A1A1AA" />
          </View>
          {errors.directorName && <Text style={S.err}>{errors.directorName}</Text>}
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={S.stepTitle}>Your store details</Text>
      <Text style={S.stepSub}>Tell buyers who you are and where you operate.</Text>

      <Text style={S.fieldLabel}>Store Name *</Text>
      <View style={[S.inputRow, errors.storeName && S.inputErr]}>
        <Storefront size={18} color="#94A3B8" />
        <TextInput style={S.textIn} value={form.storeName}
          onChangeText={v => { set('storeName', v); setErrors(p => ({ ...p, storeName: undefined })); }}
          placeholder="e.g. Mama Ngozi's Kitchen" placeholderTextColor="#A1A1AA" />
      </View>
      {errors.storeName && <Text style={S.err}>{errors.storeName}</Text>}

      <Text style={[S.fieldLabel, { marginTop: 14 }]}>Store Description *</Text>
      <View style={[S.inputRow, S.textareaRow, errors.storeDescription && S.inputErr]}>
        <TextAlignLeft size={18} color="#94A3B8" style={{ marginTop: 3 }} />
        <TextInput style={[S.textIn, { height: 90, textAlignVertical: 'top' }]}
          value={form.storeDescription} multiline numberOfLines={4}
          onChangeText={v => { set('storeDescription', v); setErrors(p => ({ ...p, storeDescription: undefined })); }}
          placeholder="Describe what your store specialises in…" placeholderTextColor="#A1A1AA" />
      </View>
      {errors.storeDescription && <Text style={S.err}>{errors.storeDescription}</Text>}

      <View style={{ marginTop: 14 }}>
        <SelectDropdown label="State *" value={form.state} options={NIGERIAN_STATES}
          onSelect={v => { set('state', v); setErrors(p => ({ ...p, state: undefined })); }}
          placeholder="Select your state" colors={colors} />
        {errors.state && <Text style={S.err}>{errors.state}</Text>}
      </View>

      <Text style={[S.fieldLabel, { marginTop: 14 }]}>Area / Neighbourhood *</Text>
      <View style={[S.inputRow, errors.area && S.inputErr]}>
        <MapPin size={18} color="#94A3B8" />
        <TextInput style={S.textIn} value={form.area}
          onChangeText={v => { set('area', v); setErrors(p => ({ ...p, area: undefined })); }}
          placeholder="e.g. Lekki Phase 1, Victoria Island" placeholderTextColor="#A1A1AA" />
      </View>
      {errors.area && <Text style={S.err}>{errors.area}</Text>}

      <Text style={[S.fieldLabel, { marginTop: 14 }]}>Landmark (Optional)</Text>
      <View style={S.inputRow}>
        <MapPin size={18} color="#94A3B8" />
        <TextInput style={S.textIn} value={form.landmark} onChangeText={v => set('landmark', v)}
          placeholder="e.g. Near Total Filling Station" placeholderTextColor="#A1A1AA" />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={S.stepTitle}>Payout account</Text>
      <Text style={S.stepSub}>Earnings are settled here. The account name must match your verified identity.</Text>
      <InfoBanner colors={colors}
        text="We resolve your account name automatically — confirm it matches your NIN / CAC before continuing." />

      <SelectDropdown label="Bank *" value={form.bank} options={NIGERIAN_BANKS}
        onSelect={v => { set('bank', v); set('accountResolved', false); set('accountName', ''); }}
        placeholder="Select your bank" colors={colors} />
      {errors.bank && <Text style={S.err}>{errors.bank}</Text>}

      <Text style={[S.fieldLabel, { marginTop: 14 }]}>Account Number (10 digits) *</Text>
      <View style={[S.inputRow, errors.accountNumber && S.inputErr]}>
        <Bank size={18} color="#94A3B8" />
        <TextInput style={S.textIn} value={form.accountNumber} keyboardType="numeric" maxLength={10}
          onChangeText={v => { set('accountNumber', v.replace(/\D/g,'').slice(0,10)); set('accountResolved', false); set('accountName', ''); }}
          placeholder="0123456789" placeholderTextColor="#A1A1AA" />
      </View>
      {errors.accountNumber && <Text style={S.err}>{errors.accountNumber}</Text>}

      {form.accountNumber.length === 10 && form.bank && !form.accountResolved && (
        <TouchableOpacity style={[S.resolveBtn, { borderColor: colors.gold, backgroundColor: colors.goldLight }]}
          onPress={resolveAccount} activeOpacity={0.8}>
          {resolving
            ? <ActivityIndicator size="small" color={colors.gold} />
            : <><ArrowClockwise size={16} color={colors.gold} /><Text style={[S.resolveTxt, { color: '#7A4F00' }]}>Verify Account Name</Text></>}
        </TouchableOpacity>
      )}

      {form.accountResolved && (
        <View style={[S.resolvedCard, { borderColor: colors.success || '#16A34A', backgroundColor: '#F0FDF4' }]}>
          <CheckCircle size={20} color={colors.success || '#16A34A'} weight="fill" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#16A34A', fontWeight: '600', marginBottom: 2 }}>Account Verified</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>{form.accountName}</Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>{form.bank?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => { set('accountResolved', false); set('accountName', ''); }}>
            <PencilSimple size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      )}
      {errors.accountResolved && <Text style={S.err}>{errors.accountResolved}</Text>}
    </View>
  );

  const renderStep5 = () => (
    <View>
      <Text style={S.stepTitle}>Categories & compliance</Text>
      <Text style={S.stepSub}>Select your categories. Regulated ones need a few extra details — we'll ask below.</Text>
      <View style={S.catGrid}>
        {CATEGORIES.map(cat => {
          const active = form.categories.includes(cat.id);
          return (
            <TouchableOpacity key={cat.id}
              style={[S.catChip, active && { backgroundColor: colors.navy, borderColor: colors.navy }]}
              onPress={() => {
                const next = active ? form.categories.filter(c => c !== cat.id) : [...form.categories, cat.id];
                set('categories', next);
                setErrors(p => ({ ...p, categories: undefined }));
              }} activeOpacity={0.8}>
              <Text style={S.catEmoji}>{cat.icon}</Text>
              <Text style={[S.catTxt, active && { color: '#fff' }]}>{cat.label}</Text>
              {(cat.nafdac || cat.licence) && (
                <View style={[S.regDot, { backgroundColor: active ? colors.gold : '#E2E8F0' }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {errors.categories && <Text style={S.err}>{errors.categories}</Text>}

      {needsNafdac && (
        <View style={{ marginTop: 20 }}>
          <InfoBanner colors={colors} icon={<Warning size={18} color={colors.gold} weight="fill" />}
            text="Food, beauty, health, and grocery products require a NAFDAC registration number. You can add it now or later — our compliance team will follow up." />
          <Text style={S.fieldLabel}>NAFDAC Number</Text>
          <View style={S.inputRow}>
            <IdentificationCard size={18} color="#94A3B8" />
            <TextInput style={S.textIn} value={form.nafdacNumber} onChangeText={v => set('nafdacNumber', v)}
              placeholder="e.g. A7-1234" placeholderTextColor="#A1A1AA" />
          </View>
        </View>
      )}

      {needsLicence && (
        <View style={{ marginTop: 16 }}>
          <InfoBanner colors={colors} icon={<Warning size={18} color={colors.gold} weight="fill" />}
            text="Services in health, auto, or finance may require a professional licence. This is optional for now — you can upload from your dashboard later." />
          <TouchableOpacity
            style={[S.uploadBox, form.licenceAttached && { borderColor: colors.success || '#16A34A', backgroundColor: '#F0FDF4' }]}
            onPress={() => set('licenceAttached', !form.licenceAttached)} activeOpacity={0.8}>
            {form.licenceAttached
              ? <><CheckCircle size={22} color={colors.success || '#16A34A'} weight="fill" /><Text style={{ color: '#16A34A', fontWeight: '600' }}>Licence attached</Text></>
              : <><Tag size={22} color="#94A3B8" /><Text style={{ color: '#6B7280' }}>Attach licence document (optional)</Text></>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderStep6 = () => {
    const catLabels = form.categories.map(id => CATEGORIES.find(c => c.id === id)?.label).filter(Boolean);
    const rows = [
      { Icon: User,            label: 'Tier',       value: form.tier === 'individual' ? 'Individual Seller (Tier 1)' : 'Registered Business (Tier 2)' },
      { Icon: ShoppingBag,     label: 'Sells',      value: { products: 'Products', services: 'Services', both: 'Products & Services' }[form.sellerType] },
      { Icon: IdentificationCard, label: 'Identity',value: form.idType.toUpperCase() + ' ••••' + form.idNumber.slice(-4) },
      { Icon: Storefront,      label: 'Store',      value: form.storeName },
      { Icon: MapPin,          label: 'Location',   value: `${form.area}, ${form.state}` },
      { Icon: Bank,            label: 'Payout',     value: `${form.accountName} · ${form.bank?.name}` },
      { Icon: Tag,             label: 'Categories', value: catLabels.join(', ') || '—' },
    ];
    return (
      <View>
        <Text style={S.stepTitle}>Review your application</Text>
        <Text style={S.stepSub}>Everything look good? Tap "Submit" to send for review.</Text>
        {rows.map(r => (
          <View key={r.label} style={[S.reviewRow, { borderColor: colors.border }]}>
            <View style={[S.reviewIcon, { backgroundColor: colors.goldLight }]}><r.Icon size={15} color={colors.navy} weight="bold" /></View>
            <Text style={[S.reviewLabel, { color: '#6B7280' }]}>{r.label}</Text>
            <Text style={[S.reviewValue, { color: colors.textPrimary }]} numberOfLines={2}>{r.value}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={[S.agreeRow, { borderColor: form.agreedToTerms ? colors.gold : colors.border }]}
          onPress={() => { set('agreedToTerms', !form.agreedToTerms); setErrors(p => ({ ...p, agreedToTerms: undefined })); }}
          activeOpacity={0.9}>
          <View style={[S.checkbox, form.agreedToTerms && { backgroundColor: colors.navy, borderColor: colors.navy }]}>
            {form.agreedToTerms && <Check size={12} color="#fff" weight="bold" />}
          </View>
          <Text style={[S.agreeTxt, { color: colors.textSecondary }]}>
            I agree to the <Text style={{ color: colors.navy, fontWeight: '700' }}>Seller Agreement</Text> and <Text style={{ color: colors.navy, fontWeight: '700' }}>Commission Policy</Text>.
          </Text>
        </TouchableOpacity>
        {errors.agreedToTerms && <Text style={S.err}>{errors.agreedToTerms}</Text>}
      </View>
    );
  };

  const renderStep7 = () => {
    const vs = form.verificationStatus;
    const statusConfig = {
      submitted:     { label: 'Submitted',     color: colors.gold,               Icon: Clock      },
      verifying:     { label: 'Verifying…',    color: '#2563EB',                 Icon: null       },
      approved:      { label: 'Approved! 🎉',  color: colors.success || '#16A34A', Icon: SealCheck  },
      needs_changes: { label: 'Needs Changes', color: '#DC2626',                 Icon: Warning    },
    };
    const cfg = statusConfig[vs] || statusConfig.submitted;
    const trackerSteps = [
      { label: 'Application Submitted' },
      { label: 'Identity Verification' },
      { label: 'Approved & Go Live'    },
    ];
    const order = ['submitted', 'verifying', 'approved'];
    const idx = order.indexOf(vs);

    return (
      <View>
        <View style={S.statusHero}>
          <View style={[S.statusIconBox, { backgroundColor: cfg.color + '18', borderColor: cfg.color }]}>
            {vs === 'verifying'
              ? <ActivityIndicator size="large" color={cfg.color} />
              : cfg.Icon ? <cfg.Icon size={32} color={cfg.color} weight="fill" /> : null}
          </View>
          <Text style={[S.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
          <Text style={[S.statusDesc, { color: colors.textSecondary }]}>
            {vs === 'approved'
              ? `"${form.storeName}" is live. You'll receive a WhatsApp notification shortly.`
              : vs === 'needs_changes'
              ? 'Some details need updating before your store can go live.'
              : 'We are reviewing your application. This usually takes a few minutes to 2 business days.'}
          </Text>
        </View>

        <View style={[S.trackerCard, { borderColor: colors.border }]}>
          {trackerSteps.map((ts, i) => {
            let status = 'pending';
            if (i < idx) status = 'done';
            else if (i === idx && vs !== 'needs_changes') status = 'active';
            else if (i === idx && vs === 'needs_changes') status = 'failed';
            return <TrackerStep key={i} step={i+1} label={ts.label} status={status} isLast={i === trackerSteps.length - 1} colors={colors} />;
          })}
        </View>

        {vs === 'approved' && (
          <TouchableOpacity style={[S.cta, { backgroundColor: colors.gold }]}
            onPress={() => navigation.replace('VendorDashboard')} activeOpacity={0.88}>
            <Confetti size={20} color={colors.navy} weight="fill" />
            <Text style={[S.ctaTxt, { color: colors.navy }]}>Go to My Dashboard</Text>
          </TouchableOpacity>
        )}

        {vs === 'needs_changes' && (
          <>
            <View style={[S.failedCard, { borderColor: '#DC2626', backgroundColor: '#FEF2F2' }]}>
              <Warning size={18} color="#DC2626" weight="fill" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: '#DC2626', fontSize: 14 }}>Action Required: CAC Number</Text>
                <Text style={{ color: '#7F1D1D', fontSize: 13, marginTop: 3 }}>The CAC number you entered could not be verified. Please correct and resubmit.</Text>
              </View>
            </View>
            <TouchableOpacity style={[S.cta, { backgroundColor: colors.navy, marginTop: 10 }]}
              onPress={() => { set('verificationStatus', 'pending'); setStep(2); }} activeOpacity={0.88}>
              <PencilSimple size={18} color="#fff" weight="bold" />
              <Text style={[S.ctaTxt, { color: '#fff' }]}>Fix & Resubmit</Text>
            </TouchableOpacity>
          </>
        )}

        {vs !== 'approved' && vs !== 'needs_changes' && (
          <View style={[S.notifNote, { backgroundColor: colors.goldLight, borderColor: colors.gold }]}>
            <Info size={16} color={colors.gold} />
            <Text style={{ flex: 1, fontSize: 13, color: '#7A4F00', fontWeight: '500' }}>
              We'll notify you via push notification and WhatsApp when your status changes.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const STEPS = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7];
  const progressPct = `${((step + 1) / TOTAL_STEPS) * 100}%`;

  return (
    <SafeAreaView style={[S.root, { backgroundColor: colors.surface }]} edges={['top']}>

      {/* Header */}
      <View style={[S.header, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {step < 7
          ? <TouchableOpacity style={S.headerBtn} onPress={goBack}><CaretLeft size={22} color={colors.navy} weight="bold" /></TouchableOpacity>
          : <View style={S.headerBtn} />}
        <View style={{ alignItems: 'center' }}>
          <Text style={[S.headerTitle, { color: colors.navy }]}>Become a Seller</Text>
          {step < 7 && <Text style={[S.headerSub, { color: colors.textSecondary }]}>Step {step+1} of {TOTAL_STEPS} · {STEP_TITLES[step]}</Text>}
        </View>
        <View style={S.headerBtn} />
      </View>

      {/* Progress Bar */}
      {step < 7 && (
        <View style={[S.progTrack, { backgroundColor: colors.border }]}>
          <View style={[S.progFill, { width: progressPct, backgroundColor: colors.gold }]} />
        </View>
      )}

      {/* Content */}
      <ScrollView ref={scrollRef} style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        {STEPS[step]?.()}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Nav */}
      {step < 7 && (
        <View style={[S.bottomBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {step > 0
            ? <TouchableOpacity style={[S.backBtn, { borderColor: colors.border }]} onPress={goBack}>
                <CaretLeft size={18} color={colors.navy} />
                <Text style={[S.backBtnTxt, { color: colors.navy }]}>Back</Text>
              </TouchableOpacity>
            : <View style={{ flex: 1 }} />}
          <TouchableOpacity
            style={[S.nextBtn, { backgroundColor: colors.navy }, loading && { opacity: 0.65 }]}
            onPress={goNext} disabled={loading} activeOpacity={0.88}>
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <><Text style={S.nextBtnTxt}>{step === 6 ? 'Submit Application' : 'Continue'}</Text>
                  {step < 6 && <CaretRight size={18} color="#fff" weight="bold" />}</>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (colors) => StyleSheet.create({
  root:         { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 58, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerBtn:    { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle:  { fontSize: 16, fontWeight: '700' },
  headerSub:    { fontSize: 11, fontWeight: '500', marginTop: 1 },
  progTrack:    { height: 3 },
  progFill:     { height: 3, borderRadius: 2 },
  scroll:       { flex: 1 },
  scrollContent:{ padding: 20 },

  stepTitle:  { fontSize: 22, fontWeight: '800', color: colors.navy, marginBottom: 8, letterSpacing: -0.3 },
  stepSub:    { fontSize: 14, color: colors.textSecondary, lineHeight: 21, marginBottom: 24 },
  sectionLabel:{ fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4, color: colors.navy },
  hint:       { fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 4 },
  divider:    { height: 1, backgroundColor: colors.border },

  tierCard:  { flexDirection: 'row', gap: 14, borderWidth: 1.5, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 14, backgroundColor: '#fff' },
  tierIcon:  { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.goldLight, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  tierTitle: { fontSize: 16, fontWeight: '700', color: colors.navy },
  tierBadge: { backgroundColor: colors.goldLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tierBadgeTxt:{ fontSize: 11, fontWeight: '700', color: colors.gold },
  tierDesc:  { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginTop: 2 },
  tierPerk:  { fontSize: 12, color: colors.textSecondary },

  typeCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, padding: 16, marginBottom: 12, backgroundColor: '#fff' },
  typeIcon:  { width: 46, height: 46, borderRadius: 12, backgroundColor: colors.goldLight, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  typeTitle: { fontSize: 15, fontWeight: '700', color: colors.navy, marginBottom: 2 },
  typeDesc:  { fontSize: 13, color: colors.textSecondary },

  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  toggleBtn: { flex: 1, height: 46, borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  toggleTxt: { fontSize: 14, fontWeight: '700', color: colors.navy },

  inputRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.2, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, height: 50, backgroundColor: '#fff', marginBottom: 4 },
  textareaRow:{ alignItems: 'flex-start', paddingTop: 12, height: 'auto' },
  textIn:     { flex: 1, fontSize: 15, color: colors.textPrimary },
  inputErr:   { borderColor: '#DC2626' },
  err:        { fontSize: 12, color: '#DC2626', fontWeight: '600', marginBottom: 6, marginTop: 2 },

  resolveBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, borderWidth: 1.5, borderRadius: 10, paddingVertical: 13 },
  resolveTxt:  { fontSize: 14, fontWeight: '700' },
  resolvedCard:{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, borderWidth: 1.5, borderRadius: 12, padding: 14 },

  catGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 6 },
  catChip:  { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.2, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: '#fff' },
  catEmoji: { fontSize: 15 },
  catTxt:   { fontSize: 13, fontWeight: '600', color: colors.navy },
  regDot:   { width: 6, height: 6, borderRadius: 3 },
  uploadBox:{ flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 12, padding: 16, marginTop: 8 },

  reviewRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
  reviewIcon:  { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1 },
  reviewLabel: { width: 80, fontSize: 13, fontWeight: '600', paddingTop: 3 },
  reviewValue: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },

  agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1.5, borderRadius: 12, padding: 14, marginTop: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1 },
  agreeTxt: { flex: 1, fontSize: 14, lineHeight: 21 },

  statusHero:   { alignItems: 'center', paddingVertical: 28 },
  statusIconBox:{ width: 76, height: 76, borderRadius: 38, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statusLabel:  { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  statusDesc:   { fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: 20, maxWidth: 320 },
  trackerCard:  { borderWidth: 1, borderRadius: 16, padding: 20, marginTop: 20 },
  cta:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20, borderRadius: 14, paddingVertical: 16 },
  ctaTxt:       { fontSize: 16, fontWeight: '800' },
  failedCard:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1.5, borderRadius: 12, padding: 14, marginTop: 20 },
  notifNote:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 20 },

  bottomBar:  { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28, borderTopWidth: 1 },
  backBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14 },
  backBtnTxt: { fontSize: 15, fontWeight: '700' },
  nextBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 15 },
  nextBtnTxt: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
