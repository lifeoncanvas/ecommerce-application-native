import { products, vendors } from '../data/mockData';

const asString = (value) => (value === undefined || value === null ? '' : String(value));

export const normalizeProduct = (rawProduct = {}) => {
  const key = asString(rawProduct.id || rawProduct.productId || rawProduct.slug);
  const found = products.find((p) => asString(p.id) === key) || rawProduct;

  const vendor = vendors.find((v) => asString(v.id) === asString(found.vendorId));

  const image = found.image || (found.images && found.images[0]) || require('../../assets/images/details/hero_1.jpg');
  const images = (found.images && found.images.length > 0) ? found.images : [image];

  const price = Number(found.price || 99);
  const oldPrice = Number(found.oldPrice || found.mrp || Math.round(price * 1.3));
  const discount = found.discount || `${Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF`;

  const categoryId = found.categoryId || rawProduct.categoryId || 'cat_fashion';
  const category = found.category || rawProduct.category || '';
  const isBooking = !!(
    found.isBooking ||
    rawProduct.isBooking ||
    categoryId === 'cat_services' ||
    categoryId === 'cat_food' ||
    (typeof category === 'string' &&
      (category.toLowerCase().includes('service') || category.toLowerCase().includes('food')))
  );

  return {
    ...found,
    id: String(found.id || 'prod_default'),
    name: found.name || found.title || 'Product Item',
    title: found.title || found.name || 'Product Item',
    brand: found.brand || vendor?.name || (isBooking ? 'Services & Fun' : 'Pinnacle Brand'),
    vendorName: vendor?.name || found.brand || 'Pinnacle Merchant',
    vendorLocation: vendor?.location || 'PINNACLE MALL',
    vendorRating: vendor?.rating || 4.8,
    price,
    oldPrice,
    mrp: oldPrice,
    discount: discount.includes('OFF') ? discount : `${discount} OFF`,
    rating: Number(found.rating || 4.8),
    ratingsCount: Number(found.reviewsCount || 100),
    description: found.description || 'High quality product curated for excellence.',
    image,
    images,
    gallery: images,
    metadata: found.metadata || {},
    categoryId,
    category,
    subcategoryId: found.subcategoryId || '',
    vendorId: found.vendorId,
    isBooking,
    colorGroups: found.colorGroups || rawProduct.colorGroups || null,
    colors: found.colors || rawProduct.colors || null,
    sizes: found.sizes || rawProduct.sizes || null,
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
