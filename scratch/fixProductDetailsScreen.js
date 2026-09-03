const fs = require('fs');
const path = 'd:/httn-app/src/screens/product/ProductDetailsScreen.js';
let content = fs.readFileSync(path, 'utf8');

// Find first occurrence of export default function ProductDetailsScreen
const firstExportIdx = content.indexOf('export default function ProductDetailsScreen');
if (firstExportIdx === -1) {
  console.error('Export default function not found');
  process.exit(1);
}

// Find second occurrence if any
const secondExportIdx = content.indexOf('export default function ProductDetailsScreen', firstExportIdx + 50);
console.log('First export index:', firstExportIdx);
console.log('Second export index:', secondExportIdx);

// Also look for duplicate import statements inside the function body
const importsInsideBody = content.indexOf('import React', firstExportIdx);
console.log('Imports inside body index:', importsInsideBody);

