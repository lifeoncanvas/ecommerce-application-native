import React from 'react';
import { View, FlatList, StyleSheet, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { spacing, typography, radius } from '../../theme';
import ProductCard from '../../components/ProductCard';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';

export default function WishlistScreen({ navigation }) {
  const { wishlistItems } = useWishlist();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Wishlist</Text>
        <Text style={styles.headerSubtitle}>{wishlistItems.length} saved items</Text>
      </View>

      {/* Grid List */}
      <FlatList
        data={wishlistItems}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>Tap the heart icon on any product to save it here.</Text>
            <TouchableOpacity 
              style={styles.shopBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
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

const getStyles = (colors) => StyleSheet.create({
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
    color: colors.textPrimary,
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
  shopBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  shopBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
