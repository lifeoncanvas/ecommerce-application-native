import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CaretLeft,
  MagnifyingGlass,
  Heart,
  ArrowsDownUp,
  Users,
  Tag,
  Ruler,
  SlidersHorizontal,
  Star,
  Check,
  X,
} from 'phosphor-react-native';
import { typography, spacing, radius } from '../../theme';
import { categories, vendors } from '../../data/mockData';
import { ALL_FEED_PRODUCTS } from '../../data/mockProductsData';
import { useWishlist } from '../../context/WishlistContext';
import { buildProductRouteParams } from '../../utils/productResolver';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // 20px padding left & right, 8px middle gap

// ─── Default Category Title Map ──────────────────────────────────────────────
const CATEGORY_TITLE_MAP = {
  cat_food: 'FOOD & DINING',
  cat_fashion: 'FASHION & APPAREL',
  cat_electronics: 'ELECTRONICS & GADGETS',
  cat_home: 'HOME & DECOR',
  cat_beauty: 'BEAUTY & COSMETICS',
  cat_services: 'SERVICES & LIFESTYLE',
};

// ─── Curated Subcategory Pills ───────────────────────────────────────────────
const CATEGORY_PILLS = {
  cat_fashion: [
    { id: 'all', name: 'All Fashion' },
    { id: 'boutiques', name: 'Boutiques' },
    { id: 'designers', name: 'Designers' },
    { id: 'kiddies', name: 'Kiddies Corner' },
    { id: 'bridal', name: 'Bridal' },
    { id: 'western', name: 'Western Wear' },
    { id: 'ethnic', name: 'Ethnic Wear' },
  ],
  cat_food: [
    { id: 'all', name: 'All Food' },
    { id: 'restaurants', name: 'Restaurants' },
    { id: 'fast_food', name: 'Fries & Fast Food' },
    { id: 'bakeries', name: 'Bakeries' },
    { id: 'snacks', name: 'Healthy Snacks' },
  ],
  cat_electronics: [
    { id: 'all', name: 'All Electronics' },
    { id: 'phones', name: 'Smartphones' },
    { id: 'tablets', name: 'Tablets' },
    { id: 'audio', name: 'Audio' },
    { id: 'accessories', name: 'Accessories' },
  ],
  cat_home: [
    { id: 'all', name: 'All Home' },
    { id: 'candles', name: 'Candles' },
    { id: 'decor', name: 'Decor' },
    { id: 'plush', name: 'Plush Toys' },
    { id: 'living', name: 'Living Room' },
  ],
  cat_beauty: [
    { id: 'all', name: 'All Beauty' },
    { id: 'parfum', name: 'Parfum' },
    { id: 'lipsticks', name: 'Lipsticks' },
    { id: 'makeup', name: 'Makeup' },
    { id: 'oral_care', name: 'Oral Care' },
  ],
  cat_services: [
    { id: 'all', name: 'All Services' },
    { id: 'detailing', name: 'Car Detailing' },
    { id: 'carwash', name: 'Carwash Spa' },
    { id: 'arcade', name: 'Arcade Pass' },
  ],
};

// ─── Rich Catalog for Product Listing Grid (Matching img 2) ─────────────────
const RICH_LISTING_CATALOG = ALL_FEED_PRODUCTS;



