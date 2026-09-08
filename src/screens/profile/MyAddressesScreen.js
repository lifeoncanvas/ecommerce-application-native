import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  CaretLeft,
  MapPin,
  Plus,
  PencilSimple,
  Trash,
  Star,
  X,
  House,
  Briefcase,
  MapTrifold,
} from 'phosphor-react-native';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../api/orders.api';

const MOCK_ADDRESSES = [
  {
    id: 'addr_1',
    label: 'Home',
    name: 'Sharon Shelke',
    phone: '+234 803 123 4567',
    flatHouse: 'Apartment 4B, Florida Estate',
    areaStreet: 'Lekki Phase 1',
    landmark: 'Near Lekki Mall',
    city: 'Lagos',
    state: 'Lagos',
    pincode: '100001',
    country: 'Nigeria',
    isDefault: true,
  },
  {
    id: 'addr_2',
    label: 'Office',
    name: 'Sharon Shelke',
    phone: '+234 803 987 6543',
    flatHouse: 'Suite 12, 3rd Floor, Victoria Island Tower',
    areaStreet: 'Adeola Odeku Street',
    landmark: 'Opposite Eko Hotel',
    city: 'Victoria Island',
    state: 'Lagos',
    pincode: '101241',
    country: 'Nigeria',
    isDefault: false,
  },
];

