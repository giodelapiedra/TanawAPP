import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { CityHighlight, HighlightCategory } from '../../constants/cityHighlights';

interface Props {
  items: CityHighlight[];
  onItemPress?: (item: CityHighlight) => void;
  onSeeAllPress?: () => void;
}

const CARD_WIDTH = 220;
const IMAGE_HEIGHT = 130;

const CATEGORY_COLOR: Record<HighlightCategory, string> = {
  NEWS: COLORS.PRIMARY,
  EVENT: COLORS.SUCCESS,
  ANNOUNCEMENT: COLORS.BLUE,
};

export default function CityHighlights({ items, onItemPress, onSeeAllPress }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBubble}>
            <Ionicons name="megaphone" size={18} color={COLORS.PRIMARY} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>City Highlights</Text>
            <Text style={styles.subtitle}>Stay informed with the latest news and updates.</Text>
          </View>
        </View>
        {onSeeAllPress && (
          <TouchableOpacity onPress={onSeeAllPress} hitSlop={8}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => onItemPress?.(item)}
            activeOpacity={0.85}
          >
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
              {item.category && (
                <View style={[styles.badge, { backgroundColor: CATEGORY_COLOR[item.category] }]}>
                  <Text style={styles.badgeText}>{item.category}</Text>
                </View>
              )}
            </View>
            <View style={styles.body}>
              <Text style={styles.cardTitle} numberOfLines={3}>{item.title}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBubble: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },
  headerText: { flex: 1 },
  title: { color: COLORS.GRAY_900, fontSize: 15, fontWeight: '800' },
  subtitle: { color: COLORS.GRAY_500, fontSize: 11, marginTop: 1 },
  seeAll: { color: COLORS.PRIMARY, fontSize: 12, fontWeight: '700' },

  scroll: { paddingHorizontal: 10, gap: 10 },
  card: {
    width: CARD_WIDTH,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
    overflow: 'hidden',
    marginRight: 2,
  },
  imageWrap: { width: '100%', height: IMAGE_HEIGHT, backgroundColor: COLORS.GRAY_100 },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    bottom: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: { color: COLORS.WHITE, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  body: { padding: 10, gap: 6 },
  cardTitle: { color: COLORS.GRAY_900, fontSize: 12, fontWeight: '700', lineHeight: 16 },
  cardDate: { color: COLORS.GRAY_500, fontSize: 11, fontWeight: '500' },
});
