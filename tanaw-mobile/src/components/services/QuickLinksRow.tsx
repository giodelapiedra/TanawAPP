import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { QuickLink } from '../../constants/services';

interface Props {
  items: QuickLink[];
  onItemPress: (item: QuickLink) => void;
}

export default function QuickLinksRow({ items, onItemPress }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Links</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => onItemPress(item)}
            style={styles.pill}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={14} color={item.iconColor} />
            </View>
            <Text style={styles.label}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.GRAY_300} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4 },
  header: { paddingHorizontal: 16, marginBottom: 10 },
  title: { color: COLORS.GRAY_900, fontSize: 14, fontWeight: '700' },
  scroll: { paddingHorizontal: 12, gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
    marginHorizontal: 2,
  },
  iconBox: {
    width: 26, height: 26, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  label: { color: COLORS.GRAY_900, fontSize: 13, fontWeight: '700' },
});
