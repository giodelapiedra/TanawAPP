import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { QuickAction } from '../../constants/services';

interface Props {
  items: QuickAction[];
  onItemPress: (item: QuickAction) => void;
  onViewAllPress?: () => void;
}

export default function QuickActionsTiles({ items, onItemPress, onViewAllPress }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleBar} />
          <Text style={styles.title}>What would you like to do?</Text>
        </View>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress} hitSlop={8} style={styles.viewAllBtn}>
            <Text style={styles.viewAll}>View all</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.GRAY_500} />
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No matching actions</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => onItemPress(item)}
              style={styles.tile}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={30} color={item.iconColor} />
              </View>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const TILE_WIDTH = 86;
const ICON_SIZE = 68;

const styles = StyleSheet.create({
  wrap: { marginTop: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleBar: { width: 3, height: 14, backgroundColor: COLORS.PRIMARY, borderRadius: 2 },
  title: { color: COLORS.GRAY_900, fontSize: 15, fontWeight: '800' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAll: { color: COLORS.GRAY_500, fontSize: 12, fontWeight: '600' },
  scroll: { paddingHorizontal: 12, gap: 4 },
  tile: { width: TILE_WIDTH, alignItems: 'center', paddingVertical: 6, marginHorizontal: 2 },
  iconBox: {
    width: ICON_SIZE, height: ICON_SIZE, borderRadius: RADIUS.lg,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  name: { color: COLORS.GRAY_900, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: COLORS.GRAY_500, fontSize: 10, textAlign: 'center', marginTop: 2, lineHeight: 13 },
  empty: { paddingHorizontal: 16, paddingVertical: 18, alignItems: 'center' },
  emptyText: { color: COLORS.GRAY_500, fontSize: 12 },
});
