import { products, vendors } from '../data/mockData';

const asString = (value) => (value === undefined || value === null ? '' : String(value));

export const normalizeProduct = (rawProduct = {}) => {
  const key = asString(rawProduct.id || rawProduct.productId || rawProduct.slug);
  const foundInMock = products.find((p) => asString(p.id) === key || asString(p.slug) === key) || {};
  const merged = { ...foundInMock, ...rawProduct };

  const vendor = vendors.find((v) => asString(v.id) === asString(merged.vendorId));

  const image = merged.image || (merged.images && merged.images[0]) || (merged.gallery && merged.gallery[0]) || require('../../assets/images/details/hero_1.jpg');
  const images = (merged.images && merged.images.length > 0) ? merged.images : (merged.gallery && merged.gallery.length > 0) ? merged.gallery : [image];

  const price = Number(merged.price || 99);
  const oldPrice = Number(merged.oldPrice || merged.mrp || Math.round(price * 1.3));
  const discount = merged.discount || `${Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF`;

  const categoryId = merged.categoryId || 'cat_fashion';
  const category = merged.category || '';
  const isBooking = !!(
    merged.isBooking ||
    categoryId === 'cat_services' ||
    categoryId === 'cat_food' ||
    (typeof category === 'string' &&
      (category.toLowerCase().includes('service') || category.toLowerCase().includes('food')))
  );

  return {
    ...merged,
    id: String(merged.id || 'prod_default'),
    name: merged.name || merged.title || 'Product Item',
    title: merged.title || merged.name || 'Product Item',
    brand: merged.brand || vendor?.name || (isBooking ? 'Services & Fun' : 'Pinnacle Brand'),
    vendorName: vendor?.name || merged.brand || 'Pinnacle Merchant',
    vendorLocation: vendor?.location || 'PINNACLE MALL',
    vendorRating: vendor?.rating || 4.8,
    price,
    oldPrice,
    mrp: oldPrice,
    discount: discount.includes('OFF') ? discount : `${discount} OFF`,
    rating: Number(merged.rating || 4.8),
    ratingsCount: Number(merged.reviewsCount || 100),
    description: merged.description || 'High quality product curated for excellence.',
    image,
    images,
    gallery: images,
    metadata: merged.metadata || {},
    categoryId,
    category,
    subcategoryId: merged.subcategoryId || '',
    vendorId: merged.vendorId,
    isBooking,
    colorGroups: merged.colorGroups || null,
    colors: merged.colors || null,
    sizes: merged.sizes || null,
  };
};

export const resolveProduct = (idOrSlug, fallbackProduct = null) => {
  const key = asString(idOrSlug);
  if (key) {
    const found = products.find((p) => asString(p.id) === key || asString(p.slug) === key);
    if (found) return normalizeProduct(found);
  }
  if (fallbackProduct) {
    return normalizeProduct(fallbackProduct);
  }
  return normalizeProduct(products[0]);
};

export const buildProductRouteParams = (product = {}) => {
  const normalized = normalizeProduct(product);
  return {
    id: normalized.id,
    productId: normalized.id,
    slug: normalized.id,
    product: normalized,
  };
};

export const getRelatedMockProducts = (currentCategoryId, currentProductId, limit = 4) => {
  const key = asString(currentProductId);
  return products
    .filter((p) => asString(p.id) !== key && p.categoryId === currentCategoryId)
    .concat(products.filter((p) => asString(p.id) !== key && p.categoryId !== currentCategoryId))
    .slice(0, limit)
    .map(normalizeProduct);
};
