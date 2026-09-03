'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports['default'] = ProductListingScreen;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactNative = require('react-native');

var _reactNativeSafeAreaContext = require('react-native-safe-area-context');

var _phosphorReactNative = require('phosphor-react-native');

var _theme = require('../../theme');

var _dataMockData = require('../../data/mockData');

var _dataMockProductsData = require('../../data/mockProductsData');

var _contextWishlistContext = require('../../context/WishlistContext');

var _utilsProductResolver = require('../../utils/productResolver');

var _contextThemeContext = require('../../context/ThemeContext');

var _contextCurrencyContext = require('../../context/CurrencyContext');

var _Dimensions$get = _reactNative.Dimensions.get('window');

var width = _Dimensions$get.width;

var CARD_WIDTH = (width - 40) / 2; // 20px padding left & right, 8px middle gap

// ─── Default Category Title Map ──────────────────────────────────────────────
var CATEGORY_TITLE_MAP = {
  cat_food: 'FOOD & DINING',
  cat_fashion: 'FASHION & APPAREL',
  cat_electronics: 'ELECTRONICS & GADGETS',
  cat_home: 'HOME & DECOR',
  cat_beauty: 'BEAUTY & COSMETICS',
  cat_services: 'SERVICES & LIFESTYLE'
};

// ─── Curated Subcategory Pills ───────────────────────────────────────────────
var CATEGORY_PILLS = {
  cat_fashion: [{ id: 'all', name: 'All Fashion' }, { id: 'boutiques', name: 'Boutiques' }, { id: 'designers', name: 'Designers' }, { id: 'kiddies', name: 'Kiddies Corner' }, { id: 'bridal', name: 'Bridal' }, { id: 'western', name: 'Western Wear' }, { id: 'ethnic', name: 'Ethnic Wear' }],
  cat_food: [{ id: 'all', name: 'All Food' }, { id: 'restaurants', name: 'Restaurants' }, { id: 'fast_food', name: 'Fries & Fast Food' }, { id: 'bakeries', name: 'Bakeries' }, { id: 'snacks', name: 'Healthy Snacks' }],
  cat_electronics: [{ id: 'all', name: 'All Electronics' }, { id: 'phones', name: 'Smartphones' }, { id: 'tablets', name: 'Tablets' }, { id: 'audio', name: 'Audio' }, { id: 'accessories', name: 'Accessories' }],
  cat_home: [{ id: 'all', name: 'All Home' }, { id: 'candles', name: 'Candles' }, { id: 'decor', name: 'Decor' }, { id: 'plush', name: 'Plush Toys' }, { id: 'living', name: 'Living Room' }],
  cat_beauty: [{ id: 'all', name: 'All Beauty' }, { id: 'parfum', name: 'Parfum' }, { id: 'lipsticks', name: 'Lipsticks' }, { id: 'makeup', name: 'Makeup' }, { id: 'oral_care', name: 'Oral Care' }],
  cat_services: [{ id: 'all', name: 'All Services' }, { id: 'detailing', name: 'Car Detailing' }, { id: 'carwash', name: 'Carwash Spa' }, { id: 'arcade', name: 'Arcade Pass' }]
};

// ─── Rich Catalog for Product Listing Grid (Matching img 2) ─────────────────
var RICH_LISTING_CATALOG = _dataMockProductsData.ALL_FEED_PRODUCTS;

