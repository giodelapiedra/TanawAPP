import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const VARIANT_STYLES = {
  primary: { bg: COLORS.PRIMARY, text: COLORS.WHITE, border: COLORS.PRIMARY, indicator: COLORS.WHITE },
  outline: { bg: 'transparent', text: COLORS.PRIMARY, border: COLORS.PRIMARY, indicator: COLORS.PRIMARY },
  ghost: { bg: 'transparent', text: COLORS.PRIMARY, border: 'transparent', indicator: COLORS.PRIMARY },
  danger: { bg: COLORS.DANGER, text: COLORS.WHITE, border: COLORS.DANGER, indicator: COLORS.WHITE },
} as const;

const SIZE_STYLES = {
  sm: { pv: 8, ph: 14, fs: 12, r: RADIUS.sm },
  md: { pv: 13, ph: 20, fs: 14, r: RADIUS.md },
  lg: { pv: 16, ph: 24, fs: 16, r: 14 },
} as const;

export default function Button({
  title, onPress, variant = 'primary', size = 'md',
  isLoading, disabled, fullWidth, style,
}: Props) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderRadius: s.r,
          paddingVertical: s.pv,
          paddingHorizontal: s.ph,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={v.indicator} size="small" />
      ) : (
        <Text style={[styles.text, { color: v.text, fontSize: s.fs }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  fullWidth: { width: '100%' },
  text: { fontWeight: '700' },
});
