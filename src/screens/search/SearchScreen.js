import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import { products as mockProducts, vendors as mockVendors, categories as mockCategories } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import {
  searchProducts,
  getSearchSuggestions,
  getSearchFilters,
  getSearchHistory,
} from '../../api/products.api';

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Network Timeout')), ms))
  ]);
};

export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({ categories: [], vendors: [] });
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Selected filters
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedVendorId, setSelectedVendorId] = useState('all');
  const [priceRange, setPriceRange] = useState('all'); // 'all', 'under20', '20to100', 'over100'

  // Load Search History and Filters on mount
  useEffect(() => {
    const loadSearchMetadata = async () => {
      try {
        const [historyRes, filtersRes] = await withTimeout(
          Promise.all([
            getSearchHistory(),
            getSearchFilters(),
          ]),
          2500
        );
        setHistory(historyRes.data?.data || historyRes.data || []);
        setFilters(filtersRes.data?.data || filtersRes.data || { categories: mockCategories, vendors: mockVendors });
      } catch (e) {
        console.warn('Search history/filter endpoints failed. Falling back to local mock data.');
        setHistory(['Akara', 'Velvet Suit', 'Jollof Rice', 'Glasses', 'Noodles']);
        setFilters({ categories: mockCategories, vendors: mockVendors });
      }
    };
    loadSearchMetadata();
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await withTimeout(getSearchSuggestions(query), 1500);
        setSuggestions(res.data?.data || res.data || []);
      } catch (e) {
        // Fallback local matching
        const lowerQuery = query.toLowerCase();
        const matches = mockProducts
          .filter((p) => p.name.toLowerCase().includes(lowerQuery))
          .map((p) => p.name)
          .slice(0, 5);
        setSuggestions(matches);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Execute Search query
  const handleSearch = async (searchQuery) => {
    const activeQuery = searchQuery || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setSuggestions([]);
    
    // Add to history list locally if not already present
    if (!history.includes(activeQuery)) {
      setHistory((prev) => [activeQuery, ...prev.slice(0, 9)]);
    }

    try {
      const res = await withTimeout(searchProducts(activeQuery), 2500);
      let items = res.data?.data || res.data?.items || res.data || [];
      setResults(items);
    } catch (e) {
      console.warn('Search query API failed, running local matching fallback.');
      
      const lowerQuery = activeQuery.toLowerCase().trim();
      let matchedItems = mockProducts.filter((p) => {
        const vendorName = mockVendors.find((v) => v.id === p.vendorId)?.name || '';
        return (
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery) ||
          vendorName.toLowerCase().includes(lowerQuery)
        );
      });

      setResults(matchedItems);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters on current search results
  const filteredResults = useMemo(() => {
    let items = [...results];

    if (selectedCategoryId !== 'all') {
      items = items.filter((p) => p.categoryId === selectedCategoryId);
    }
    if (selectedVendorId !== 'all') {
      items = items.filter((p) => p.vendorId === selectedVendorId);
    }
    if (priceRange !== 'all') {
      if (priceRange === 'under20') {
        items = items.filter((p) => p.price < 20);
      } else if (priceRange === '20to100') {
        items = items.filter((p) => p.price >= 20 && p.price <= 100);
      } else if (priceRange === 'over100') {
        items = items.filter((p) => p.price > 100);
      }
    }

    return items;
  }, [results, selectedCategoryId, selectedVendorId, priceRange]);

  const clearHistory = () => {
    setHistory([]);
  };

  const handleSuggestionPress = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const renderResultItem = ({ item }) => {
    const vendor = mockVendors.find((v) => v.id === item.vendorId);
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.emojiContainer}>
          <Text style={styles.emojiText}>{item.emoji || '🎁'}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.itemBrand}>{vendor?.name || 'Brand'}</Text>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingPriceRow}>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            <View style={styles.bullet} />
            <Text style={styles.starText}>★</Text>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <Svg width="18" height="18" viewBox="0 0 24 24" style={styles.arrowIcon}>
          <Path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill={colors.textSecondary} />
        </Svg>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path
              d="M15 19 L8 12 L15 5"
              stroke={colors.navy}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </TouchableOpacity>

        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, or categories..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            autoFocus
            clearButtonMode="while-editing"
          />
        </View>

        {results.length > 0 && (
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFiltersModal(true)}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path
                d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
                fill={colors.navy}
              />
            </Svg>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Body content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : query.trim() === '' && results.length === 0 ? (
        <View style={styles.content}>
          {/* History Section */}
          {history.length > 0 && (
            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.historyList}>
                {history.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.historyItem}
                    onPress={() => {
                      setQuery(item);
                      handleSearch(item);
                    }}
                  >
                    <Svg width="14" height="14" viewBox="0 0 24 24" style={styles.historyIcon}>
                      <Path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 11.5L11 11V6h1.5v4.25l3.7 2.2-.9 1.55z" fill={colors.textSecondary} />
                    </Svg>
                    <Text style={styles.historyItemText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Popular Searches</Text>
          <View style={styles.tagRow}>
            {['Jollof Rice', 'Akara', 'Velvet Suit', 'Sanitary Pads', 'Noodles', 'Earbuds', 'Glasses'].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tag}
                onPress={() => handleSuggestionPress(tag)}
                activeOpacity={0.7}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : suggestions.length > 0 ? (
        /* Autocomplete Suggestions list */
        <ScrollView style={styles.suggestionsContainer}>
          {suggestions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionRow}
              onPress={() => handleSuggestionPress(item)}
            >
              <Svg width="16" height="16" viewBox="0 0 24 24" style={styles.suggestionIcon}>
                <Path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill={colors.textSecondary}
                />
              </Svg>
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        /* Results list */
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.id}
          renderItem={renderResultItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No matches found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your active filters or clear them.</Text>
            </View>
          }
        />
      )}

      {/* Advanced Filters Modal (Sidebar Slide-in style mockup) */}
      <Modal visible={showFiltersModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refine Search Results</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <Text style={styles.closeBtnText}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Category Filter */}
              <Text style={styles.filterGroupTitle}>By Category</Text>
              <View style={styles.filterPillsRow}>
                <TouchableOpacity
                  style={[styles.filterPill, selectedCategoryId === 'all' && styles.filterPillActive]}
                  onPress={() => setSelectedCategoryId('all')}
                >
                  <Text style={[styles.filterPillText, selectedCategoryId === 'all' && styles.filterPillTextActive]}>All</Text>
                </TouchableOpacity>
                {filters.categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.filterPill, selectedCategoryId === cat.id && styles.filterPillActive]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Text style={[styles.filterPillText, selectedCategoryId === cat.id && styles.filterPillTextActive]}>
                      {cat.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Vendor/Brand Filter */}
              <Text style={styles.filterGroupTitle}>By Brand / Vendor</Text>
              <View style={styles.filterPillsRow}>
                <TouchableOpacity
                  style={[styles.filterPill, selectedVendorId === 'all' && styles.filterPillActive]}
                  onPress={() => setSelectedVendorId('all')}
                >
                  <Text style={[styles.filterPillText, selectedVendorId === 'all' && styles.filterPillTextActive]}>All</Text>
                </TouchableOpacity>
                {filters.vendors.slice(0, 10).map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.filterPill, selectedVendorId === v.id && styles.filterPillActive]}
                    onPress={() => setSelectedVendorId(v.id)}
                  >
                    <Text style={[styles.filterPillText, selectedVendorId === v.id && styles.filterPillTextActive]}>
                      {v.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Filter */}
              <Text style={styles.filterGroupTitle}>By Price Range</Text>
              <View style={styles.filterPillsRow}>
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under20', label: 'Under $20' },
                  { id: '20to100', label: '$20 to $100' },
                  { id: 'over100', label: 'Over $100' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.filterPill, priceRange === item.id && styles.filterPillActive]}
                    onPress={() => setPriceRange(item.id)}
                  >
                    <Text style={[styles.filterPillText, priceRange === item.id && styles.filterPillTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Modal Footer Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSelectedCategoryId('all');
                  setSelectedVendorId('all');
                  setPriceRange('all');
                }}
              >
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFiltersModal(false)}>
                <Text style={styles.applyBtnText}>Apply ({filteredResults.length} items)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    flex: 1,
    height: 42,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    ...typography.body,
    color: colors.textPrimary,
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historySection: {
    marginBottom: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  clearText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  historyList: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  historyIcon: {
    marginRight: spacing.sm,
  },
  historyItemText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 14,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  suggestionsContainer: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderColor: colors.border,
  },
  suggestionIcon: {
    marginRight: spacing.md,
  },
  suggestionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  listContainer: {
    paddingVertical: spacing.sm,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderColor: colors.border,
  },
  emojiContainer: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemBrand: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
    marginTop: 2,
  },
  ratingPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  itemPrice: {
    ...typography.caption,
    color: colors.navy,
    fontWeight: '700',
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  starText: {
    color: colors.gold,
    fontSize: 11,
    marginRight: 2,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl * 2,
  },
  emptyEmoji: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '800',
  },
  closeBtnText: {
    ...typography.bodyBold,
    color: colors.navyLight,
  },
  modalScroll: {
    padding: spacing.lg,
  },
  filterGroupTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  filterPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  applyBtn: {
    flex: 2,
    height: 48,
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
});
