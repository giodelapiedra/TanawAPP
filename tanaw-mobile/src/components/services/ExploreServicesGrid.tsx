import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { ExploreCategory } from '../../constants/services';

interface Props {
  items: ExploreCategory[];
  onItemPress: (item: ExploreCategory) => void;
  onViewAllPress?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PADDING = 16;
const GAP = 10;
const TILE_WIDTH_FULL = SCREEN_WIDTH - H_PADDING * 2;
const TILE_WIDTH_HALF = (TILE_WIDTH_FULL - GAP) / 2;

export default function ExploreServicesGrid({ items, onItemPress, onViewAllPress }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleBar} />
          <Text style={styles.title}>Explore Services</Text>
        </View>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress} hitSlop={8} style={styles.viewAllBtn}>
            <Text style={styles.viewAll}>View all services</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.GRAY_500} />
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No matching categories</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((item) =>
            item.featured ? (
              <TouchableOpacity
                key={item.key}
                style={styles.featuredTile}
                onPress={() => onItemPress(item)}
                activeOpacity={0.85}
              >
                <View style={[styles.featuredIcon, { backgroundColor: item.tint }]}>
                  <Ionicons name={item.icon} size={30} color={item.iconColor} />
                </View>
                <View style={styles.featuredCopy}>
                  <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.featuredSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.GRAY_300} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={item.key}
                style={styles.tile}
                onPress={() => onItemPress(item)}
                activeOpacity={0.85}
              >
                <View style={[styles.tileIconBox, { backgroundColor: item.tint }]}>
                  <Ionicons name={item.icon} size={22} color={item.iconColor} />
                </View>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    marginBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleBar: { width: 3, height: 14, backgroundColor: COLORS.PRIMARY, borderRadius: 2 },
  title: { color: COLORS.GRAY_900, fontSize: 15, fontWeight: '800' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAll: { color: COLORS.GRAY_500, fontSize: 12, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: H_PADDING,
  },

  // Regular (half width) tile
  tile: {
    width: TILE_WIDTH_HALF,
    padding: 12,
    borderRadius: RADIUS.lg,
    minHeight: 122,
    gap: 6,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  tileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: { color: COLORS.GRAY_900, fontSize: 13, fontWeight: '800' },
  subtitle: { color: COLORS.GRAY_500, fontSize: 11, lineHeight: 15 },

  // Featured (full width) tile
  featuredTile: {
    width: TILE_WIDTH_FULL,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  featuredIcon: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  featuredCopy: { flex: 1, gap: 2 },
  featuredName: { color: COLORS.GRAY_900, fontSize: 14, fontWeight: '800' },
  featuredSubtitle: { color: COLORS.GRAY_500, fontSize: 11, lineHeight: 15 },

  empty: { paddingHorizontal: H_PADDING, paddingVertical: 18, alignItems: 'center' },
  emptyText: { color: COLORS.GRAY_500, fontSize: 12 },
});
