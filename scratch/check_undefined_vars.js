const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('src/screens/product/ProductDetailsScreen.js', 'utf8');

try {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  const globals = new Set();
  traverse(ast, {
    Identifier(path) {
      if (path.isReferencedIdentifier()) {
        const name = path.node.name;
        if (!path.scope.hasBinding(name) && !globalThis[name] && !['console', 'Math', 'Date', 'String', 'Number', 'Boolean', 'Array', 'Object', 'RegExp', 'Error', 'undefined', 'null', 'NaN', 'parseInt', 'parseFloat', 'require', 'global', 'window'].includes(name)) {
          globals.add(name);
        }
      }
    }
  });

  console.log('Unbound identifiers:', Array.from(globals));
} catch(e) {
  console.error('AST Error:', e);
}
