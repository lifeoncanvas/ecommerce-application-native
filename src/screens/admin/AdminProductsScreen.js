import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput, Image } from 'react-native';
import { CaretLeft, MagnifyingGlass, Package, Trash } from 'phosphor-react-native';
import { getAdminProducts } from '../../api/admin.api';
import { deleteProduct } from '../../api/products.api';

export default function AdminProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getAdminProducts(0, 50);
      if (res?.data?.content) setProducts(res.data.content);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    Alert.alert('Delete Product', `Are you sure you want to delete "${product.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteProduct(product.id);
            setProducts(prev => prev.filter(p => p.id !== product.id));
            Alert.alert('Success', 'Product deleted');
          } catch (e) {
            Alert.alert('Error', 'Failed to delete product');
          }
        }
      }
    ]);
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={S.root}>
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#1E293B" weight="bold" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Product Management</Text>
      </View>

      <View style={S.searchBox}>
        <MagnifyingGlass size={18} color="#94A3B8" />
        <TextInput 
          style={S.searchInput}
          placeholder="Search products by name..."
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
          data={filteredProducts}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={S.productCard}>
              <View style={S.productRow}>
                <View style={S.productImg}>
                  {item.images?.length > 0 ? (
                    <Image source={{ uri: item.images[0].imageUrl }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Package size={30} color="#94A3B8" />
                  )}
                </View>
                <View style={S.productInfo}>
                  <Text style={S.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={S.productPrice}>₦{Number(item.price || 0).toLocaleString('en-NG')}</Text>
                  <Text style={S.productStock}>Stock: {item.stock}</Text>
                  <View style={[S.statusBadge, { backgroundColor: item.active ? '#DCFCE7' : '#FEE2E2', alignSelf: 'flex-start', marginTop: 4 }]}>
                    <Text style={[S.statusText, { color: item.active ? '#16A34A' : '#DC2626' }]}>
                      {item.active ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity style={S.deleteBtn} onPress={() => handleDelete(item)}>
                  <Trash size={20} color="#DC2626" />
                </TouchableOpacity>
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
  productCard: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  productRow: { flexDirection: 'row', alignItems: 'center' },
  productImg: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  productPrice: { fontSize: 13, fontWeight: '800', color: '#2563EB', marginTop: 4 },
  productStock: { fontSize: 11, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  deleteBtn: { padding: 10 },
});
