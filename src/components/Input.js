import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

export default function Input({ label, error, disabled, style, ...props }) {
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.grey400}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  wrapper: {
    marginBottom: spacing.space4, // 16px (standard spacing)
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: spacing.space1, // 4px gap
  },
  input: {
    height: 48, // Standard input height
    borderWidth: 1,
    borderColor: colors.grey200, // Grey 200 border
    borderRadius: radius.r8, // 8px border radius
    paddingHorizontal: spacing.space4, // 16px padding
    fontSize: 16, // Search/Input min 16px to prevent iOS auto-zoom
    fontFamily: 'Inter',
    color: colors.textPrimary,
    backgroundColor: colors.grey50, // Grey 50 fill
  },
  inputFocused: {
    backgroundColor: colors.white, // White fill
    borderColor: colors.blue500Alt || '#2952CC', // Blue 500 border (2px)
    borderWidth: 2,
  },
  inputError: {
    backgroundColor: colors.white, // White fill
    borderColor: colors.error, // Error red border
  },
  inputDisabled: {
    backgroundColor: colors.grey50, // Grey 50 fill
    borderColor: colors.grey200, // Grey 200 border
    color: colors.grey400, // Grey 400 text
    opacity: 0.8,
  },
  errorText: {
    fontSize: 13, // Error message below field in Error red at 13px
    fontFamily: 'Inter',
    color: colors.error,
    marginTop: spacing.space1, // 4px gap
  },
});
