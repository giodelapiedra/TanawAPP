import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { QuickAction } from '../../constants/services';

interface Props {
  items: QuickAction[];
  onItemPress: (item: QuickAction) => void;
  onViewAllPress?: () => void;
}

// ── Slider geometry ────────────────────────────────────────────
// Tile width is computed so two full tiles + a peek of a third are visible
// on a typical phone screen. The peek is the affordance: it tells the user
// the row scrolls horizontally even before they touch it.
const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PADDING = 16;
const GAP = 12;
const TILE_WIDTH = Math.round((SCREEN_WIDTH - H_PADDING * 2 - GAP * 2.5) / 2.3);
const SNAP_INTERVAL = TILE_WIDTH + GAP;

export default function QuickActionsTiles({ items, onItemPress, onViewAllPress }: Props) {
  const listRef = useRef<FlatList<QuickAction>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Page dots only make sense when the row actually overflows. With ≤2 items
  // the slider doesn't scroll, so we hide the indicator entirely.
  const showDots = items.length > 2;

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SNAP_INTERVAL);
    if (idx !== activeIndex) setActiveIndex(idx);
  }, [activeIndex]);

  const renderItem = useCallback(({ item }: { item: QuickAction }) => (
    <TouchableOpacity
      onPress={() => onItemPress(item)}
      style={[styles.tile, { width: TILE_WIDTH }]}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      accessibilityHint={item.subtitle}
    >
      <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={26} color={item.iconColor} />
      </View>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>
    </TouchableOpacity>
  ), [onItemPress]);

  const keyExtractor = useCallback((item: QuickAction) => item.key, []);

  // Number of "snap positions" — how many distinct dots to render.
  // Last position lands the rightmost tile, so we have items.length - 1
  // possible offsets when there's overflow.
  const dotCount = useMemo(() => Math.max(1, items.length - 1), [items.length]);

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
        <>
          <FlatList
            ref={listRef}
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={Separator}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            snapToAlignment="start"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />

          {showDots && (
            <View style={styles.dotsRow}>
              {Array.from({ length: dotCount }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === Math.min(activeIndex, dotCount - 1) && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

function Separator() {
  return <View style={{ width: GAP }} />;
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

  listContent: {
    paddingHorizontal: H_PADDING,
    // Right padding adds a little tail so the rightmost tile can fully snap
    // into view without sitting flush against the screen edge.
    paddingRight: H_PADDING + GAP,
  },
  tile: {
    minHeight: 132,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: 6,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { color: COLORS.GRAY_900, fontSize: 13, fontWeight: '800' },
  subtitle: { color: COLORS.GRAY_500, fontSize: 11, lineHeight: 15 },

  empty: { paddingHorizontal: H_PADDING, paddingVertical: 18, alignItems: 'center' },
  emptyText: { color: COLORS.GRAY_500, fontSize: 12 },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.GRAY_100,
  },
  dotActive: {
    width: 18,
    backgroundColor: COLORS.PRIMARY,
  },
});