var SwipeableListingCard = function SwipeableListingCard(_ref) {
  var item = _ref.item;
  var isSelected = _ref.isSelected;
  var onSelect = _ref.onSelect;
  var liked = _ref.liked;
  var onToggleLike = _ref.onToggleLike;
  var formatPrice = _ref.formatPrice;
  var styles = _ref.styles;

  var _React$useState = _react2['default'].useState(0);

  var _React$useState2 = _slicedToArray(_React$useState, 2);

  var activeIndex = _React$useState2[0];
  var setActiveIndex = _React$useState2[1];

  var flatListRef = _react2['default'].useRef(null);

  var handleScroll = function handleScroll(event) {
    var x = event.nativeEvent.contentOffset.x;
    var newIndex = Math.round(x / CARD_WIDTH);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  var images = item.images && item.images.length > 0 ? item.images : [item.image];

  return _react2['default'].createElement(
    _reactNative.View,
    { style: styles.card },
    _react2['default'].createElement(
      _reactNative.View,
      { style: styles.cardPhotoWrapper },
      images.length > 1 ? _react2['default'].createElement(_reactNative.FlatList, {
        ref: flatListRef,
        data: images,
        horizontal: true,
        pagingEnabled: true,
        showsHorizontalScrollIndicator: false,
        keyExtractor: function (_, idx) {
          return idx.toString();
        },
        onScroll: handleScroll,
        scrollEventThrottle: 16,
        snapToInterval: CARD_WIDTH,
        decelerationRate: 'fast',
        style: { width: CARD_WIDTH, height: '100%' },
        renderItem: function (_ref2) {
          var img = _ref2.item;
          return _react2['default'].createElement(
            Pressable,
            { onPress: onSelect, style: { width: CARD_WIDTH, height: '100%' } },
            _react2['default'].createElement(_reactNative.Image, {
              source: img,
              style: [styles.cardPhoto, { width: CARD_WIDTH, height: '100%' }],
              resizeMode: 'cover',
              draggable: false
            })
          );
        }
      }) : _react2['default'].createElement(
        Pressable,
        { onPress: onSelect, style: { width: CARD_WIDTH, height: '100%' } },
        _react2['default'].createElement(_reactNative.Image, {
          source: images[0],
          style: [styles.cardPhoto, { width: CARD_WIDTH, height: '100%' }],
          resizeMode: 'cover',
          draggable: false
        })
      ),
      images.length > 1 && _react2['default'].createElement(
        _reactNative.View,
        { style: styles.galleryDots, pointerEvents: 'none' },
        images.map(function (_, i) {
          return _react2['default'].createElement(_reactNative.View, { key: i, style: [styles.galleryDot, i === activeIndex && styles.galleryDotActive] });
        })
      ),
      item.badgeType === 'tag' ? _react2['default'].createElement(
        _reactNative.View,
        { style: [styles.tagBadge, { backgroundColor: item.tagColor || '#4338CA' }], pointerEvents: 'none' },
        _react2['default'].createElement(
          _reactNative.Text,
          { style: styles.tagBadgeText },
          item.tagText
        )
      ) : _react2['default'].createElement(
        _reactNative.View,
        { style: styles.ratingBadge, pointerEvents: 'none' },
        _react2['default'].createElement(
          _reactNative.Text,
          { style: styles.ratingBadgeText },
          item.ratingText
        )
      ),
      _react2['default'].createElement(
        _reactNative.TouchableOpacity,
        {
          style: styles.heartBtn,
          onPress: onToggleLike,
          activeOpacity: 0.7
        },
        _react2['default'].createElement(_phosphorReactNative.Heart, {
          size: 17,
          color: liked ? '#E53935' : '#1E293B',
          weight: liked ? 'fill' : 'regular'
        })
      )
    ),
    _react2['default'].createElement(
      _reactNative.TouchableOpacity,
      { activeOpacity: 0.9, onPress: onSelect, style: styles.cardBody },
      _react2['default'].createElement(
        _reactNative.Text,
        { style: styles.cardBrand },
        item.brand
      ),
      _react2['default'].createElement(
        _reactNative.Text,
        { style: styles.cardName, numberOfLines: 1 },
        item.name
      ),
      _react2['default'].createElement(
        _reactNative.View,
        { style: styles.priceRow },
        _react2['default'].createElement(
          _reactNative.Text,
          { style: styles.priceMain },
          formatPrice(item.price)
        ),
        item.oldPrice && _react2['default'].createElement(
          _reactNative.Text,
          { style: styles.priceOld },
          formatPrice(item.oldPrice)
        ),
        item.discount && _react2['default'].createElement(
          _reactNative.Text,
          { style: styles.discountText },
          item.discount
        )
      ),
      item.bestPrice && _react2['default'].createElement(
        _reactNative.Text,
        { style: styles.couponText },
        'Best Price ',
        formatPrice(item.bestPrice),
        ' with coupon'
      ),
      item.delivery && _react2['default'].createElement(
        _reactNative.View,
        { style: styles.deliveryRow },
        _react2['default'].createElement(
          _reactNative.Text,
          { style: styles.deliveryIcon },
          '🚚'
        ),
        _react2['default'].createElement(
          _reactNative.Text,
          { style: styles.deliveryText },
          item.delivery
        )
      )
    )
  );
};

function ProductListingScreen(_ref3) {
  var route = _ref3.route;
  var navigation = _ref3.navigation;

  var _useTheme = (0, _contextThemeContext.useTheme)();

  var colors = _useTheme.colors;

  var _useCurrency = (0, _contextCurrencyContext.useCurrency)();

  var formatPrice = _useCurrency.formatPrice;

  var _ref4 = route && route.params || {};

  var _ref4$categoryId = _ref4.categoryId;
  var categoryId = _ref4$categoryId === undefined ? 'cat_fashion' : _ref4$categoryId;
  var subcategoryId = _ref4.subcategoryId;

  var _useWishlist = (0, _contextWishlistContext.useWishlist)();

  var isLiked = _useWishlist.isLiked;
  var toggleWishlist = _useWishlist.toggleWishlist;

  var _useState = (0, _react.useState)('all');

  var _useState2 = _slicedToArray(_useState, 2);

  var selectedSubCatId = _useState2[0];
  var setSelectedSubCatId = _useState2[1];

  var _useState3 = (0, _react.useState)('All');

  var _useState32 = _slicedToArray(_useState3, 2);

  var selectedGender = _useState32[0];
  var setSelectedGender = _useState32[1];

  var _useState4 = (0, _react.useState)('All');

  var _useState42 = _slicedToArray(_useState4, 2);

  var selectedBrand = _useState42[0];
  var setSelectedBrand = _useState42[1];

  var _useState5 = (0, _react.useState)('All');

  var _useState52 = _slicedToArray(_useState5, 2);

  var selectedSize = _useState52[0];
  var setSelectedSize = _useState52[1];

  var _useState6 = (0, _react.useState)('All');

  var _useState62 = _slicedToArray(_useState6, 2);

  var selectedPrice = _useState62[0];
  var setSelectedPrice = _useState62[1];

  var _useState7 = (0, _react.useState)('Popularity');

  var _useState72 = _slicedToArray(_useState7, 2);

  var selectedSort = _useState72[0];
  var setSelectedSort = _useState72[1];

  var _useState8 = (0, _react.useState)(false);

  var _useState82 = _slicedToArray(_useState8, 2);

  var filterModalVisible = _useState82[0];
  var setFilterModalVisible = _useState82[1];

  var _useState9 = (0, _react.useState)('Sort');

  var _useState92 = _slicedToArray(_useState9, 2);

  var activeFilterTab = _useState92[0];
  var setActiveFilterTab = _useState92[1];

  var categoryTitle = CATEGORY_TITLE_MAP[categoryId] || 'FASHION & APPAREL';
  var pills = CATEGORY_PILLS[categoryId] || CATEGORY_PILLS.cat_fashion;

  // Filter products by selected category, gender, brand, size, price, and sort
  var displayedProducts = (0, _react.useMemo)(function () {
    var items = _dataMockProductsData.ALL_FEED_PRODUCTS.filter(function (p) {
      return p.categoryId === categoryId;
    });
    if (items.length === 0) {
      items = _dataMockProductsData.ALL_FEED_PRODUCTS;
    }

    if (selectedSubCatId !== 'all') {
      items = items.filter(function (p) {
        return p.subcat === selectedSubCatId;
      });
    }

    if (selectedGender !== 'All') {
      items = items.filter(function (p) {
        var nameLower = p.name.toLowerCase();
        if (selectedGender === 'Women') return nameLower.includes('women') || nameLower.includes('ruffles');
        if (selectedGender === 'Men') return nameLower.includes('men') || nameLower.includes('mens') || nameLower.includes('suit');
        if (selectedGender === 'Kids') return nameLower.includes('kids') || nameLower.includes('child');
        if (selectedGender === 'Unisex') return !nameLower.includes('women') && !nameLower.includes('men') && !nameLower.includes('kids');
        return true;
      });
    }

    if (selectedBrand !== 'All') {
      items = items.filter(function (p) {
        return p.brand === selectedBrand;
      });
    }

    if (selectedPrice !== 'All') {
      items = items.filter(function (p) {
        if (selectedPrice === 'Under ' + formatPrice(400)) return p.price < 400;
        if (selectedPrice === formatPrice(400) + ' - ' + formatPrice(800)) return p.price >= 400 && p.price <= 800;
        if (selectedPrice === 'Over ' + formatPrice(800)) return p.price > 800;
        return true;
      });
    }

    if (selectedSize !== 'All') {
      items = items.filter(function (p, index) {
        if (selectedSize === 'S') return index % 2 === 0;
        if (selectedSize === 'M') return index % 3 !== 0;
        if (selectedSize === 'L') return index % 4 !== 0;
        if (selectedSize === 'XL') return index % 2 !== 0;
        return true;
      });
    }

    if (selectedSort === 'Price: Low to High') {
      items = [].concat(_toConsumableArray(items)).sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (selectedSort === 'Price: High to Low') {
      items = [].concat(_toConsumableArray(items)).sort(function (a, b) {
        return b.price - a.price;
      });
    } else if (selectedSort === 'Discount') {
      items = [].concat(_toConsumableArray(items)).sort(function (a, b) {
        var discA = parseFloat(a.discount) || 0;
        var discB = parseFloat(b.discount) || 0;
        return discB - discA;
      });
    } else if (selectedSort === 'Rating') {
      items = [].concat(_toConsumableArray(items)).sort(function (a, b) {
        var ratA = parseFloat(a.ratingText) || 0;
        var ratB = parseFloat(b.ratingText) || 0;
        return ratB - ratA;
      });
    }

    return items;
  }, [categoryId, selectedSubCatId, selectedGender, selectedBrand, selectedPrice, selectedSize, selectedSort]);

  var renderProductCard = function renderProductCard(_ref5) {
    var item = _ref5.item;

    var liked = isLiked(item.id);
    var imgSrc = typeof item.image === 'number' ? item.image : typeof item.image === 'string' ? { uri: item.image } : item.image;
    var discountPct = item.oldPrice && item.price ? Math.round((item.oldPrice - item.price) / item.oldPrice * 100) : null;

    return _react2['default'].createElement(
      _reactNative.TouchableOpacity,
      {
        style: styles.card,
        onPress: function () {
          return navigation.navigate('ProductDetails', (0, _utilsProductResolver.buildProductRouteParams)(item));
        },
        activeOpacity: 0.88
      },
      _react2['default'].createElement(
        _reactNative.View,
        { style: styles.cardPhotoWrapper },
        _react2['default'].createElement(_reactNative.Image, { source: imgSrc, style: styles.cardPhoto, resizeMode: 'cover' }),
        discountPct > 0 && _react2['default'].createElement(
          _reactNative.View,
          { style: styles.darkDiscountBadge },
          _react2['default'].createElement(
            _reactNative.Text,
            { style: styles.darkDiscountText },
            '-',
            discountPct,
            '%'
          )
        ),
        _react2['default'].createElement(
          _reactNative.TouchableOpacity,
          {
            style: styles.heartBtn,
            onPress: function () {
              return toggleWishlist(item.id);
            },
            activeOpacity: 0.7
          },
          _react2['default'].createElement(_phosphorReactNative.Heart, {
            size: 16,
            color: liked ? '#E11D48' : '#2D3748',
            weight: liked ? 'fill' : 'regular'
          })
        )
      ),
      _react2['default'].createElement(
        _reactNative.View,
        { style: styles.cardBody },
        _react2['default'].createElement(
          _reactNative.View,
          { style: styles.cardHeaderRow },
          _react2['default'].createElement(
            _reactNative.Text,
            { style: styles.cardName, numberOfLines: 1 },
            item.name
          ),
          _react2['default'].createElement(
            _reactNative.View,
            { style: styles.ratingRow },
            _react2['default'].createElement(
              _reactNative.Text,
              { style: styles.starChar },
              '★'
            ),
            _react2['default'].createElement(
              _reactNative.Text,
              { style: styles.ratingVal },
              item.rating || item.ratingText && item.ratingText.split(' ')[0] || '4.9'
            )
          )
        ),
        _react2['default'].createElement(
          _reactNative.View,
          { style: styles.priceRow },
          _react2['default'].createElement(
            _reactNative.Text,
            { style: styles.priceMain },
            formatPrice(item.price)
          ),
          item.oldPrice && _react2['default'].createElement(
            _reactNative.Text,
            { style: styles.priceOld },
            formatPrice(item.oldPrice)
          )
        )
      )
    );
  };

  return _react2['default'].createElement(
    _reactNativeSafeAreaContext.SafeAreaView,
    { style: styles.safeArea },
    _react2['default'].createElement(
      _reactNative.View,
      { style: styles.header },
      _react2['default'].createElement(
        _reactNative.TouchableOpacity,
        {
          style: styles.hdrBtn,
          onPress: function () {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          },
          activeOpacity: 0.7
        },
        _react2['default'].createElement(_phosphorReactNative.CaretLeft, { size: 24, color: '#1E293B', weight: 'bold' })
      ),
      _react2['default'].createElement(
        _reactNative.View,
        { style: styles.centerLogoWrapper },
        _react2['default'].createElement(_reactNative.Image, {
          source: require('../../../assets/images/crown_logo.png'),
          style: styles.crownLogo,
          resizeMode: 'contain'
        })
      ),
      _react2['default'].createElement(
        _reactNative.TouchableOpacity,
        {
          style: styles.hdrBtn,
          onPress: function () {
            return navigation.navigate('Search');
          },
          activeOpacity: 0.7
        },
        _react2['default'].createElement(_phosphorReactNative.MagnifyingGlass, { size: 22, color: '#1E293B', weight: 'bold' })
      )
    ),
    _react2['default'].createElement(
      _reactNative.View,
      { style: styles.titleWrapper },
      _react2['default'].createElement(
        _reactNative.Text,
        { style: styles.categoryTitle },
        categoryTitle
      )
    ),
    _react2['default'].createElement(
      _reactNative.View,
      { style: styles.pillsWrapper },
      _react2['default'].createElement(
        _reactNative.ScrollView,
        {
          horizontal: true,
          showsHorizontalScrollIndicator: false,
          contentContainerStyle: styles.pillsContainer
        },
        pills.map(function (pill) {
          var isActive = selectedSubCatId === pill.id;
          return _react2['default'].createElement(
            _reactNative.TouchableOpacity,
            {
              key: pill.id,
              style: [styles.pillBtn, isActive && styles.pillBtnActive],
              onPress: function () {
                return setSelectedSubCatId(pill.id);
              },
              activeOpacity: 0.8
            },
            _react2['default'].createElement(
              _reactNative.Text,
              { style: [styles.pillText, isActive && styles.pillTextActive] },
              pill.name
            )
          );
        })
      )
    ),
    _react2['default'].createElement(_reactNative.FlatList, {
      data: displayedProducts,
      numColumns: 2,
      keyExtractor: function (item) {
        return item.id;
      },
      renderItem: renderProductCard,
      contentContainerStyle: styles.gridContainer,
      showsVerticalScrollIndicator: false
    }),
    _react2['default'].createElement(
      _reactNative.View,
      { style: styles.floatingBarWrapper },
      _react2['default'].createElement(
        _reactNative.View,
        { style: styles.floatingBar },
        _react2['default'].createElement(
          _reactNative.TouchableOpacity,
          {
            style: styles.floatBtn,
            onPress: function () {
              setActiveFilterTab('Sort');
              setFilterModalVisible(true);
            },
            activeOpacity: 0.7
          },
          _react2['default'].createElement(_phosphorReactNative.ArrowsDownUp, { size: 20, color: selectedSort !== 'Popularity' ? '#A8824B' : '#475569', weight: selectedSort !== 'Popularity' ? 'bold' : 'regular' }),
          _react2['default'].createElement(
            _reactNative.Text,
            { style: [styles.floatBtnLabel, selectedSort !== 'Popularity' && styles.floatBtnLabelHighlight] },
            'Sort'
          )
        ),
        _react2['default'].createElement(
          _reactNative.TouchableOpacity,
          {
            style: styles.floatBtn,
            onPress: function () {
              setActiveFilterTab('Gender');
              setFilterModalVisible(true);
            },
            activeOpacity: 0.7
          },
          _react2['default'].createElement(_phosphorReactNative.Users, { size: 20, color: selectedGender !== 'All' ? '#A8824B' : '#475569', weight: selectedGender !== 'All' ? 'bold' : 'regular' }),
          _react2['default'].createElement(
            _reactNative.Text,
            { style: [styles.floatBtnLabel, selectedGender !== 'All' && styles.floatBtnLabelHighlight] },
            'Gender'
          )
        ),
        _react2['default'].createElement(
          _reactNative.TouchableOpacity,
          {
            style: styles.floatBtn,
            onPress: function () {
              setActiveFilterTab('Brand');
              setFilterModalVisible(true);
            },
            activeOpacity: 0.7
          },
          _react2['default'].createElement(_phosphorReactNative.Tag, { size: 20, color: selectedBrand !== 'All' ? '#A8824B' : '#475569', weight: selectedBrand !== 'All' ? 'bold' : 'regular' }),
          _react2['default'].createElement(
            _reactNative.Text,
            { style: [styles.floatBtnLabel, selectedBrand !== 'All' && styles.floatBtnLabelHighlight] },
            'Brand'
          )
        ),
        _react2['default'].createElement(
          _reactNative.TouchableOpacity,
          {
            style: styles.floatBtn,
            onPress: function () {
              setActiveFilterTab('Size');
              setFilterModalVisible(true);
            },
            activeOpacity: 0.7
          },
          _react2['default'].createElement(_phosphorReactNative.Ruler, { size: 20, color: selectedSize !== 'All' ? '#A8824B' : '#475569', weight: selectedSize !== 'All' ? 'bold' : 'regular' }),
          _react2['default'].createElement(
            _reactNative.Text,
            { style: [styles.floatBtnLabel, selectedSize !== 'All' && styles.floatBtnLabelHighlight] },
            'Size'
          )
        ),
        _react2['default'].createElement(
          _reactNative.TouchableOpacity,
          {
            style: styles.floatBtn,
            onPress: function () {
              setActiveFilterTab('Filters');
              setFilterModalVisible(true);
            },
            activeOpacity: 0.7
          },
          _react2['default'].createElement(_phosphorReactNative.SlidersHorizontal, { size: 20, color: selectedPrice !== 'All' ? '#A8824B' : '#475569', weight: 'bold' }),
          _react2['default'].createElement(
            _reactNative.Text,
            { style: [styles.floatBtnLabel, selectedPrice !== 'All' && styles.floatBtnLabelHighlight] },
            'Filters'
          )
        )
      )
    ),
    _react2['default'].createElement(
      _reactNative.Modal,
      {
        visible: filterModalVisible,
        transparent: true,
        animationType: 'slide',
        onRequestClose: function () {
          return setFilterModalVisible(false);
        }
      },
      _react2['default'].createElement(
        _reactNative.View,
        { style: styles.modalOverlay },
        _react2['default'].createElement(
          _reactNative.View,
          { style: styles.modalContent },
          _react2['default'].createElement(
            _reactNative.View,
            { style: styles.modalHeader },
            _react2['default'].createElement(
              _reactNative.Text,
              { style: styles.modalTitle },
              activeFilterTab
            ),
            _react2['default'].createElement(
              _reactNative.TouchableOpacity,
              { onPress: function () {
                  return setFilterModalVisible(false);
                } },
              _react2['default'].createElement(_phosphorReactNative.X, { size: 22, color: '#1E293B', weight: 'bold' })
            )
          ),
          activeFilterTab === 'Sort' && _react2['default'].createElement(
            _reactNative.View,
            { style: styles.modalBody },
            ['Popularity', 'Price: Low to High', 'Price: High to Low', 'Discount', 'Rating'].map(function (opt) {
              return _react2['default'].createElement(
                _reactNative.TouchableOpacity,
                {
                  key: opt,
                  style: styles.sortOptionRow,
                  onPress: function () {
                    setSelectedSort(opt);
                    setFilterModalVisible(false);
                  }
                },
                _react2['default'].createElement(
                  _reactNative.Text,
                  { style: [styles.sortOptionText, selectedSort === opt && styles.sortOptionTextActive] },
                  opt
                ),
                selectedSort === opt && _react2['default'].createElement(_phosphorReactNative.Check, { size: 18, color: '#A8824B', weight: 'bold' })
              );
            })
          ),
          activeFilterTab === 'Gender' && _react2['default'].createElement(
            _reactNative.View,
            { style: styles.modalBody },
            ['All', 'Women', 'Men', 'Kids', 'Unisex'].map(function (g) {
              return _react2['default'].createElement(
                _reactNative.TouchableOpacity,
                {
                  key: g,
                  style: styles.sortOptionRow,
                  onPress: function () {
                    setSelectedGender(g);
                    setFilterModalVisible(false);
                  }
                },
                _react2['default'].createElement(
                  _reactNative.Text,
                  { style: [styles.sortOptionText, selectedGender === g && styles.sortOptionTextActive] },
                  g
                ),
                selectedGender === g && _react2['default'].createElement(_phosphorReactNative.Check, { size: 18, color: '#A8824B', weight: 'bold' })
              );
            })
          ),
          activeFilterTab === 'Brand' && _react2['default'].createElement(
            _reactNative.View,
            { style: styles.modalBody },
            ['All', 'Fashion Redemption', 'Selvia', 'Athena', 'Lumiere'].map(function (b) {
              return _react2['default'].createElement(
                _reactNative.TouchableOpacity,
                {
                  key: b,
                  style: styles.sortOptionRow,
                  onPress: function () {
                    setSelectedBrand(b);
                    setFilterModalVisible(false);
                  }
                },
                _react2['default'].createElement(
                  _reactNative.Text,
                  { style: [styles.sortOptionText, selectedBrand === b && styles.sortOptionTextActive] },
                  b
                ),
                selectedBrand === b && _react2['default'].createElement(_phosphorReactNative.Check, { size: 18, color: '#A8824B', weight: 'bold' })
              );
            })
          ),
          activeFilterTab === 'Size' && _react2['default'].createElement(
            _reactNative.View,
            { style: styles.modalBody },
            ['All', 'S', 'M', 'L', 'XL'].map(function (s) {
              return _react2['default'].createElement(
                _reactNative.TouchableOpacity,
                {
                  key: s,
                  style: styles.sortOptionRow,
                  onPress: function () {
                    setSelectedSize(s);
                    setFilterModalVisible(false);
                  }
                },
                _react2['default'].createElement(
                  _reactNative.Text,
                  { style: [styles.sortOptionText, selectedSize === s && styles.sortOptionTextActive] },
                  s
                ),
                selectedSize === s && _react2['default'].createElement(_phosphorReactNative.Check, { size: 18, color: '#A8824B', weight: 'bold' })
              );
            })
          ),
          activeFilterTab === 'Filters' && _react2['default'].createElement(
            _reactNative.View,
            { style: styles.modalBody },
            ['All Prices', 'Under ' + formatPrice(400), formatPrice(400) + ' - ' + formatPrice(800), 'Over ' + formatPrice(800)].map(function (p) {
              return _react2['default'].createElement(
                _reactNative.TouchableOpacity,
                {
                  key: p,
                  style: styles.sortOptionRow,
                  onPress: function () {
                    setSelectedPrice(p === 'All Prices' ? 'All' : p);
                    setFilterModalVisible(false);
                  }
                },
                _react2['default'].createElement(
                  _reactNative.Text,
                  { style: [styles.sortOptionText, (p === 'All Prices' ? selectedPrice === 'All' : selectedPrice === p) && styles.sortOptionTextActive] },
                  p
                ),
                (p === 'All Prices' ? selectedPrice === 'All' : selectedPrice === p) && _react2['default'].createElement(_phosphorReactNative.Check, { size: 18, color: '#A8824B', weight: 'bold' })
              );
            })
          )
        )
      )
    )
  );
}

var styles = _reactNative.StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF' },

  // Pure white background matching Home page
  // Header Bar
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: _reactNative.Platform.OS === 'android' ? 10 : 4,
    paddingBottom: 8
  },
  hdrBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },
  centerLogoWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  crownLogo: {
    width: 34,
    height: 34
  },

  // Category Title
  titleWrapper: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10
  },
  categoryTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2D3748',
    letterSpacing: 0.8
  },

  // Subcategory Pills (Horizontal Scroll)
  pillsWrapper: {
    paddingBottom: 12
  },
  pillsContainer: {
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'center'
  },
  pillBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8.5,
    borderRadius: 20,
    backgroundColor: '#EFECE6' },
  // Soft warm beige inactive pill
  pillBtnActive: {
    backgroundColor: '#111C44' },
  // Dark solid navy active pill
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748'
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },

  // Product Grid
  gridContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90
  },
  card: {
    width: (width - 32 - 12) / 2, // Perfect 2-column calculation with 16px page padding and 12px column gap
    marginHorizontal: 3,
    marginBottom: 16
  },
  cardPhotoWrapper: {
    width: '100%',
    height: (width - 44) / 2 * 1.22, // Tall portrait image matching Image 1
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6'
  },
  cardPhoto: {
    width: '100%',
    height: '100%'
  },
  darkDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  darkDiscountText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800'
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
    elevation: 2
  },

  // Card Content
  cardBody: {
    padding: 10
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  cardBrand: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B'
  },
  cardName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 6
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  starChar: {
    fontSize: 11,
    color: '#F59E0B'
  },
  ratingVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569'
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4
  },
  priceMain: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B'
  },
  priceOld: {
    fontSize: 10.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through'
  },
  discountText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#A8824B' },
  // Warm gold discount accent
  couponText: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500'
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  deliveryIcon: {
    fontSize: 10,
    marginRight: 4
  },
  deliveryText: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '500'
  },

  // Floating Bottom Bar (img 3)
  floatingBarWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center'
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
    borderColor: 'rgba(0,0,0,0.04)'
  },
  floatBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 3
  },
  floatBtnLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569'
  },
  floatBtnLabelHighlight: {
    color: '#A8824B',
    fontWeight: '800'
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B'
  },
  modalBody: {
    paddingVertical: 12
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC'
  },
  sortOptionText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500'
  },
  sortOptionTextActive: {
    color: '#A8824B',
    fontWeight: '700'
  },
  galleryDots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4
  },
  galleryDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)'
  },
  galleryDotActive: {
    backgroundColor: '#FFFFFF',
    width: 6,
    height: 6
  }
});
module.exports = exports['default'];
/* Photo Container matching Image 1 */ /* Top Left Dark Discount Badge (-20%) */ /* Top Right Heart Wishlist Button */ /* Card Details matching Image 1 layout */ /* ─── Top Header: Back | Centered Crown Logo | Search ──────────── */ /* ─── Category Title (e.g. FASHION & APPAREL) ───────────────────── */ /* ─── Subcategory Filter Pills (Horizontal Scroll) ──────────────── */ /* ─── 2-Column Product Grid ─────────────────────────────────────── */ /* ─── Floating Bottom Navigation Bar (img 3) ────────────────────── */ /* ─── Filter / Sort Modal ────────────────────────────────────────── */