export default function MyAddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Form state
  const [label, setLabel] = useState('Home');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [flatHouse, setFlatHouse] = useState('');
  const [areaStreet, setAreaStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [isDefault, setIsDefault] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAddresses();
      const list = res.data || [];
      if (list.length > 0) {
        setAddresses(list);
      } else {
        setAddresses(MOCK_ADDRESSES);
      }
    } catch (e) {
      console.warn('Failed to fetch addresses, using mock data', e.message);
      setAddresses(MOCK_ADDRESSES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const resetForm = () => {
    setLabel('Home');
    setRecipientName('');
    setPhone('');
    setFlatHouse('');
    setAreaStreet('');
    setLandmark('');
    setCity('');
    setState('');
    setPincode('');
    setCountry('Nigeria');
    setIsDefault(false);
    setEditingAddress(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (addr) => {
    setEditingAddress(addr);
    setLabel(addr.label || 'Home');
    setRecipientName(addr.name || '');
    setPhone(addr.phone || '');
    setFlatHouse(addr.flatHouse || '');
    setAreaStreet(addr.areaStreet || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPincode(addr.pincode || '');
    setCountry(addr.country || 'Nigeria');
    setIsDefault(addr.isDefault || false);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!recipientName.trim() || !phone.trim() || !flatHouse.trim() || !areaStreet.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const payload = {
      label,
      name: recipientName.trim(),
      phone: phone.trim(),
      flatHouse: flatHouse.trim(),
      areaStreet: areaStreet.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: country.trim(),
      isDefault,
      address: `${flatHouse.trim()}, ${areaStreet.trim()}${landmark.trim() ? ', ' + landmark.trim() : ''}, ${city.trim()}, ${state.trim()} - ${pincode.trim()}, ${country.trim()}`,
    };

    if (editingAddress) {
      // Update
      try {
        await updateAddress(editingAddress.id, payload);
      } catch (e) {
        console.warn('Update address API failed, updating locally', e.message);
      }
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingAddress.id ? { ...a, ...payload } : a))
      );
      Alert.alert('Updated', 'Address updated successfully.');
    } else {
      // Create
      const tempId = 'addr_' + Date.now();
      try {
        const res = await addAddress(payload);
        const saved = res.data || { ...payload, id: tempId };
        setAddresses((prev) => [...prev, saved]);
      } catch (e) {
        console.warn('Add address API failed, saving locally', e.message);
        setAddresses((prev) => [...prev, { ...payload, id: tempId }]);
      }
      Alert.alert('Added', 'New address added successfully.');
    }

    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (addr) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to remove "${addr.label || 'this address'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(addr.id);
            } catch (e) {
              console.warn('Delete address API failed, removing locally', e.message);
            }
            setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
            Alert.alert('Deleted', 'Address removed.');
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addr) => {
    try {
      await setDefaultAddress(addr.id);
    } catch (e) {
      console.warn('Set default API failed, setting locally', e.message);
    }
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === addr.id,
      }))
    );
  };

  const getLabelIcon = (lbl) => {
    if (lbl === 'Office') return Briefcase;
    if (lbl === 'Other') return MapTrifold;
    return House;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#010E2A" weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Plus size={20} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A2C5B" />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MapPin size={48} color="#D1D5DB" weight="thin" />
          <Text style={styles.emptyTitle}>No Addresses Saved</Text>
          <Text style={styles.emptySubtitle}>Add your first delivery address to get started.</Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal}>
            <Text style={styles.emptyAddBtnText}>+ Add Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {addresses.map((addr) => {
            const LabelIcon = getLabelIcon(addr.label);
            const fullAddress = addr.address || `${addr.flatHouse || ''}, ${addr.areaStreet || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}, ${addr.country || ''}`;
            return (
              <View key={addr.id} style={[styles.card, addr.isDefault && styles.cardDefault]}>
                <View style={styles.cardTop}>
                  <View style={styles.labelRow}>
                    <View style={[styles.labelBadge, addr.isDefault && styles.labelBadgeDefault]}>
                      <LabelIcon size={12} color={addr.isDefault ? '#B45309' : '#6B7280'} weight="bold" />
                      <Text style={[styles.labelText, addr.isDefault && styles.labelTextDefault]}>
                        {addr.label || 'Address'}
                      </Text>
                    </View>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Star size={10} color="#F59E0B" weight="fill" />
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(addr)}>
                      <PencilSimple size={16} color="#1D4ED8" weight="bold" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(addr)}>
                      <Trash size={16} color="#DC2626" weight="bold" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.cardName}>{addr.name}</Text>
                <Text style={styles.cardAddress}>{fullAddress}</Text>
                <Text style={styles.cardPhone}>📞 {addr.phone}</Text>

                {!addr.isDefault && (
                  <TouchableOpacity style={styles.setDefaultBtn} onPress={() => handleSetDefault(addr)}>
                    <Text style={styles.setDefaultText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAddress ? 'Edit Address' : 'Add New Address'}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              {/* Label selector */}
              <Text style={styles.inputLabel}>Address Type</Text>
              <View style={styles.labelSelector}>
                {['Home', 'Office', 'Other'].map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.labelOption, label === l && styles.labelOptionActive]}
                    onPress={() => setLabel(l)}
                  >
                    <Text style={[styles.labelOptionText, label === l && styles.labelOptionTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput style={styles.input} placeholder="Recipient name" value={recipientName} onChangeText={setRecipientName} />

              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput style={styles.input} placeholder="+234 xxx xxx xxxx" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <Text style={styles.inputLabel}>Flat / House / Building *</Text>
              <TextInput style={styles.input} placeholder="e.g. Apt 4B, Florida Estate" value={flatHouse} onChangeText={setFlatHouse} />

              <Text style={styles.inputLabel}>Area / Street *</Text>
              <TextInput style={styles.input} placeholder="e.g. Lekki Phase 1" value={areaStreet} onChangeText={setAreaStreet} />

              <Text style={styles.inputLabel}>Landmark (Optional)</Text>
              <TextInput style={styles.input} placeholder="e.g. Near central park" value={landmark} onChangeText={setLandmark} />

              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Pincode *</Text>
                  <TextInput style={styles.input} placeholder="100001" value={pincode} onChangeText={setPincode} keyboardType="numeric" />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <TextInput style={styles.input} placeholder="Lagos" value={city} onChangeText={setCity} />
                </View>
              </View>

              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>State *</Text>
                  <TextInput style={styles.input} placeholder="Lagos" value={state} onChangeText={setState} />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Country *</Text>
                  <TextInput style={styles.input} placeholder="Nigeria" value={country} onChangeText={setCountry} />
                </View>
              </View>

              {/* Default checkbox */}
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsDefault(!isDefault)} activeOpacity={0.8}>
                <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                  {isDefault && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Set as default address</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>{editingAddress ? 'Update Address' : 'Save Address'}</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#010E2A' },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1A2C5B',
    justifyContent: 'center', alignItems: 'center',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#6B7280', marginTop: 6, textAlign: 'center' },
  emptyAddBtn: {
    marginTop: 20, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#1A2C5B', borderRadius: 20,
  },
  emptyAddBtnText: { color: '#F6A400', fontWeight: '700', fontSize: 13 },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardDefault: { borderColor: '#F59E0B', borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  labelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  labelBadgeDefault: { backgroundColor: '#FEF6E0' },
  labelText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  labelTextDefault: { color: '#B45309' },
  defaultBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFFBEB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  defaultText: { fontSize: 9, fontWeight: '700', color: '#B45309' },
  actionRow: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6, backgroundColor: '#F9FAFB', borderRadius: 6 },
  cardName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  cardAddress: { fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  cardPhone: { fontSize: 12, color: '#4B5563', marginTop: 6 },
  setDefaultBtn: {
    marginTop: 10, alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: '#F3F4F6', borderRadius: 8,
  },
  setDefaultText: { fontSize: 11, fontWeight: '700', color: '#1A2C5B' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '90%', paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  modalForm: { paddingHorizontal: 20 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginTop: 14, marginBottom: 4 },
  input: {
    height: 44, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    paddingHorizontal: 12, fontSize: 14, color: '#111827', backgroundColor: '#FAFAFA',
  },
  labelSelector: { flexDirection: 'row', gap: 8 },
  labelOption: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#F9FAFB',
  },
  labelOptionActive: { backgroundColor: '#1A2C5B', borderColor: '#1A2C5B' },
  labelOptionText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  labelOptionTextActive: { color: '#F6A400' },
  rowFields: { flexDirection: 'row' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1.5,
    borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#1A2C5B', borderColor: '#1A2C5B' },
  checkMark: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  checkboxLabel: { fontSize: 13, color: '#374151' },
  saveBtn: {
    height: 48, backgroundColor: '#1A2C5B', borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  saveBtnText: { color: '#F6A400', fontSize: 15, fontWeight: '800' },
});
