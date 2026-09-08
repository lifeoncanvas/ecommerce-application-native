const fs = require('fs');
const path = require('path');

const code = fs.readFileSync('src/screens/product/ProductDetailsScreen.js', 'utf8');
const regex = /require\(['"]([^'"]+)['"]\)/g;

let match;
let missingCount = 0;
while ((match = regex.exec(code)) !== null) {
  const relPath = match[1];
  if (relPath.startsWith('.')) {
    const fullPath = path.resolve('src/screens/product', relPath);
    if (!fs.existsSync(fullPath)) {
      console.error('MISSING ASSET:', relPath, '->', fullPath);
      missingCount++;
    }
  }
}

console.log('Done checking requires. Missing assets count:', missingCount);