const SwipeableListingCard = ({ item, isSelected, onSelect, liked, onToggleLike, formatPrice, styles }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const flatListRef = React.useRef(null);
  
  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / CARD_WIDTH);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const images = item.images && item.images.length > 0 ? item.images : [item.image];

  return (
    <View style={styles.card}>
      <View style={styles.cardPhotoWrapper}>
        {images.length > 1 ? (
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => idx.toString()}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            style={{ width: CARD_WIDTH, height: '100%' }}
            renderItem={({ item: img }) => (
              <Pressable onPress={onSelect} style={{ width: CARD_WIDTH, height: '100%' }}>
                <Image 
                  source={img} 
                  style={[styles.cardPhoto, { width: CARD_WIDTH, height: '100%' }]} 
                  resizeMode="cover" 
                  draggable={false}
                />
              </Pressable>
            )}
          />
        ) : (
          <Pressable onPress={onSelect} style={{ width: CARD_WIDTH, height: '100%' }}>
            <Image 
              source={images[0]} 
              style={[styles.cardPhoto, { width: CARD_WIDTH, height: '100%' }]} 
              resizeMode="cover" 
              draggable={false}
            />
          </Pressable>
        )}

        {images.length > 1 && (
          <View style={styles.galleryDots} pointerEvents="none">
            {images.map((_, i) => (
              <View key={i} style={[styles.galleryDot, i === activeIndex && styles.galleryDotActive]} />
            ))}
          </View>
        )}

        {item.badgeType === 'tag' ? (
          <View style={[styles.tagBadge, { backgroundColor: item.tagColor || '#4338CA' }]} pointerEvents="none">
            <Text style={styles.tagBadgeText}>{item.tagText}</Text>
          </View>
        ) : (
          <View style={styles.ratingBadge} pointerEvents="none">
            <Text style={styles.ratingBadgeText}>{item.ratingText}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.heartBtn}
          onPress={onToggleLike}
          activeOpacity={0.7}
        >
          <Heart
            size={17}
            color={liked ? '#E53935' : '#1E293B'}
            weight={liked ? 'fill' : 'regular'}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={onSelect} style={styles.cardBody}>
        <Text style={styles.cardBrand}>{item.brand}</Text>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceMain}>{formatPrice(item.price)}</Text>
          {item.oldPrice && (
            <Text style={styles.priceOld}>{formatPrice(item.oldPrice)}</Text>
          )}
          {item.discount && (
            <Text style={styles.discountText}>{item.discount}</Text>
          )}
        </View>

        {item.bestPrice && (
          <Text style={styles.couponText}>
            Best Price {formatPrice(item.bestPrice)} with coupon
          </Text>
        )}

        {item.delivery && (
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryIcon}>🚚</Text>
            <Text style={styles.deliveryText}>{item.delivery}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function ProductListingScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { formatPrice } = useCurrency();
  const { categoryId = 'cat_fashion', subcategoryId } = (route && route.params) || {};
  const { isLiked, toggleWishlist } = useWishlist();

  const [selectedSubCatId, setSelectedSubCatId] = useState('all');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Popularity');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('Sort');

  const categoryTitle = CATEGORY_TITLE_MAP[categoryId] || 'FASHION & APPAREL';
  const pills = CATEGORY_PILLS[categoryId] || CATEGORY_PILLS.cat_fashion;

  // Filter products by selected category, gender, brand, size, price, and sort
  const displayedProducts = useMemo(() => {
    let items = ALL_FEED_PRODUCTS.filter((p) => p.categoryId === categoryId);
    if (items.length === 0) {
      items = ALL_FEED_PRODUCTS;
    }

    if (selectedSubCatId !== 'all') {
      items = items.filter((p) => p.subcat === selectedSubCatId);
    }

    if (selectedGender !== 'All') {
      items = items.filter((p) => {
        const nameLower = p.name.toLowerCase();
        if (selectedGender === 'Women') return nameLower.includes('women') || nameLower.includes('ruffles');
        if (selectedGender === 'Men') return nameLower.includes('men') || nameLower.includes('mens') || nameLower.includes('suit');
        if (selectedGender === 'Kids') return nameLower.includes('kids') || nameLower.includes('child');
        if (selectedGender === 'Unisex') return !nameLower.includes('women') && !nameLower.includes('men') && !nameLower.includes('kids');
        return true;
      });
    }

    if (selectedBrand !== 'All') {
      items = items.filter((p) => p.brand === selectedBrand);
    }

    if (selectedPrice !== 'All') {
      items = items.filter((p) => {
        if (selectedPrice === `Under ${formatPrice(400)}`) return p.price < 400;
        if (selectedPrice === `${formatPrice(400)} - ${formatPrice(800)}`) return p.price >= 400 && p.price <= 800;
        if (selectedPrice === `Over ${formatPrice(800)}`) return p.price > 800;
        return true;
      });
    }

    if (selectedSize !== 'All') {
      items = items.filter((p, index) => {
        if (selectedSize === 'S') return index % 2 === 0;
        if (selectedSize === 'M') return index % 3 !== 0;
        if (selectedSize === 'L') return index % 4 !== 0;
        if (selectedSize === 'XL') return index % 2 !== 0;
        return true;
      });
    }

    if (selectedSort === 'Price: Low to High') {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'Price: High to Low') {
      items = [...items].sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'Discount') {
      items = [...items].sort((a, b) => {
        const discA = parseFloat(a.discount) || 0;
        const discB = parseFloat(b.discount) || 0;
        return discB - discA;
      });
    } else if (selectedSort === 'Rating') {
      items = [...items].sort((a, b) => {
        const ratA = parseFloat(a.ratingText) || 0;
        const ratB = parseFloat(b.ratingText) || 0;
        return ratB - ratA;
      });
    }

    return items;
  }, [categoryId, selectedSubCatId, selectedGender, selectedBrand, selectedPrice, selectedSize, selectedSort]);

  const renderProductCard = ({ item }) => {
    const liked = isLiked(item.id);
    const imgSrc = typeof item.image === 'number' ? item.image : (typeof item.image === 'string' ? { uri: item.image } : item.image);
    const discountPct = item.oldPrice && item.price ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetails', buildProductRouteParams(item))}
        activeOpacity={0.88}
      >
        {/* Photo Container matching Image 1 */}
        <View style={styles.cardPhotoWrapper}>
          <Image source={imgSrc} style={styles.cardPhoto} resizeMode="cover" />

          {/* Top Left Dark Discount Badge (-20%) */}
          {discountPct > 0 && (
            <View style={styles.darkDiscountBadge}>
              <Text style={styles.darkDiscountText}>-{discountPct}%</Text>
            </View>
          )}

          {/* Top Right Heart Wishlist Button */}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => toggleWishlist(item.id)}
            activeOpacity={0.7}
          >
            <Heart
              size={16}
              color={liked ? '#E11D48' : '#2D3748'}
              weight={liked ? 'fill' : 'regular'}
            />
          </TouchableOpacity>
        </View>

        {/* Card Details matching Image 1 layout */}
        <View style={styles.cardBody}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.ratingRow}>
              <Text style={styles.starChar}>★</Text>
              <Text style={styles.ratingVal}>{item.rating || (item.ratingText && item.ratingText.split(' ')[0]) || '4.9'}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceMain}>{formatPrice(item.price)}</Text>
            {item.oldPrice && (
              <Text style={styles.priceOld}>{formatPrice(item.oldPrice)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Top Header: Back | Centered Crown Logo | Search ──────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.hdrBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
          activeOpacity={0.7}
        >
          <CaretLeft size={24} color="#1E293B" weight="bold" />
        </TouchableOpacity>

        <View style={styles.centerLogoWrapper}>
          <Image
            source={require('../../../assets/images/crown_logo.png')}
            style={styles.crownLogo}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={styles.hdrBtn}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.7}
        >
          <MagnifyingGlass size={22} color="#1E293B" weight="bold" />
        </TouchableOpacity>
      </View>

      {/* ─── Category Title (e.g. FASHION & APPAREL) ───────────────────── */}
      <View style={styles.titleWrapper}>
        <Text style={styles.categoryTitle}>{categoryTitle}</Text>
      </View>

      {/* ─── Subcategory Filter Pills (Horizontal Scroll) ──────────────── */}
      <View style={styles.pillsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
        >
          {pills.map((pill) => {
            const isActive = selectedSubCatId === pill.id;
            return (
              <TouchableOpacity
                key={pill.id}
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                onPress={() => setSelectedSubCatId(pill.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {pill.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── 2-Column Product Grid ─────────────────────────────────────── */}
      <FlatList
        data={displayedProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderProductCard}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* ─── Floating Bottom Navigation Bar (img 3) ────────────────────── */}
      <View style={styles.floatingBarWrapper}>
        <View style={styles.floatingBar}>
          <TouchableOpacity
            style={styles.floatBtn}
            onPress={() => {
              setActiveFilterTab('Sort');
              setFilterModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <ArrowsDownUp size={20} color={selectedSort !== 'Popularity' ? '#A8824B' : '#475569'} weight={selectedSort !== 'Popularity' ? 'bold' : 'regular'} />
            <Text style={[styles.floatBtnLabel, selectedSort !== 'Popularity' && styles.floatBtnLabelHighlight]}>
              Sort
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.floatBtn}
            onPress={() => {
              setActiveFilterTab('Gender');
              setFilterModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Users size={20} color={selectedGender !== 'All' ? '#A8824B' : '#475569'} weight={selectedGender !== 'All' ? 'bold' : 'regular'} />
            <Text style={[styles.floatBtnLabel, selectedGender !== 'All' && styles.floatBtnLabelHighlight]}>
              Gender
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.floatBtn}
            onPress={() => {
              setActiveFilterTab('Brand');
              setFilterModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Tag size={20} color={selectedBrand !== 'All' ? '#A8824B' : '#475569'} weight={selectedBrand !== 'All' ? 'bold' : 'regular'} />
            <Text style={[styles.floatBtnLabel, selectedBrand !== 'All' && styles.floatBtnLabelHighlight]}>
              Brand
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.floatBtn}
            onPress={() => {
              setActiveFilterTab('Size');
              setFilterModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Ruler size={20} color={selectedSize !== 'All' ? '#A8824B' : '#475569'} weight={selectedSize !== 'All' ? 'bold' : 'regular'} />
            <Text style={[styles.floatBtnLabel, selectedSize !== 'All' && styles.floatBtnLabelHighlight]}>
              Size
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.floatBtn}
            onPress={() => {
              setActiveFilterTab('Filters');
              setFilterModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={20} color={selectedPrice !== 'All' ? '#A8824B' : '#475569'} weight="bold" />
            <Text style={[styles.floatBtnLabel, selectedPrice !== 'All' && styles.floatBtnLabelHighlight]}>
              Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Filter / Sort Modal ────────────────────────────────────────── */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeFilterTab}</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={22} color="#1E293B" weight="bold" />
              </TouchableOpacity>
            </View>

            {activeFilterTab === 'Sort' && (
              <View style={styles.modalBody}>
                {['Popularity', 'Price: Low to High', 'Price: High to Low', 'Discount', 'Rating'].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.sortOptionRow}
                    onPress={() => {
                      setSelectedSort(opt);
                      setFilterModalVisible(false);
                    }}
                  >
                    <Text style={[styles.sortOptionText, selectedSort === opt && styles.sortOptionTextActive]}>
                      {opt}
                    </Text>
                    {selectedSort === opt && <Check size={18} color="#A8824B" weight="bold" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeFilterTab === 'Gender' && (
              <View style={styles.modalBody}>
                {['All', 'Women', 'Men', 'Kids', 'Unisex'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={styles.sortOptionRow}
                    onPress={() => {
                      setSelectedGender(g);
                      setFilterModalVisible(false);
                    }}
                  >
                    <Text style={[styles.sortOptionText, selectedGender === g && styles.sortOptionTextActive]}>
                      {g}
                    </Text>
                    {selectedGender === g && <Check size={18} color="#A8824B" weight="bold" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeFilterTab === 'Brand' && (
              <View style={styles.modalBody}>
                {['All', 'Fashion Redemption', 'Selvia', 'Athena', 'Lumiere'].map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={styles.sortOptionRow}
                    onPress={() => {
                      setSelectedBrand(b);
                      setFilterModalVisible(false);
                    }}
                  >
                    <Text style={[styles.sortOptionText, selectedBrand === b && styles.sortOptionTextActive]}>
                      {b}
                    </Text>
                    {selectedBrand === b && <Check size={18} color="#A8824B" weight="bold" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeFilterTab === 'Size' && (
              <View style={styles.modalBody}>
                {['All', 'S', 'M', 'L', 'XL'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.sortOptionRow}
                    onPress={() => {
                      setSelectedSize(s);
                      setFilterModalVisible(false);
                    }}
                  >
                    <Text style={[styles.sortOptionText, selectedSize === s && styles.sortOptionTextActive]}>
                      {s}
                    </Text>
                    {selectedSize === s && <Check size={18} color="#A8824B" weight="bold" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeFilterTab === 'Filters' && (
              <View style={styles.modalBody}>
                {['All Prices', `Under ${formatPrice(400)}`, `${formatPrice(400)} - ${formatPrice(800)}`, `Over ${formatPrice(800)}`].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={styles.sortOptionRow}
                    onPress={() => {
                      setSelectedPrice(p === 'All Prices' ? 'All' : p);
                      setFilterModalVisible(false);
                    }}
                  >
                    <Text style={[styles.sortOptionText, (p === 'All Prices' ? selectedPrice === 'All' : selectedPrice === p) && styles.sortOptionTextActive]}>
                      {p}
                    </Text>
                    {(p === 'All Prices' ? selectedPrice === 'All' : selectedPrice === p) && <Check size={18} color="#A8824B" weight="bold" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white background matching Home page
  },

  // Header Bar
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 4,
    paddingBottom: 8,
  },
  hdrBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLogoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownLogo: {
    width: 34,
    height: 34,
  },

  // Category Title
  titleWrapper: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
  },
  categoryTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2D3748',
    letterSpacing: 0.8,
  },

  // Subcategory Pills (Horizontal Scroll)
  pillsWrapper: {
    paddingBottom: 12,
  },
  pillsContainer: {
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'center',
  },
  pillBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8.5,
    borderRadius: 20,
    backgroundColor: '#EFECE6', // Soft warm beige inactive pill
  },
  pillBtnActive: {
    backgroundColor: '#111C44', // Dark solid navy active pill
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Product Grid
  gridContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
  },
  card: {
    width: (width - 32 - 12) / 2, // Perfect 2-column calculation with 16px page padding and 12px column gap
    marginHorizontal: 3,
    marginBottom: 16,
  },
  cardPhotoWrapper: {
    width: '100%',
    height: ((width - 44) / 2) * 1.22, // Tall portrait image matching Image 1
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  darkDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  darkDiscountText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },

  // Top-Right Wishlist Heart
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Card Content
  cardBody: {
    padding: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardBrand: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  cardName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  starChar: {
    fontSize: 11,
    color: '#F59E0B',
  },
  ratingVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  priceMain: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  priceOld: {
    fontSize: 10.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#A8824B', // Warm gold discount accent
  },
  couponText: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  deliveryIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  deliveryText: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '500',
  },

  // Floating Bottom Bar (img 3)
  floatingBarWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  floatingBar: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  floatBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 3,
  },
  floatBtnLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  floatBtnLabelHighlight: {
    color: '#A8824B',
    fontWeight: '800',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalBody: {
    paddingVertical: 12,
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#A8824B',
    fontWeight: '700',
  },
  galleryDots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  galleryDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  galleryDotActive: {
    backgroundColor: '#FFFFFF',
    width: 6,
    height: 6,
  }
});