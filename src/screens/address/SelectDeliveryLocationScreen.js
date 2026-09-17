import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  ActivityIndicator,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MagnifyingGlass,
  MapPin,
  Crosshair,
  House,
  Briefcase,
  Buildings,
  Check,
  X,
} from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { getCurrentLocationAddressAsync } from '../../utils/locationManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Default initial location: Florida Estate Rd, Mundhwa / Kharadi, Pune (from img 3)
const DEFAULT_COORDS = {
  latitude: 18.5358,
  longitude: 73.9312,
  title: 'GWJP+PV4, Florida Estate Rd',
  subAddress: 'GWJP+PV4, Florida Estate Rd, Shankar Nagar, Mundhwa, Pune, Maharashtra 411036, India',
  road: 'Florida Estate Rd',
  area: 'Mundhwa',
  city: 'Pune',
  pincode: '411036',
};

const SAMPLE_SEARCH_RESULTS = [
  {
    title: 'Florida Estate Rd',
    sub: 'Shankar Nagar, Mundhwa, Pune, Maharashtra 411036',
    lat: 18.5358,
    lon: 73.9312,
  },
  {
    title: 'Kharadi Bypass',
    sub: 'Near EON Free Zone, Kharadi, Pune, Maharashtra 411014',
    lat: 18.5529,
    lon: 73.9427,
  },
  {
    title: 'Pimple Nilak',
    sub: 'Avenue 66, Pimple Nilak, Pune, Maharashtra 411027',
    lat: 18.5824,
    lon: 73.7915,
  },
  {
    title: 'Koregaon Park',
    sub: 'North Main Road, Koregaon Park, Pune, Maharashtra 411001',
    lat: 18.5362,
    lon: 73.8940,
  },
  {
    title: 'Viman Nagar',
    sub: 'Symbiosis Road, Viman Nagar, Pune, Maharashtra 411014',
    lat: 18.5679,
    lon: 73.9143,
  },
];

