const fs = require('fs');
let content = fs.readFileSync('src/screens/profile/VendorDashboardScreen.js', 'utf8');

// Fix ternary storeInfo.id checks first (most complex)
content = content.replace(
  /storeInfo\.id === 2 \? 'cat_food' : storeInfo\.id === 3 \? 'cat_electronics' : 'cat_fashion'/g,
  "(storeInfo?.id === 2 ? 'cat_food' : storeInfo?.id === 3 ? 'cat_electronics' : 'cat_fashion')"
);
content = content.replace(
  /storeInfo\.id === 2 \? '🍔' : storeInfo\.id === 3 \? '📱' : '👟'/g,
  "(storeInfo?.id === 2 ? '🍔' : storeInfo?.id === 3 ? '📱' : '👟')"
);

// Fix remaining storeInfo.id accesses
content = content.replace(/storeInfo\.id(?!\?)/g, 'storeInfo?.id');

// Fix storeInfo.name -> storeInfo?.name (leave fallback to template sites)
content = content.replace(/storeInfo\.name(?!\?)/g, "(storeInfo?.name || 'My Store')");

// Fix storeInfo.description
content = content.replace(/storeInfo\.description(?!\?)/g, "(storeInfo?.description || '')");

// Fix storeInfo.rating
content = content.replace(/storeInfo\.rating(?!\?)/g, 'storeInfo?.rating');

// Fix storeInfo.category
content = content.replace(/storeInfo\.category(?!\?)/g, 'storeInfo?.category');

// Fix storeInfo.address
content = content.replace(/storeInfo\.address(?!\?)/g, 'storeInfo?.address');

// Fix storeInfo.phone
content = content.replace(/storeInfo\.phone(?!\?)/g, 'storeInfo?.phone');

fs.writeFileSync('src/screens/profile/VendorDashboardScreen.js', content, 'utf8');
console.log('Done! Fixed all storeInfo property accesses');
