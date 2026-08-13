import { products as mockProducts, vendors as mockVendors } from '../data/mockData';
import { ALL_FEED_PRODUCTS } from '../data/mockProductsData';

const asString = (value) => (value === undefined || value === null ? '' : String(value));

// Category-specific gallery pools
const DETAIL_IMAGE_POOLS = {
  cat_beauty: [
    require('../../assets/images/products/product_1.jpg'),
    require('../../assets/images/products/product_3.jpg'),
    require('../../assets/images/products/product_6.jpg'),
    require('../../assets/images/vendors/vendor_2.jpg'),
  ],
  cat_fashion: [
    require('../../assets/images/products/product_2.jpg'),
    require('../../assets/images/products/product_4.jpg'),
    require('../../assets/images/products/product_5.jpg'),
    require('../../assets/images/details/hero_1.jpg'),
    require('../../assets/images/details/card_1.jpg'),
    require('../../assets/images/details/card_2.jpg'),
  ],
  cat_electronics: [
    require('../../assets/images/vendors/vendor_1.jpg'),
    require('../../assets/images/banners/banner1.jpg'),
    require('../../assets/images/banners/banner2.jpg'),
  ],
  cat_groceries: [
    require('../../assets/images/vendors/vendor_3.jpg'),
    require('../../assets/images/categories/cat_3.jpg'),
    require('../../assets/images/categories/food.jpg'),
  ],
  cat_home: [
    require('../../assets/images/vendors/vendor_4.jpg'),
    require('../../assets/images/categories/cat_5.jpg'),
    require('../../assets/images/banners/banner3.jpg'),
  ],
  cat_services: [
    require('../../assets/images/vendors/vendor_8.jpg'),
    require('../../assets/images/categories/cat_4.jpg'),
    require('../../assets/images/categories/services.jpg'),
  ],
};

// Swatch presets
const DEFAULT_SWATCHES = [
  { id: 'sw_1', name: 'Primary', hex: '#BA5392' },
  { id: 'sw_2', name: 'Amber', hex: '#E27B36' },
  { id: 'sw_3', name: 'Royal Blue', hex: '#5282EC' },
  { id: 'sw_4', name: 'Deep Maroon', hex: '#772020' },
];

export const normalizeProduct = (product = {}) => {
  const vendor = mockVendors.find((v) => asString(v.id) === asString(product.vendorId));
  const price = Number(product.price || product.salePrice || 999);
  const oldPrice = Number(product.oldPrice || product.mrp || product.originalPrice || 0) || Math.round(price * 1.6);
  const discount = product.discount || (oldPrice && price ? `${Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF` : '40% OFF');
  const image = product.image || product.thumbnail || product.imageUrl || require('../../assets/images/details/hero_1.jpg');
  const categoryId = product.categoryId || product.category || 'cat_fashion';

  // Build 4 gallery images with product's own photo first
  const pool = DETAIL_IMAGE_POOLS[categoryId] || DETAIL_IMAGE_POOLS.cat_fashion;
  const gallery = [
    image,
    ...pool.filter((img) => img !== image),
  ].slice(0, 4);

  return {
    ...product,
    id: String(product.id || product.productId || product.slug || 'prod_default'),
    slug: product.slug || String(product.id || 'product'),
    brand: product.brand || product.vendor || vendor?.name || 'KingsShoppers',
    title: product.title || product.name || 'Textured Solid V-neck Top',
    name: product.name || product.title || 'Textured Solid V-neck Top',
    price,
    oldPrice,
    mrp: oldPrice,
    discount: discount.includes('OFF') ? `(${discount})` : `(${discount} OFF)`,
    rating: Number(product.rating || product.ratingValue || 4.5),
    ratingsCount: Number(product.reviewsCount || product.ratingsCount || 87),
    description: product.description || 'Premium design tailored for unmatched comfort, flattering fit, and effortless elegance.',
    image,
    gallery,
    categoryId,
    vendorId: product.vendorId,
    swatches: product.swatches || DEFAULT_SWATCHES,
  };
};

export const resolveProduct = (idOrSlug, fallbackProduct = null) => {
  const key = asString(idOrSlug);
  if (fallbackProduct) {
    return normalizeProduct({ ...fallbackProduct, id: fallbackProduct.id || key });
  }

  if (key) {
    const allProducts = [...ALL_FEED_PRODUCTS, ...mockProducts];
    const found = allProducts.find((p) => asString(p.id) === key || asString(p.slug) === key || asString(p.productId) === key);
    if (found) return normalizeProduct(found);
  }

  return normalizeProduct({ id: key || 'prod_1' });
};

export const buildProductRouteParams = (product = {}) => {
  const normalized = normalizeProduct(product);
  return {
    id: normalized.id,
    productId: normalized.id,
    slug: normalized.slug,
    product: normalized,
  };
};

export const getRelatedMockProducts = (currentCategoryId, currentProductId, limit = 4) => {
  const key = asString(currentProductId);
  return ALL_FEED_PRODUCTS
    .filter((p) => asString(p.id) !== key)
    .slice(0, limit)
    .map(normalizeProduct);
};
