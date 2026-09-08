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

  return {
    ...product,
    id: String(product.id || product.productId || product.slug || 'prod_default'),
    slug: product.slug || String(product.id || 'product'),
    brand: product.brand || product.vendor || vendor?.name || 'Licht Marketing',
    title: product.title || product.name || 'Textured Solid V-neck Top',
    name: product.name || product.title || 'Textured Solid V-neck Top',
    ...found,
    id: String(found.id || 'prod_default'),
    name: found.name || found.title || 'Product Item',
    title: found.title || found.name || 'Product Item',
    brand: found.brand || vendor?.name || 'Pinnacle Brand',
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
    categoryId: found.categoryId || 'cat_fashion',
    subcategoryId: found.subcategoryId || '',
    vendorId: found.vendorId,
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
