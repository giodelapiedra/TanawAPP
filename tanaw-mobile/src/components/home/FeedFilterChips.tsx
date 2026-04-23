import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

export type FeedFilter = 'ALL' | 'NEWS' | 'EVENTS' | 'ANNOUNCEMENTS';

interface ChipDef {
  key: FeedFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CHIPS: ChipDef[] = [
  { key: 'ALL', label: 'All Posts', icon: 'grid-outline' },
  { key: 'NEWS', label: 'News', icon: 'newspaper-outline' },
  { key: 'EVENTS', label: 'Events', icon: 'calendar-outline' },
  { key: 'ANNOUNCEMENTS', label: 'Announcements', icon: 'megaphone-outline' },
];

interface Props {
  value: FeedFilter;
  onChange: (filter: FeedFilter) => void;
}

export default function FeedFilterChips({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {CHIPS.map((chip) => {
        const isActive = chip.key === value;
        return (
          <TouchableOpacity
            key={chip.key}
            onPress={() => onChange(chip.key)}
            style={[styles.chip, isActive && styles.chipActive]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={chip.icon}
              size={14}
              color={isActive ? COLORS.WHITE : COLORS.GRAY_700}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 8, paddingVertical: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.GRAY_50,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
  },
  chipActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  label: { color: COLORS.GRAY_700, fontSize: 12, fontWeight: '700' },
  labelActive: { color: COLORS.WHITE },
});
