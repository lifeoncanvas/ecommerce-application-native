import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { typography, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  loading,
  disabled,
  style,
  textStyle,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'ghost':
        return styles.ghost;
      case 'danger':
        return styles.danger;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'ghost':
        return styles.textGhost;
      case 'danger':
        return styles.textDanger;
      case 'primary':
      default:
        return styles.textPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'medium':
        return styles.sizeMedium;
      case 'small':
        return styles.sizeSmall;
      case 'large':
      default:
        return styles.sizeLarge;
    }
  };

  const getLabelFont = () => {
    switch (size) {
      case 'medium':
        return styles.labelMedium;
      case 'small':
        return styles.labelSmall;
      case 'large':
      default:
        return styles.labelLarge;
    }
  };

  // Ensure tap target is at least 48x48px on mobile for accessibility
  const hitSlopValue = size === 'small' ? 8 : size === 'medium' ? 4 : 0;
  const hitSlop = hitSlopValue
    ? { top: hitSlopValue, bottom: hitSlopValue, left: hitSlopValue, right: hitSlopValue }
    : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      hitSlop={hitSlop}
      style={[
        styles.base,
        getSizeStyle(),
        getVariantStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.blue500Alt} />
      ) : (
        <Text style={[styles.text, getLabelFont(), getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const getStyles = (colors) => StyleSheet.create({
  base: {
    borderRadius: radius.r8, // 8px on all buttons
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  // Variants
  primary: {
    backgroundColor: colors.blue500Alt || '#2952CC', // Blue 500Alt
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.blue500Alt || '#2952CC',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error || '#DC2626',
  },
  disabled: {
    opacity: 0.5,
  },
  // Sizes
  sizeLarge: {
    height: 48, // 48px min
  },
  sizeMedium: {
    height: 40,
  },
  sizeSmall: {
    height: 32,
  },
  // Text Styles
  text: {
    fontFamily: 'PlusJakartaSans-Bold',
  },
  labelLarge: {
    fontSize: 16, // Inter 16px 600
  },
  labelMedium: {
    fontSize: 14, // Inter 14px 600
  },
  labelSmall: {
    fontSize: 13, // Inter 13px 600
  },
  textPrimary: {
    color: colors.white,
  },
  textSecondary: {
    color: colors.blue500Alt || '#2952CC',
  },
  textGhost: {
    color: colors.blue500Alt || '#2952CC',
  },
  textDanger: {
    color: colors.white,
  },
});
