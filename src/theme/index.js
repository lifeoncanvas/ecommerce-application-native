import colors from './colors';
import typography from './typography';

export { colors, typography };

// Spacing scale according to HTTN Brand Style Guide
export const spacing = {
  space1: 4,   // Tight internal padding, icon gaps
  space2: 8,   // Small component padding
  space3: 12,  // Medium gaps between related elements
  space4: 16,  // Standard padding inside cards and inputs
  space6: 24,  // Gap between components in a section
  space8: 32,  // Gap between sections
  space12: 48, // Large section padding
  space16: 64, // Page-level vertical rhythm

  // Compatibility Mappings
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Border radius specifications according to HTTN Brand Style Guide
export const radius = {
  r4: 4,   // Small badges, tags, chips
  r8: 8,   // Buttons, input fields, small cards
  r12: 12, // Product cards, modal containers
  r16: 16, // Large feature cards, bottom sheets on mobile
  pill: 999,

  // Compatibility Mappings
  sm: 4,
  md: 8,
  lg: 12,
};
