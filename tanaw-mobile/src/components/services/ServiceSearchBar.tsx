import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS, FONT_SIZE } from '../../constants/spacing';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export default function ServiceSearchBar({
  value,
  onChangeText,
  placeholder = 'Search Services like Documents',
  onSubmit,
}: Props) {
  const showClear = value.length > 0;

  return (
    <View style={styles.wrapper}>
      <Ionicons name="search" size={18} color={COLORS.GRAY_500} style={styles.iconLeft} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.GRAY_300}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {showClear ? (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={18} color={COLORS.GRAY_300} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iconLeft: { marginRight: 8 },
  input: { flex: 1, fontSize: FONT_SIZE.base, color: COLORS.GRAY_900, padding: 0 },
});
