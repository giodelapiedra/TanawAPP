import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, Keyboard, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

export interface DropdownOption {
  label: string;
  value: string;
}

interface Props {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: string;
  onSelect: (value: string) => void;
  error?: string;
  style?: ViewStyle;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function Dropdown({
  label, placeholder = 'Select...', options, value, onSelect,
  error, style, searchable, searchPlaceholder = 'Search...',
}: Props) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selected = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const open = () => {
    Keyboard.dismiss();
    setSearch('');
    setVisible(true);
  };

  const handleSelect = (val: string) => {
    onSelect(val);
    setVisible(false);
    setSearch('');
  };

  const close = () => {
    setVisible(false);
    setSearch('');
  };

  const borderColor = error ? COLORS.DANGER : COLORS.GRAY_100;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Trigger */}
      <TouchableOpacity style={[styles.trigger, { borderColor }]} onPress={open} activeOpacity={0.7}>
        <Text style={[styles.triggerText, !selected && styles.placeholder]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.GRAY_500} />
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Bottom Sheet */}
      <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
        <View style={styles.overlay}>
          {/* Backdrop — tap to close */}
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close} />

          {/* Sheet */}
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{label ?? 'Select'}</Text>

            {/* Search */}
            {searchable && (
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={16} color={COLORS.GRAY_500} />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={COLORS.GRAY_300}
                  autoCorrect={false}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={16} color={COLORS.GRAY_300} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No results found</Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={18} color={COLORS.PRIMARY} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { color: COLORS.GRAY_500, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  trigger: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.WHITE, borderWidth: 1.5, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 14 },
  triggerText: { flex: 1, fontSize: 14, color: COLORS.GRAY_900 },
  placeholder: { color: COLORS.GRAY_300 },
  error: { color: COLORS.DANGER, fontSize: 11, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: COLORS.OVERLAY, justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheet: { backgroundColor: COLORS.WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 34 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.GRAY_300, alignSelf: 'center', marginTop: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: COLORS.GRAY_900, paddingHorizontal: 20, paddingVertical: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 8, backgroundColor: COLORS.GRAY_50, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.GRAY_900, marginLeft: 8, padding: 0 },
  list: { paddingHorizontal: 8 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, marginHorizontal: 4, borderRadius: RADIUS.sm },
  optionSelected: { backgroundColor: COLORS.PRIMARY_LIGHT },
  optionText: { flex: 1, fontSize: 15, color: COLORS.GRAY_900 },
  optionTextSelected: { color: COLORS.PRIMARY, fontWeight: '600' },
  emptyBox: { padding: 20, alignItems: 'center' },
  emptyText: { color: COLORS.GRAY_300, fontSize: 14 },
});
