import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';
import { register } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH, 400);

const countries = [
  { name: 'Nigeria', code: '+234', label: 'NG +234', flag: '🇳🇬' },
  { name: 'India', code: '+91', label: 'In +91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', label: 'US +1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', label: 'UK +44', flag: '🇬🇧' },
];

export default function VendorRegisterScreen({ navigation }) {
  const { login } = useAuth();
  
  // Input fields state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Vendor specific fields
  const [businessName, setBusinessName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [signature, setSignature] = useState('');

  // Password mask visibility
  const [showPassword, setShowPassword] = useState(false);

  // Country dropdown state
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    const tempErrors = {};
    let isValid = true;
    setGeneralError('');

    if (!fullName.trim()) { tempErrors.name = 'Required'; isValid = false; }
    if (!phoneNumber.trim()) { tempErrors.phone = 'Required'; isValid = false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { tempErrors.email = 'Valid email required'; isValid = false; }
    if (!password || password.length < 6) { tempErrors.password = 'Min 6 chars'; isValid = false; }
    if (!businessName.trim()) { tempErrors.businessName = 'Required'; isValid = false; }
    if (!acceptedPolicy) { tempErrors.policy = 'You must accept the policy'; isValid = false; }
    if (!signature.trim()) { tempErrors.signature = 'Signature is required'; isValid = false; }

    setErrors(tempErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      // For demo mode, appending @vendor.com so AuthContext knows it's a vendor
      const vendorEmail = email.includes('@') ? email : `${email}@vendor.com`;
      
      // Usually we'd call /api/auth/register and /api/vendor/register here
      // For frontend MVP, we use the AuthContext to log them in directly
      await login(vendorEmail, password);
    } catch (e) {
      setGeneralError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.includes(searchQuery)
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.innerContainer}>
          
          <View style={styles.headerBlock}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Image source={require('../../../assets/images/crown_logo.png')} style={styles.crownImage} />
            <Text style={styles.headerTitle}>Become a Seller</Text>
            <Text style={styles.subHeaderTitle}>Register your store on Licht Marketing</Text>
          </View>

          <View style={styles.formCard}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollFields}>
              {generalError ? <Text style={styles.generalErrorText}>{generalError}</Text> : null}

              {/* Personal Info */}
              <Text style={styles.sectionTitle}>Personal Details</Text>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={[styles.inputField, errors.name && styles.inputFieldError]} placeholder="John Doe" placeholderTextColor="#9CA3AF" value={fullName} onChangeText={setFullName} />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput style={[styles.inputField, errors.email && styles.inputFieldError]} placeholder="seller@example.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={[styles.phoneContainer, errors.phone && styles.inputFieldError]}>
                  <TouchableOpacity style={styles.countryDropdown} onPress={() => setCountryModalVisible(true)}>
                    <Text style={styles.countryCodeText}>{selectedCountry.label}</Text>
                    <Text style={styles.caretSymbol}>▼</Text>
                  </TouchableOpacity>
                  <View style={styles.verticalDivider} />
                  <TextInput style={styles.phoneInput} placeholder="Enter phone" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.passwordContainer, errors.password && styles.inputFieldError]}>
                  <TextInput style={styles.passwordInput} placeholder="Min 6 chars" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showHideButton}><Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text></TouchableOpacity>
                </View>
              </View>

              {/* Business Info */}
              <Text style={styles.sectionTitle}>Business Details</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Store / Business Name</Text>
                <TextInput style={[styles.inputField, errors.businessName && styles.inputFieldError]} placeholder="My Super Store" placeholderTextColor="#9CA3AF" value={businessName} onChangeText={setBusinessName} />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Tax ID (Optional)</Text>
                <TextInput style={styles.inputField} placeholder="Company Tax ID" placeholderTextColor="#9CA3AF" value={taxId} onChangeText={setTaxId} />
              </View>

              {/* Agreement */}
              <Text style={styles.sectionTitle}>Merchant Agreement</Text>

              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAcceptedPolicy(!acceptedPolicy)} activeOpacity={0.8}>
                <View style={[styles.checkbox, acceptedPolicy && styles.checkboxChecked]}>
                  {acceptedPolicy && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>I accept the marketplace policy where a <Text style={{fontWeight: 'bold'}}>10% commission</Text> comes to the company for every sale.</Text>
              </TouchableOpacity>
              {errors.policy ? <Text style={styles.errorText}>{errors.policy}</Text> : null}

              <View style={[styles.inputWrapper, { marginTop: 15 }]}>
                <Text style={styles.label}>Electronic Signature (Type full name)</Text>
                <TextInput style={[styles.inputField, errors.signature && styles.inputFieldError, { fontFamily: 'serif', fontStyle: 'italic' }]} placeholder="Type your full name here" placeholderTextColor="#9CA3AF" value={signature} onChangeText={setSignature} />
                {errors.signature ? <Text style={styles.errorText}>{errors.signature}</Text> : null}
              </View>

            </ScrollView>

            <View style={styles.stickyBottom}>
              <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
                {loading ? <ActivityIndicator color="#F6A400" /> : <Text style={styles.registerButtonText}>Register Store</Text>}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Country Modal */}
      <Modal visible={countryModalVisible} animationType="slide" transparent={true} onRequestClose={() => setCountryModalVisible(false)}>
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}><Text style={styles.modalCloseBtn}>Close</Text></TouchableOpacity>
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.countryRow} onPress={() => { setSelectedCountry(item); setCountryModalVisible(false); }}>
                  <View style={styles.countryFlagName}>
                    <Text style={styles.modalFlagSymbol}>{item.flag}</Text>
                    <Text style={styles.countryNameText}>{item.name}</Text>
                  </View>
                  <Text style={styles.countryCodeText}>{item.code}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalDivider} />}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#FFFCEB' },
  container: { flex: 1 },
  innerContainer: { flex: 1, width: CONTAINER_WIDTH, alignSelf: 'center' },
  headerBlock: { paddingTop: Platform.OS === 'ios' ? 10 : 8, paddingBottom: 10, width: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backButton: { position: 'absolute', top: Platform.OS === 'ios' ? 10 : 8, left: 20, padding: 8 },
  backText: { fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#2952CC' },
  crownImage: { width: 160, height: 65, resizeMode: 'contain', backgroundColor: 'transparent', marginTop: 4, marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: '500', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: '#010E2A', alignSelf: 'flex-start', paddingLeft: 24, marginTop: 2 },
  subHeaderTitle: { fontSize: 13, fontFamily: 'Inter-Regular', color: '#6B7280', alignSelf: 'flex-start', paddingLeft: 24, marginBottom: 4 },
  formCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 24, paddingTop: 22, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  scrollFields: { paddingBottom: 8 },
  stickyBottom: { paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 14, backgroundColor: '#FFFFFF' },
  generalErrorText: { fontSize: 13, fontFamily: 'Inter-Regular', color: '#DC2626', backgroundColor: '#FFEAEA', padding: 12, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FFD1D1' },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter-Bold', color: '#1F2937', marginTop: 10, marginBottom: 12 },
  inputWrapper: { marginBottom: 10 },
  label: { fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#1F2937', marginBottom: 6 },
  inputField: { height: 44, borderWidth: 1.2, borderColor: '#E5E7EB', borderRadius: 22, paddingHorizontal: 20, fontSize: 15, fontFamily: 'Inter-Regular', color: '#111827', backgroundColor: '#FFFFFF' },
  inputFieldError: { borderColor: '#DC2626' },
  phoneContainer: { flexDirection: 'row', alignItems: 'center', height: 44, borderWidth: 1.2, borderColor: '#E5E7EB', borderRadius: 22, backgroundColor: '#FFFFFF' },
  countryDropdown: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: '100%' },
  countryCodeText: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280', marginRight: 2 },
  caretSymbol: { fontSize: 8, color: '#4B5563', marginLeft: 4 },
  verticalDivider: { width: 1.2, height: 20, backgroundColor: '#E5E7EB' },
  phoneInput: { flex: 1, height: '100%', paddingHorizontal: 16, fontSize: 16, fontFamily: 'Inter-Regular', color: '#111827' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', height: 44, borderWidth: 1.2, borderColor: '#E5E7EB', borderRadius: 22, backgroundColor: '#FFFFFF' },
  passwordInput: { flex: 1, height: '100%', paddingHorizontal: 20, fontSize: 16, fontFamily: 'Inter-Regular', color: '#111827' },
  showHideButton: { paddingHorizontal: 20, justifyContent: 'center', height: '100%' },
  showHideText: { fontSize: 13, fontFamily: 'Inter-Bold', color: '#4B5563' },
  errorText: { fontSize: 12, fontFamily: 'Inter-Regular', color: '#DC2626', marginTop: 4, marginLeft: 8 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: '#1A2C5B', borderColor: '#1A2C5B' },
  checkmark: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: 13, fontFamily: 'Inter-Regular', color: '#4B5563', lineHeight: 20 },
  registerButton: { height: 50, backgroundColor: '#1A2C5B', borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  registerButtonText: { fontSize: 16, fontFamily: 'Inter-Bold', color: '#F6A400' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '60%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans-Bold', color: '#010E2A' },
  modalCloseBtn: { fontSize: 14, fontFamily: 'Inter-Bold', color: '#2952CC' },
  countryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  countryFlagName: { flexDirection: 'row', alignItems: 'center' },
  modalFlagSymbol: { fontSize: 22, marginRight: 12 },
  countryNameText: { fontSize: 15, fontFamily: 'Inter-Regular', color: '#1F2937' },
  modalDivider: { height: 1, backgroundColor: '#E5E7EB' },
});
