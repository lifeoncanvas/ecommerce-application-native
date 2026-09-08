import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { getAddresses, getShippingRates, addAddress } from '../../api/orders.api';
import { getCoupons, applyCoupon } from '../../api/coupons.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENCY } from '../../utils/currency';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function CheckoutScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { formatPrice } = useCurrency();
  const styles = getStyles(colors);
  const { isBooking, selectedItems } = route.params || {};
  const {
    items,
    discountAmount,
    applyPromoCoupon,
    couponCode,
    couponError,
    setCouponError,
  } = useCart();
  const [loading, setLoading] = useState(false);

  const [promoInput, setPromoInput] = useState('');
  const [couponsModalVisible, setCouponsModalVisible] = useState(false);
  const [coupons, setCoupons] = useState([]);

  const handleOpenCouponsModal = async () => {
    let apiCoupons = [];
    let localCoupons = [];

    try {
      const stored = await AsyncStorage.getItem('@local_coupons');
      if (stored) localCoupons = JSON.parse(stored);
    } catch (err) {}

    try {
      const res = await getCoupons();
      apiCoupons = res.data || [];
    } catch (e) {
      console.warn('GET /api/coupons failed. Loading mock coupons.', e.message);
      apiCoupons = [
        { code: 'TECH20', description: 'Get 20% off on electronics and gadget orders', value: 20 },
        { code: 'FREESHIP', description: `Free shipping on orders above ${formatPrice('990')}`, value: 99 },
        { code: 'HTTN10', description: 'Get a flat 10% discount on food orders', value: 10 }
      ];
    }

    const merged = [...localCoupons, ...apiCoupons];
    const unique = merged.filter((v, i, a) => a.findIndex(t => t.code === v.code) === i);
    setCoupons(unique);
    setCouponsModalVisible(true);
  };

  const handleSelectCoupon = async (code) => {
    setCouponsModalVisible(false);
    try {
      await applyCoupon(code);
      setPromoInput(code);
      applyPromoCoupon(code);
      Alert.alert('Success', `Promo code "${code}" applied successfully!`);
    } catch (e) {
      console.warn('POST /api/cart/apply-coupon failed. Applying locally.', e.message);
      setPromoInput(code);
      applyPromoCoupon(code);
      Alert.alert('Success', `Promo code "${code}" applied (Offline Mode).`);
    }
  };

  const handleApplyCoupon = () => {
    if (!promoInput.trim()) return;
    applyPromoCoupon(promoInput);
  };

  // Lists loaded from Spring Boot endpoints
  const [addresses, setAddresses] = useState([]);
  const [shippingRates, setShippingRates] = useState([]);

  // Selected values
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedRateId, setSelectedRateId] = useState(null);

  // Modal Address form states
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [country, setCountry] = useState('United States');
  const [recipientName, setRecipientName] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [flatHouse, setFlatHouse] = useState('');
  const [areaStreet, setAreaStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Fetch from endpoints in background
  const fetchCheckoutData = useCallback(async () => {
    setLoading(true);
    try {
      const [addressRes, ratesRes] = await withTimeout(
        Promise.all([
          getAddresses(),
          getShippingRates(),
        ]),
        2500
      );

      const addressList = addressRes.data || [];
      const ratesList = ratesRes.data || [];

      setAddresses(addressList);
      setShippingRates(ratesList);

      if (addressList.length > 0) setSelectedAddressId(addressList[0].id);
      if (ratesList.length > 0) setSelectedRateId(ratesList[0].id);
    } catch (e) {
      console.warn('Checkout APIs failed, loading mock fallback data.', e.message);
      const mockAddresses = [
        { id: 'addr_1', name: 'Home Address', address: '123 Main St, New York, NY 10001, United States', phone: '+1 555-0199' },
        { id: 'addr_2', name: 'Office Address', address: '456 Business Plaza, Block 4B, Lagos, Nigeria', phone: '+234 803 123 4567' }
      ];
      const mockRates = [
        { id: 'rate_standard', name: 'Standard Delivery', price: 0, time: '3-5 business days' },
        { id: 'rate_express', name: 'Express Shipping', price: 99, time: '1-2 business days' }
      ];

      setAddresses(mockAddresses);
      setShippingRates(mockRates);
      setSelectedAddressId(mockAddresses[0].id);
      setSelectedRateId(mockRates[0].id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckoutData();
  }, [fetchCheckoutData]);

  // Handle adding new address
  const handleSaveAddress = async () => {
    if (
      !country.trim() ||
      !recipientName.trim() ||
      !recipientNumber.trim() ||
      !flatHouse.trim() ||
      !areaStreet.trim() ||
      !pincode.trim() ||
      !city.trim() ||
      !state.trim()
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Concatenate full address string
    const fullAddressText = `${flatHouse}, ${areaStreet}${landmark ? ', Landmark: ' + landmark : ''}, ${city}, ${state} - ${pincode}, ${country}`;

    const payload = {
      name: recipientName,
      address: fullAddressText,
      phone: recipientNumber,
      isDefault,
    };

    const tempId = 'addr_' + Date.now();

    try {
      const res = await withTimeout(addAddress(payload), 2000);
      const savedAddress = res.data || { ...payload, id: tempId };
      setAddresses((prev) => [...prev, savedAddress]);
      setSelectedAddressId(savedAddress.id);
    } catch (e) {
      console.warn('Add Address API failed, saving locally.', e.message);
      const savedAddress = { ...payload, id: tempId };
      setAddresses((prev) => [...prev, savedAddress]);
      setSelectedAddressId(tempId);
    } finally {
      // Reset form fields
      setRecipientName('');
      setRecipientNumber('');
      setFlatHouse('');
      setAreaStreet('');
      setLandmark('');
      setPincode('');
      setCity('');
      setState('');
      setIsDefault(false);
      setAddAddressModalVisible(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedRate = shippingRates.find((r) => r.id === selectedRateId);
  const shippingCost = selectedRate ? selectedRate.price : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleProceedToPayment = () => {
    if (!selectedAddressId) {
      Alert.alert('Error', 'Please select or add a delivery address.');
      return;
    }
    navigation.navigate('Payment', {
      addressId: selectedAddressId,
      shippingRateId: selectedRateId,
      totalAmount: total,
      selectedItems: selectedItems || items,
      isBooking: isBooking,
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={colors.navy} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Progress Indicators */}
          <View style={styles.progressRow}>
            <View style={[styles.progressStep, styles.stepActive]}><Text style={styles.stepNumActive}>1</Text><Text style={styles.stepTextActive}>Delivery</Text></View>
            <View style={styles.line} />
            <View style={styles.progressStep}><Text style={styles.stepNum}>2</Text><Text style={styles.stepText}>Payment</Text></View>
          </View>

          {/* Delivery Addresses */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TouchableOpacity
                style={styles.addAddressBtn}
                onPress={() => setAddAddressModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.addAddressBtnText}>+ Add New</Text>
              </TouchableOpacity>
            </View>
            {addresses.map((addr) => {
              const isSelected = addr.id === selectedAddressId;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.addressCard, isSelected && styles.cardSelected]}
                  onPress={() => setSelectedAddressId(addr.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardName, isSelected && styles.textActive]}>{addr.name}</Text>
                    {isSelected && <View style={styles.selectedDot} />}
                  </View>
                  <Text style={styles.cardAddress}>{addr.address}</Text>
                  <Text style={styles.cardPhone}>Phone: {addr.phone}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Shipping Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Method</Text>
            {shippingRates.map((rate) => {
              const isSelected = rate.id === selectedRateId;
              return (
                <TouchableOpacity
                  key={rate.id}
                  style={[styles.rateCard, isSelected && styles.cardSelected]}
                  onPress={() => setSelectedRateId(rate.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.rateInfo}>
                    <Text style={[styles.rateName, isSelected && styles.textActive]}>{rate.name}</Text>
                    <Text style={styles.rateTime}>{rate.time}</Text>
                  </View>
                  <Text style={styles.ratePrice}>
                    {rate.price === 0 ? 'FREE' : CURRENCY.format(rate.price)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Order Summary list */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{CURRENCY.format(subtotal)}</Text>
              </View>
              {discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={styles.discountValue}>-{CURRENCY.format(discountAmount)}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping Cost</Text>
                <Text style={styles.summaryValue}>
                  {shippingCost === 0 ? 'FREE' : CURRENCY.format(shippingCost)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.grandTotalRow]}>
                <Text style={styles.grandLabel}>Total Payment</Text>
                <Text style={styles.grandValue}>{CURRENCY.format(total)}</Text>
              </View>
            </View>
          </View>

          {/* Promo Code section */}
          <View style={styles.section}>
            <View style={styles.couponHeaderRow}>
              <Text style={styles.sectionTitle}>Promo Code</Text>
              <TouchableOpacity onPress={handleOpenCouponsModal}>
                <Text style={styles.viewCouponsText}>View Available Coupons 🏷️</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.couponWrapper}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter Promo Code (e.g. LOYAL10)"
                placeholderTextColor={colors.textSecondary}
                value={promoInput}
                onChangeText={(txt) => {
                  setPromoInput(txt);
                  setCouponError('');
                }}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.couponApplyBtn}
                onPress={handleApplyCoupon}
                activeOpacity={0.8}
              >
                <Text style={styles.couponApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>

            {couponError ? (
              <Text style={styles.errorText}>{couponError}</Text>
            ) : couponCode ? (
              <Text style={styles.successText}>Promo code "{couponCode}" applied successfully!</Text>
            ) : null}
          </View>
        </ScrollView>
      )}

      {/* Footer Proceed button */}
      {!loading && (
        <View style={styles.bottomBar}>
          <Button title="Proceed to Payment" onPress={handleProceedToPayment} />
        </View>
      )}

      {/* Add Address Modal */}
      <Modal
        visible={addAddressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddAddressModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setAddAddressModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              
              <Text style={styles.modalLabel}>Country/region</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Country name"
                placeholderTextColor={colors.textSecondary}
                value={country}
                onChangeText={setCountry}
              />

              <Text style={styles.modalLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Recipient name"
                placeholderTextColor={colors.textSecondary}
                value={recipientName}
                onChangeText={setRecipientName}
              />
              
              <Text style={styles.modalLabel}>Contact Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Phone number"
                placeholderTextColor={colors.textSecondary}
                value={recipientNumber}
                onChangeText={setRecipientNumber}
                keyboardType="phone-pad"
              />

              <Text style={styles.modalLabel}>Flat, house no, building, Company, Apartment</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Apartment 4B, Florida Estate"
                placeholderTextColor={colors.textSecondary}
                value={flatHouse}
                onChangeText={setFlatHouse}
              />

              <Text style={styles.modalLabel}>Area, Street, Sector, Village</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Kashev Nagar, Palms Boulevard"
                placeholderTextColor={colors.textSecondary}
                value={areaStreet}
                onChangeText={setAreaStreet}
              />

              <Text style={styles.modalLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Near central park"
                placeholderTextColor={colors.textSecondary}
                value={landmark}
                onChangeText={setLandmark}
              />

              {/* Pincode & Town/City Row */}
              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Pincode</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 10001"
                    placeholderTextColor={colors.textSecondary}
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Town / City</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. New York"
                    placeholderTextColor={colors.textSecondary}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
              </View>

              <Text style={styles.modalLabel}>State</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. NY"
                placeholderTextColor={colors.textSecondary}
                value={state}
                onChangeText={setState}
              />

              {/* Tickbox to make default */}
              <TouchableOpacity
                style={styles.tickboxRow}
                onPress={() => setIsDefault(!isDefault)}
                activeOpacity={0.8}
              >
                <View style={[styles.tickbox, isDefault && styles.tickboxChecked]}>
                  {isDefault && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.tickboxLabel}>make this my default address</Text>
              </TouchableOpacity>
              
              <View style={styles.modalBtnWrapper}>
                <Button title="Use this address" onPress={handleSaveAddress} />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Available Coupons Modal */}
      <Modal
        visible={couponsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCouponsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Coupons</Text>
              <TouchableOpacity onPress={() => setCouponsModalVisible(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
              {coupons.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={styles.couponCard}
                  onPress={() => handleSelectCoupon(c.code)}
                  activeOpacity={0.8}
                >
                  <View style={styles.couponCardHeader}>
                    <Text style={styles.couponCodeText}>{c.code}</Text>
                    <Text style={styles.couponValueTag}>
                      {c.code.includes('10') || c.code.includes('20') ? `SAVE ${c.value}%` : `SAVE ${CURRENCY.format(c.value)}`}
                    </Text>
                  </View>
                  <Text style={styles.couponDescText}>{c.description}</Text>
                  <Text style={styles.applyHint}>Tap to apply promo code</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Close" variant="secondary" onPress={() => setCouponsModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeContainer: {
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
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  line: {
    width: 40,
    height: 1,
    backgroundColor: colors.border,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  stepNumActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.navy,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stepTextActive: {
    ...typography.caption,
    color: colors.navy,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addAddressBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  addAddressBtnText: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
    fontSize: 12,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold,
  },
  cardName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  textActive: {
    color: colors.navy,
  },
  cardAddress: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  cardPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  rateInfo: {
    flex: 1,
  },
  rateName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  rateTime: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  ratePrice: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 13,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  discountValue: {
    ...typography.bodyBold,
    color: colors.error,
  },
  grandTotalRow: {
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm,
  },
  grandLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  grandValue: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  bottomBar: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  modalForm: {
    width: '100%',
  },
  modalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 9,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  modalInput: {
    height: 38,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 13,
  },
  rowFields: {
    flexDirection: 'row',
  },
  tickboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  tickbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  tickboxChecked: {
    borderColor: colors.navy,
    backgroundColor: colors.navy,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  tickboxLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  modalBtnWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  couponHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  viewCouponsText: {
    ...typography.caption,
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  couponWrapper: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 4,
  },
  couponInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    ...typography.caption,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  couponApplyBtn: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponApplyText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  successText: {
    ...typography.caption,
    color: colors.success,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  couponCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
    marginBottom: spacing.sm,
  },
  couponCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponCodeText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  couponValueTag: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '800',
    fontSize: 11,
  },
  couponDescText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  applyHint: {
    ...typography.caption,
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  modalList: {
    flex: 1,
  },
  modalListContent: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  modalCloseIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
});
