import React, { useState, ReactNode } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, KeyboardTypeOptions } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, FONT_SIZE } from '../../constants/spacing';

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  style?: ViewStyle;
}

export default function Input({
  label, placeholder, value, onChangeText, error,
  secureTextEntry, keyboardType, autoCapitalize,
  leftIcon, rightIcon, multiline, numberOfLines,
  editable = true, style,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error ? COLORS.DANGER : isFocused ? COLORS.PRIMARY : COLORS.GRAY_100;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, { borderColor }]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.GRAY_300}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { color: COLORS.GRAY_500, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.WHITE, borderWidth: 1.5, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 13 },
  input: { flex: 1, fontSize: FONT_SIZE.base, color: COLORS.GRAY_900, padding: 0 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  error: { color: COLORS.DANGER, fontSize: 11, marginTop: 4 },
});
