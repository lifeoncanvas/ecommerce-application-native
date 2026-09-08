// Mobile type scale according to the HTTN Brand Style Guide
export const typography = {
  hero: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 31.2, // 26 * 1.2
  },
  h1: {
    fontSize: 22, // Mobile Screen Titles
    fontWeight: '700',
    lineHeight: 27.5, // 22 * 1.25
  },
  h2: {
    fontSize: 20, // Section Headings
    fontWeight: '600',
    lineHeight: 26, // 20 * 1.3
  },
  h3: {
    fontSize: 16, // Card Headings & Vendor Name
    fontWeight: '600',
    lineHeight: 21.6, // 16 * 1.35
  },
  h4: {
    fontSize: 14, // Sub-section labels
    fontWeight: '600',
    lineHeight: 19.6, // 14 * 1.4
  },
  h5: {
    fontSize: 12, // Small headings in cards
    fontWeight: '600',
    lineHeight: 16.8, // 12 * 1.4
  },
  bodyLarge: {
    fontSize: 16, // Product descriptions, vendor bio
    fontWeight: '400',
    lineHeight: 25.6, // 16 * 1.6
  },
  body: {
    fontSize: 14, // Standard body, review content (Mobile Body Regular)
    fontWeight: '400',
    lineHeight: 21, // 14 * 1.5
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  bodySmall: {
    fontSize: 13, // Supporting details
    fontWeight: '400',
    lineHeight: 19.5, // 13 * 1.5
  },
  pricePrimary: {
    fontSize: 18, // Mobile main product price (drop 4px from web 22px)
    fontWeight: '700',
    lineHeight: 18,
  },
  priceStrike: {
    fontSize: 12, // Original price before discount
    fontWeight: '400',
    lineHeight: 12,
  },
  buttonLarge: {
    fontSize: 16, // Add to Cart, Buy Now, Book Now
    fontWeight: '600',
    lineHeight: 16,
  },
  buttonMedium: {
    fontSize: 14, // Secondary actions, filters
    fontWeight: '600',
    lineHeight: 14,
  },
  buttonSmall: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 13,
  },
  search: {
    fontSize: 16, // iOS auto-zoom prevention (never below 16px)
    fontWeight: '400',
    lineHeight: 24, // 16 * 1.5
  },
  bottomNav: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 10,
  },
  caption: {
    fontSize: 12, // Timestamps, "sold by", labels
    fontWeight: '400',
    lineHeight: 16.8, // 12 * 1.4
  },
  overline: {
    fontSize: 11, // Category tags, status chips (ALL CAPS)
    fontWeight: '600',
    lineHeight: 11,
  },

  // Compatibility Mappings for existing component styles
  button: {
    fontSize: 16,
    fontWeight: '600',
  }
};

export default typography;
