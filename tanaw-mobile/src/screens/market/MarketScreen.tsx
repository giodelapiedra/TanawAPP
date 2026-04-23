import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

const FEATURES: { name: string; icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }[] = [
  { name: 'Buy & Sell', icon: 'pricetag-outline', bg: COLORS.SUCCESS_LIGHT, color: COLORS.SUCCESS },
  { name: 'Local Products', icon: 'basket-outline', bg: COLORS.ORANGE_LIGHT, color: COLORS.ORANGE },
  { name: 'Food & Goods', icon: 'fast-food-outline', bg: COLORS.PRIMARY_LIGHT, color: COLORS.PRIMARY },
  { name: 'Post Items', icon: 'add-circle-outline', bg: COLORS.BLUE_LIGHT, color: COLORS.BLUE },
];

export default function MarketScreen() {
  return (
    <View style={styles.root}>
      <SafeAreaView >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Ionicons name="storefront-outline" size={20} color={COLORS.WHITE} />
            <Text style={styles.headerTitle}>Marketplace</Text>
          </View>
          <Text style={styles.headerSub}>Buy & sell locally in Tanauan</Text>
        </View>
      </SafeAreaView>
      <View style={styles.center}>
        <View style={styles.bigIconBox}>
          <Ionicons name="storefront-outline" size={32} color={COLORS.PRIMARY} />
        </View>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.desc}>The local marketplace will be available in Phase 3 of TANAW One App!</Text>
        <View style={styles.grid}>
          {FEATURES.map((f) => (
            <View key={f.name} style={styles.chip}>
              <View style={[styles.chipIconBox, { backgroundColor: f.bg }]}>
                <Ionicons name={f.icon} size={20} color={f.color} />
              </View>
              <Text style={styles.chipName}>{f.name}</Text>
            </View>
          ))}
        </View>
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseBadgeText}>Coming in Phase 3</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  header: { backgroundColor: COLORS.PRIMARY, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: COLORS.WHITE, fontSize: 20, fontWeight: '700' },
  headerSub: { color: COLORS.WHITE, fontSize: 12, opacity: 0.7 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  bigIconBox: { width: 64, height: 64, borderRadius: 18, backgroundColor: COLORS.PRIMARY_LIGHT, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { color: COLORS.GRAY_900, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  desc: { color: COLORS.GRAY_500, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  chip: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.md, padding: 14, borderWidth: 1, borderColor: COLORS.GRAY_100, width: '46%', alignItems: 'center' },
  chipIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  chipName: { color: COLORS.GRAY_700, fontSize: 12, fontWeight: '600' },
  phaseBadge: { backgroundColor: COLORS.PRIMARY_LIGHT, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 24 },
  phaseBadgeText: { color: COLORS.PRIMARY, fontSize: 13, fontWeight: '700' },
});
