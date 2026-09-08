const { resolveProduct, getRelatedMockProducts } = require('../src/utils/productResolver.js');

try {
  const p1 = resolveProduct('prod_kalaya_blush');
  console.log('p1:', p1 ? p1.title : 'NULL');
  const p2 = resolveProduct(undefined);
  console.log('p2:', p2 ? p2.title : 'NULL');
  const p3 = resolveProduct({});
  console.log('p3:', p3 ? p3.title : 'NULL');
  const rel = getRelatedMockProducts(p1.categoryId, p1.id, 3);
  console.log('rel length:', rel ? rel.length : 'NULL');
} catch(e) {
  console.error('Error in resolver:', e);
}
