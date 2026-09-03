const { execSync } = require('child_process');
const fs = require('fs');

const code = execSync('git show db97df9:src/screens/product/ProductDetailsScreen.js', { encoding: 'utf8' });
fs.writeFileSync('./scratch/db97df9_details.js', code, 'utf8');

console.log('Saved db97df9_details.js (length:', code.length, ')');
console.log('Includes SizeChart:', code.includes('Size Chart'));
console.log('Includes Customer Reviews:', code.includes('Customer Reviews'));
console.log('Includes Similar Products / You Might Also Like:', code.includes('You Might Also Like') || code.includes('Similar Products'));