export default function SelectDeliveryLocationScreen({ navigation, route }) {
  const onLocationConfirmed = route?.params?.onLocationConfirmed;

  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Address Details Modal (Step 2)
  const [addressDetailsVisible, setAddressDetailsVisible] = useState(false);
  const [flatHouse, setFlatHouse] = useState('');
  const [apartmentRoad, setApartmentRoad] = useState(DEFAULT_COORDS.road);
  const [landmark, setLandmark] = useState('');
  const [receiverName, setReceiverName] = useState('Upasana');
  const [receiverPhone, setReceiverPhone] = useState('+91 98765 43210');
  const [saveAs, setSaveAs] = useState('HOME');
  const [isDefault, setIsDefault] = useState(true);

  // Reverse geocode when map coordinates move
  const reverseGeocodeCenter = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { 'User-Agent': 'HTTNCommerceApp/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.suburb || addr.neighbourhood || 'Florida Estate Rd';
        const area = addr.suburb || addr.neighbourhood || addr.city_district || 'Mundhwa';
        const city = addr.city || addr.town || 'Pune';
        const pincode = addr.postcode || '411036';
        const plusCode = 'GWJP+PV4, ';

        setCoords({
          latitude: lat,
          longitude: lon,
          title: `${plusCode}${road}`,
          subAddress: `${plusCode}${road}, ${area}, ${city}, Maharashtra ${pincode}, India`,
          road,
          area,
          city,
          pincode,
        });
        setApartmentRoad(road);
      }
    } catch (err) {
      // Keep existing location description
    }
  }, []);

  // Locate Me: fetches device real GPS and updates map
  const handleLocateMe = async () => {
    try {
      setIsLocating(true);
      const res = await getCurrentLocationAddressAsync();
      if (res && res.coords) {
        const { latitude, longitude } = res.coords;
        await reverseGeocodeCenter(latitude, longitude);
      }
    } catch (e) {
      console.warn('Locate me error:', e);
    } finally {
      setIsLocating(false);
    }
  };

  // Search input handling
  const handleSearchChange = (txt) => {
    setSearchQuery(txt);
    if (txt.trim().length > 1) {
      setIsSearching(true);
      const filtered = SAMPLE_SEARCH_RESULTS.filter(
        (item) =>
          item.title.toLowerCase().includes(txt.toLowerCase()) ||
          item.sub.toLowerCase().includes(txt.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleSelectSearchResult = (item) => {
    setSearchQuery('');
    setIsSearching(false);
    reverseGeocodeCenter(item.lat, item.lon);
  };

  // Step 1 -> Step 2: "Confirm Location" -> Open Address Details form
  const handleConfirmLocation = () => {
    setApartmentRoad(coords.road || coords.title);
    setAddressDetailsVisible(true);
  };

  // Save Address Details and persist as Default Address
  const handleSaveCompleteAddress = async () => {
    if (!flatHouse.trim()) {
      Alert.alert('Required Field', 'Please enter your Flat / House / Building Number.');
      return;
    }

    const newAddressObj = {
      id: 'addr_' + Date.now(),
      name: receiverName.trim() || 'Upasana',
      phone: receiverPhone.trim() || '+91 98765 43210',
      tag: saveAs, // HOME | WORK | OTHER
      flatHouse: flatHouse.trim(),
      areaStreet: apartmentRoad.trim(),
      landmark: landmark.trim(),
      city: coords.city || 'Pune',
      state: 'Maharashtra',
      pincode: coords.pincode || '411036',
      display: `${coords.road || coords.area || 'Florida Estate Rd'} · Pune`,
      fullAddress: `${flatHouse.trim()}, ${apartmentRoad.trim()}${landmark.trim() ? ', Near ' + landmark.trim() : ''}, ${coords.city || 'Pune'} - ${coords.pincode || '411036'}`,
      isDefault: isDefault,
      coords: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
    };

    try {
      // 1. Save as default delivery address in AsyncStorage
      if (isDefault) {
        await AsyncStorage.setItem('@default_delivery_address', JSON.stringify(newAddressObj));
      }

      // 2. Add to saved addresses list
      const existingSaved = await AsyncStorage.getItem('@saved_addresses');
      let savedList = existingSaved ? JSON.parse(existingSaved) : [];
      savedList = [newAddressObj, ...savedList.filter((a) => a.id !== newAddressObj.id)];
      await AsyncStorage.setItem('@saved_addresses', JSON.stringify(savedList));

      // 3. Callback to parent screen if provided
      if (onLocationConfirmed) {
        onLocationConfirmed(newAddressObj);
      }


      setAddressDetailsVisible(false);

      // Navigate straight back to Home — HomeScreen will reload
      // the address via useFocusEffect + AsyncStorage
      navigation.navigate('HomeMain');
    } catch (e) {
      console.warn('Error saving delivery address:', e);
      navigation.navigate('HomeMain');
    }
  };


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Top Header (Matching img 3) ─────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#0F172A" weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select delivery location</Text>
      </View>

      {/* ─── Floating Search Input (Matching img 3) ───────────────────────── */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <MagnifyingGlass size={18} color="#0F172A" weight="bold" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for your area or building"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')} style={{ padding: 4 }}>
              <X size={16} color="#64748B" weight="bold" />
            </TouchableOpacity>
          )}
        </View>

        {/* Autocomplete suggestions dropdown */}
        {isSearching && searchResults.length > 0 && (
          <View style={styles.searchResultsDropdown}>
            {searchResults.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.searchResultItem}
                onPress={() => handleSelectSearchResult(item)}
              >
                <MapPin size={18} color={colors.gold || '#F6A400'} weight="fill" style={{ marginTop: 2 }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.searchResultTitle}>{item.title}</Text>
                  <Text style={styles.searchResultSub} numberOfLines={1}>
                    {item.sub}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ─── Interactive Map Section (Matching img 3) ────────────────────── */}
      <View style={styles.mapContainer}>
        {/* Real interactive OpenStreetMap / Leaflet View */}
        {Platform.OS === 'web' ? (
          <iframe
            title="Delivery Location Map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.006}%2C${coords.latitude - 0.004}%2C${coords.longitude + 0.006}%2C${coords.latitude + 0.004}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`}
            style={styles.mapIframe}
          />
        ) : (
          <View style={styles.nativeMapPlaceholder}>
            {/* Fallback visual map grid for native mobile preview */}
            <View style={styles.gridLineHorizontal} />
            <View style={[styles.gridLineHorizontal, { top: '60%' }]} />
            <View style={styles.gridLineVertical} />
            <View style={[styles.gridLineVertical, { left: '70%' }]} />
          </View>
        )}

        {/* ─── Fixed Center Pin with Tooltip (Matching img 3) ─────────────── */}
        <View style={styles.centerPinContainer} pointerEvents="none">
          <View style={styles.deliverHereTooltip}>
            <Text style={styles.deliverHereTitle}>Deliver Here</Text>
            <Text style={styles.deliverHereSub}>Place pin on your exact location</Text>
            <View style={styles.tooltipPointer} />
          </View>
          <View style={styles.pinStem} />
          <View style={styles.pinShadowAnchor} />
        </View>

        {/* ─── Floating "Locate me" Button (Matching img 3) ────────────────── */}
        <TouchableOpacity
          style={styles.locateMeBtn}
          onPress={handleLocateMe}
          activeOpacity={0.85}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={colors.gold || '#F6A400'} style={{ marginRight: 6 }} />
          ) : (
            <Crosshair size={18} color={colors.gold || '#F6A400'} weight="bold" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.locateMeText}>Locate me</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Bottom Delivery Address Card (Matching img 3) ───────────────── */}
      <View style={styles.bottomCard}>
        <Text style={styles.bottomCardHeading}>Delivering your order to</Text>

        <View style={styles.addressInfoRow}>
          {/* Gold diamond badge with pin icon */}
          <View style={styles.pinDiamondBadge}>
            <MapPin size={22} color={colors.gold || '#F6A400'} weight="fill" />
          </View>

          {/* Location details */}
          <View style={styles.addressTextCol}>
            <Text style={styles.addressTitleText} numberOfLines={1}>
              {coords.title}
            </Text>
            <Text style={styles.addressSubText} numberOfLines={2}>
              {coords.subAddress}
            </Text>
          </View>
        </View>

        {/* Yellow/Gold "Confirm Location" Button */}
        <TouchableOpacity
          style={styles.confirmLocationBtn}
          onPress={handleConfirmLocation}
          activeOpacity={0.88}
        >
          <Text style={styles.confirmLocationBtnText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>

      {/* ─── STEP 2: Address Details Modal (Next Step) ───────────────────── */}
      <Modal
        visible={addressDetailsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddressDetailsVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <TouchableOpacity
                onPress={() => setAddressDetailsVisible(false)}
                style={styles.modalBackBtn}
              >
                <ArrowLeft size={20} color="#0F172A" weight="bold" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Enter complete address</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 28 }}
            >
              {/* Confirmed Location Tag */}
              <View style={styles.confirmedLocationBox}>
                <View style={styles.confirmedLocationIcon}>
                  <MapPin size={18} color={colors.gold || '#F6A400'} weight="fill" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.confirmedLocationTitle} numberOfLines={1}>
                    {coords.title}
                  </Text>
                  <Text style={styles.confirmedLocationSub} numberOfLines={1}>
                    {coords.subAddress}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setAddressDetailsVisible(false)}
                  style={styles.changeLocBtn}
                >
                  <Text style={styles.changeLocBtnText}>Change</Text>
                </TouchableOpacity>
              </View>

              {/* Input Fields */}
              <Text style={styles.fieldLabel}>
                Flat / House / Building Number <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. 205, E building, Avenue 66"
                placeholderTextColor="#94A3B8"
                value={flatHouse}
                onChangeText={setFlatHouse}
              />

              <Text style={styles.fieldLabel}>
                Apartment / Road / Area <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Florida Estate Rd, Mundhwa"
                placeholderTextColor="#94A3B8"
                value={apartmentRoad}
                onChangeText={setApartmentRoad}
              />

              <Text style={styles.fieldLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Near Florida Estate Gate 2"
                placeholderTextColor="#94A3B8"
                value={landmark}
                onChangeText={setLandmark}
              />

              {/* Save As Chips */}
              <Text style={styles.fieldLabel}>Save address as</Text>
              <View style={styles.chipsRow}>
                {[
                  { tag: 'HOME', icon: House },
                  { tag: 'WORK', icon: Briefcase },
                  { tag: 'OTHER', icon: Buildings },
                ].map(({ tag, icon: IconComponent }) => {
                  const isSelected = saveAs === tag;
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                      onPress={() => setSaveAs(tag)}
                      activeOpacity={0.8}
                    >
                      <IconComponent
                        size={16}
                        color={isSelected ? '#FFFFFF' : '#475569'}
                        weight={isSelected ? 'fill' : 'regular'}
                      />
                      <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Receiver Details */}
              <Text style={styles.sectionDividerText}>Receiver Details</Text>

              <Text style={styles.fieldLabel}>Receiver's Name</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Name"
                placeholderTextColor="#94A3B8"
                value={receiverName}
                onChangeText={setReceiverName}
              />

              <Text style={styles.fieldLabel}>Receiver's Phone Number</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={receiverPhone}
                onChangeText={setReceiverPhone}
              />

              {/* Set as Default Address Checkbox */}
              <TouchableOpacity
                style={styles.defaultCheckboxRow}
                onPress={() => setIsDefault(!isDefault)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkboxBox, isDefault && styles.checkboxBoxActive]}>
                  {isDefault && <Check size={14} color="#FFFFFF" weight="bold" />}
                </View>
                <Text style={styles.defaultCheckboxLabel}>
                  Make this my default delivery address
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.saveAddressBtn}
                onPress={handleSaveCompleteAddress}
                activeOpacity={0.88}
              >
                <Text style={styles.saveAddressBtnText}>Save Address & Deliver Here</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles matching img 3 pixel-for-pixel ──────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Floating Search Bar
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  searchResultsDropdown: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchResultSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // Map Section
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  mapIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  nativeMapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EEF2F6',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '30%',
    height: 12,
    backgroundColor: '#E2E8F0',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '40%',
    width: 14,
    backgroundColor: '#E2E8F0',
  },

  // Center Pin with Speech Bubble
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -64 }],
    width: 200,
    alignItems: 'center',
    zIndex: 10,
  },
  deliverHereTooltip: {
    backgroundColor: '#18181B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  deliverHereTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  deliverHereSub: {
    color: '#A1A1AA',
    fontSize: 10.5,
    marginTop: 2,
  },
  tooltipPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#18181B',
    position: 'absolute',
    bottom: -6,
  },
  pinStem: {
    width: 3,
    height: 20,
    backgroundColor: '#18181B',
    marginTop: 6,
  },
  pinShadowAnchor: {
    width: 10,
    height: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  // Floating "Locate me" Button
  locateMeBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 12,
  },
  locateMeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B87A00',
  },

  // Bottom Card (Image 3)
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 24 : 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 15,
  },
  bottomCardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  addressInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 12,
  },
  pinDiamondBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF6E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressTextCol: {
    flex: 1,
  },
  addressTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  addressSubText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 2,
  },
  confirmLocationBtn: {
    backgroundColor: '#F6A400',
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  confirmLocationBtnText: {
    color: '#032757',
    fontSize: 15,
    fontWeight: '800',
  },

  // Address Details Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalBackBtn: {
    padding: 4,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  confirmedLocationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF6E0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  confirmedLocationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmedLocationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7A4F00',
  },
  confirmedLocationSub: {
    fontSize: 11,
    color: '#B87A00',
    marginTop: 2,
  },
  changeLocBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  changeLocBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#032757',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  requiredStar: {
    color: '#E11D48',
  },
  fieldInput: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    outlineStyle: 'none',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  tagChipSelected: {
    backgroundColor: '#032757',
    borderColor: '#032757',
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tagChipTextSelected: {
    color: '#FFFFFF',
  },
  sectionDividerText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 6,
  },
  defaultCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: '#032757',
    borderColor: '#032757',
  },
  defaultCheckboxLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  saveAddressBtn: {
    backgroundColor: '#032757',
    borderRadius: 12,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveAddressBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
