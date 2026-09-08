import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput } from 'react-native';
import { CaretLeft, Users, MagnifyingGlass, UserCircle, Prohibit, CheckCircle } from 'phosphor-react-native';
import { getAdminUsers, updateAdminUserStatus } from '../../api/admin.api';
import { useTheme } from '../../context/ThemeContext';

export default function AdminUsersScreen({ navigation }) {
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers(0, 50);
      if (res?.data?.content) setUsers(res.data.content);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (user, newStatus) => {
    try {
      await updateAdminUserStatus(user.id, newStatus);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      Alert.alert('Success', `User status updated to ${newStatus}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={S.root}>
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#1E293B" weight="bold" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>User Management</Text>
      </View>

      <View style={S.searchBox}>
        <MagnifyingGlass size={18} color="#94A3B8" />
        <TextInput 
          style={S.searchInput}
          placeholder="Search users by name or email..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={S.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={S.userCard}>
              <View style={S.userRow}>
                <UserCircle size={40} color="#94A3B8" weight="fill" />
                <View style={S.userInfo}>
                  <Text style={S.userName}>{item.name || 'No Name'}</Text>
                  <Text style={S.userEmail}>{item.email}</Text>
                  <View style={S.roleBadge}>
                    <Text style={S.roleBadgeText}>{item.roles?.map(r => r.name.replace('ROLE_', '')).join(', ') || 'USER'}</Text>
                  </View>
                </View>
                <View style={[S.statusBadge, { backgroundColor: item.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2' }]}>
                  <Text style={[S.statusText, { color: item.status === 'ACTIVE' ? '#16A34A' : '#DC2626' }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={S.actions}>
                {item.status !== 'BANNED' && (
                  <TouchableOpacity style={S.actionBtnDanger} onPress={() => handleUpdateStatus(item, 'BANNED')}>
                    <Prohibit size={16} color="#DC2626" />
                    <Text style={S.actionBtnDangerText}>Ban User</Text>
                  </TouchableOpacity>
                )}
                {item.status !== 'ACTIVE' && (
                  <TouchableOpacity style={S.actionBtnSuccess} onPress={() => handleUpdateStatus(item, 'ACTIVE')}>
                    <CheckCircle size={16} color="#16A34A" />
                    <Text style={S.actionBtnSuccessText}>Activate User</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  userRow: { flexDirection: 'row', alignItems: 'flex-start' },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: '#F1F5F9' },
  actionBtnDanger: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  actionBtnDangerText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  actionBtnSuccess: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  actionBtnSuccessText: { color: '#16A34A', fontSize: 13, fontWeight: '600' },
});
