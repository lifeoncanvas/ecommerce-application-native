import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, SafeAreaView } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import ProductCard from '../../components/ProductCard';
import { products } from '../../data/mockData';

export default function WishlistScreen({ navigation }) {
  // Populating the wishlist with a couple of default products for design demonstration
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Show a few mock products in the wishlist by default
    const defaultWishlist = products.filter(
      (p) => p.id === 'p_jazari_1' || p.id === 'p_redemp_1' || p.id === 'p_capelli_1'
    );
    setItems(defaultWishlist);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Wishlist</Text>
        <Text style={styles.headerSubtitle}>{items.length} saved items</Text>
      </View>

      {/* Grid List */}
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>Tap the heart icon on any product to save it here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.gridItemWrapper}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  grid: {
    padding: spacing.sm,
  },
  gridItemWrapper: {
    width: '50%',
    padding: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
