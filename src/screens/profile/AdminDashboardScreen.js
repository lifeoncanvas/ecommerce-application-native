import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  CaretLeft,
  Users,
  Storefront,
  ShieldCheck,
  UserPlus,
  Trash,
  Prohibit,
  CheckCircle,
  PencilSimple,
  X,
  MagnifyingGlass,
} from 'phosphor-react-native';

function AdminContent({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();

  // Tab: 'users' | 'sellers' | 'admins'
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data lists for User Management
  const [usersList, setUsersList] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER', status: 'ACTIVE', joined: '2026-01-10' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', role: 'CUSTOMER', status: 'ACTIVE', joined: '2026-02-14' },
    { id: 3, name: 'Alex Johnson', email: 'alex@example.com', role: 'CUSTOMER', status: 'BANNED', joined: '2026-03-01' },
    { id: 4, name: 'Emily Brown', email: 'emily@example.com', role: 'CUSTOMER', status: 'ACTIVE', joined: '2026-05-20' },
  ]);

  const [sellersList, setSellersList] = useState([
    { id: 101, storeName: 'Nike Official Store', ownerEmail: 'nike@store.com', status: 'APPROVED', commissionRate: '10%', revenue: '₦4,850,000' },
    { id: 102, storeName: 'Jazari Restaurant', ownerEmail: 'jazari@restaurant.com', status: 'APPROVED', commissionRate: '10%', revenue: '₦2,310,000' },
    { id: 103, storeName: 'Apple Store Hub', ownerEmail: 'apple@store.com', status: 'PENDING', commissionRate: '10%', revenue: '₦0' },
    { id: 104, storeName: 'Urban Wear Studio', ownerEmail: 'urbanwear@vendor.com', status: 'SUSPENDED', commissionRate: '10%', revenue: '₦890,000' },
  ]);

  const [adminsList, setAdminsList] = useState([
    { id: 1, name: 'Sharon Shelke (Super Admin)', email: 'sharonshelke1@gmail.com', role: 'SUPER_ADMIN', addedDate: '2026-01-01' },
    { id: 2, name: 'Platform Admin Manager', email: 'admin@litemarket.com', role: 'ADMIN', addedDate: '2026-02-15' },
  ]);

  // Modal State for Adding New Admin
  const [addAdminModalVisible, setAddAdminModalVisible] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Add Admin Handler
  const handleAddAdmin = () => {
    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      Alert.alert('Validation Error', 'Please provide both name and email for the new admin.');
      return;
    }
    const newAdmin = {
      id: Date.now(),
      name: newAdminName.trim(),
      email: newAdminEmail.trim(),
      role: 'ADMIN',
      addedDate: new Date().toISOString().split('T')[0],
    };
    setAdminsList([...adminsList, newAdmin]);
    setNewAdminName('');
    setNewAdminEmail('');
    setAddAdminModalVisible(false);
    Alert.alert('Success', `Admin access granted to ${newAdmin.email}`);
  };

  // Remove Admin Handler
  const handleRemoveAdmin = (id, email) => {
    if (email === 'sharonshelke1@gmail.com') {
      Alert.alert('Action Denied', 'Super Admin (sharonshelke1@gmail.com) cannot be removed.');
      return;
    }
    Alert.alert('Remove Admin', `Are you sure you want to revoke admin privileges from ${email}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setAdminsList(adminsList.filter((a) => a.id !== id));
          Alert.alert('Removed', `Admin privileges revoked for ${email}`);
        },
      },
    ]);
  };

  // Toggle User Status (ACTIVE <-> BANNED)
  const toggleUserStatus = (id) => {
    setUsersList(
      usersList.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Toggle Seller Status (APPROVED <-> SUSPENDED)
  const toggleSellerStatus = (id) => {
    setSellersList(
      sellersList.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#010E2A" weight="bold" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>User & Store Management</Text>
          <Text style={styles.headerSubTitle}>Admin Portal · {user?.email || 'sharonshelke1@gmail.com'}</Text>
        </View>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
          onPress={() => setActiveTab('users')}
        >
          <Users size={16} color={activeTab === 'users' ? '#F6A400' : '#6B7280'} weight="bold" />
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            Customers ({usersList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'sellers' && styles.tabBtnActive]}
          onPress={() => setActiveTab('sellers')}
        >
          <Storefront size={16} color={activeTab === 'sellers' ? '#F6A400' : '#6B7280'} weight="bold" />
          <Text style={[styles.tabText, activeTab === 'sellers' && styles.tabTextActive]}>
            Sellers ({sellersList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'admins' && styles.tabBtnActive]}
          onPress={() => setActiveTab('admins')}
        >
          <ShieldCheck size={16} color={activeTab === 'admins' ? '#F6A400' : '#6B7280'} weight="bold" />
          <Text style={[styles.tabText, activeTab === 'admins' && styles.tabTextActive]}>
            Admins ({adminsList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* CUSTOMERS TAB */}
        {activeTab === 'users' && (
          <ScrollView contentContainerStyle={styles.listContainer}>
            <Text style={styles.sectionHeader}>Customer Accounts</Text>
            {usersList.map((u) => (
              <View key={u.id} style={styles.card}>
                <View style={styles.cardMain}>
                  <Text style={styles.cardTitle}>{u.name}</Text>
                  <Text style={styles.cardSub}>{u.email}</Text>
                  <Text style={styles.cardMeta}>Joined: {u.joined}</Text>
                </View>
                <View style={styles.cardActions}>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: u.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: u.status === 'ACTIVE' ? '#15803D' : '#B91C1C' },
                      ]}
                    >
                      {u.status}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: u.status === 'ACTIVE' ? '#FEF2F2' : '#F0FDF4' },
                    ]}
                    onPress={() => toggleUserStatus(u.id)}
                  >
                    <Text style={{ color: u.status === 'ACTIVE' ? '#DC2626' : '#16A34A', fontWeight: '700', fontSize: 12 }}>
                      {u.status === 'ACTIVE' ? 'Ban User' : 'Unban User'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* SELLERS TAB */}
        {activeTab === 'sellers' && (
          <ScrollView contentContainerStyle={styles.listContainer}>
            <Text style={styles.sectionHeader}>Registered Stores & Sellers</Text>
            {sellersList.map((s) => (
              <View key={s.id} style={styles.card}>
                <View style={styles.cardMain}>
                  <Text style={styles.cardTitle}>🏬 {s.storeName}</Text>
                  <Text style={styles.cardSub}>Owner: {s.ownerEmail}</Text>
                  <Text style={styles.cardMeta}>Policy: {s.commissionRate} Platform Fee | Rev: {s.revenue}</Text>
                </View>
                <View style={styles.cardActions}>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: s.status === 'APPROVED' ? '#DCFCE7' : '#FEE2E2' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: s.status === 'APPROVED' ? '#15803D' : '#B91C1C' },
                      ]}
                    >
                      {s.status}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: s.status === 'APPROVED' ? '#FEF2F2' : '#F0FDF4' },
                    ]}
                    onPress={() => toggleSellerStatus(s.id)}
                  >
                    <Text style={{ color: s.status === 'APPROVED' ? '#DC2626' : '#16A34A', fontWeight: '700', fontSize: 12 }}>
                      {s.status === 'APPROVED' ? 'Suspend Store' : 'Approve Store'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ADMINS TAB */}
        {activeTab === 'admins' && (
          <ScrollView contentContainerStyle={styles.listContainer}>
            <View style={styles.adminHeaderRow}>
              <Text style={styles.sectionHeader}>Admin Privilege Management</Text>
              <TouchableOpacity
                style={styles.addAdminBtn}
                onPress={() => setAddAdminModalVisible(true)}
              >
                <UserPlus size={16} color="#FFFFFF" weight="bold" />
                <Text style={styles.addAdminBtnText}>Add Admin</Text>
              </TouchableOpacity>
            </View>

            {adminsList.map((a) => (
              <View key={a.id} style={styles.card}>
                <View style={styles.cardMain}>
                  <Text style={styles.cardTitle}>{a.name}</Text>
                  <Text style={styles.cardSub}>{a.email}</Text>
                  <Text style={styles.cardMeta}>Role: {a.role} | Granted: {a.addedDate}</Text>
                </View>
                <View style={styles.cardActions}>
                  {a.email !== 'sharonshelke1@gmail.com' ? (
                    <TouchableOpacity
                      style={styles.deleteAdminBtn}
                      onPress={() => handleRemoveAdmin(a.id, a.email)}
                    >
                      <Trash size={16} color="#DC2626" weight="bold" />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.superBadge}>
                      <Text style={styles.superBadgeText}>Primary Admin</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Add Admin Modal */}
      <Modal visible={addAdminModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Grant Admin Access</Text>
              <TouchableOpacity onPress={() => setAddAdminModalVisible(false)}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Admin Full Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. John Admin"
              value={newAdminName}
              onChangeText={setNewAdminName}
            />

            <Text style={styles.inputLabel}>Admin Email Address</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="admin@litemarket.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={newAdminEmail}
              onChangeText={setNewAdminEmail}
            />

            <TouchableOpacity style={styles.confirmAddBtn} onPress={handleAddAdmin}>
              <Text style={styles.confirmAddBtnText}>Save & Grant Access</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: 'red', marginBottom: 10 }}>Admin Dashboard Crashed!</Text>
          <Text style={{ fontSize: 12, color: '#333' }}>{this.state.error?.toString()}</Text>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

export default function AdminDashboardScreen(props) {
  return (
    <ErrorBoundary>
      <AdminContent {...props} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerTitleWrapper: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#010E2A',
  },
  headerSubTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#1A2C5B',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#1A2C5B',
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  adminHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addAdminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2C5B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  addAdminBtnText: {
    color: '#F6A400',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardMain: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  cardSub: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  deleteAdminBtn: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  superBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  superBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#B45309',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    fontSize: 14,
  },
  confirmAddBtn: {
    height: 44,
    backgroundColor: '#1A2C5B',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmAddBtnText: {
    color: '#F6A400',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
});
