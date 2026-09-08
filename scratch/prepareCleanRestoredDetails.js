const fs = require('fs');

let code = fs.readFileSync('./scratch/db97df9_details.js', 'utf8');

// 1. Fix optional chaining in state initialization
code = code.replace("days[0]?.value", "(days[0] && days[0].value)");
code = code.replace(/cartItems\?\./g, "(cartItems && cartItems.");

// 2. Fix carousel width handling for web & mobile swiping
// Add slideWidth state if not present
if (!code.includes('slideWidth')) {
  code = code.replace(
    "const carouselScrollRef = useRef(null);",
    "const carouselScrollRef = useRef(null);\n  const [slideWidth, setSlideWidth] = useState(HERO_WIDTH);"
  );
}

// 3. Make heroBoxContainer measure its layout width
code = code.replace(
  "<View style={styles.heroBoxContainer}>",
  `<View style={styles.heroBoxContainer} onLayout={(e) => { const w = e.nativeEvent.layout.width; if (w > 0) setSlideWidth(w); }}>`
);

// 4. Update Carousel ScrollView to use slideWidth and handle onScroll
code = code.replace(
  "onMomentumScrollEnd={(e) => {\n              const idx = Math.round(e.nativeEvent.contentOffset.x / HERO_WIDTH);\n              setActiveImageIndex(idx);\n            }}",
  `scrollEventThrottle={16}
            onScroll={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const idx = Math.round(offsetX / (slideWidth || 1));
              if (idx >= 0 && idx < galleryImages.length && idx !== activeImageIndex) {
                setActiveImageIndex(idx);
              }
            }}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (slideWidth || 1));
              if (idx >= 0 && idx < galleryImages.length) {
                setActiveImageIndex(idx);
              }
            }}`
);

// 5. Replace HERO_WIDTH in slide wrapper with slideWidth
code = code.replace("style={styles.heroSlideWrapper}", "style={[styles.heroSlideWrapper, { width: slideWidth }]}");
code = code.replace("style={styles.heroImage}", "style={[styles.heroImage, { width: slideWidth * 0.88 }]}");
code = code.replace(/x: nextIdx \* HERO_WIDTH/g, "x: nextIdx * slideWidth");

fs.writeFileSync('src/screens/product/ProductDetailsScreen.js', code, 'utf8');
console.log('Restored ProductDetailsScreen.js successfully!');
