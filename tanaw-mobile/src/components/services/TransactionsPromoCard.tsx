import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

interface Props {
  activeCount: number;
  onPress: () => void;
}

export default function TransactionsPromoCard({ activeCount, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`View ${activeCount} active transaction requests`}
    >
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Request tracker</Text>
        <Text style={styles.title}>My Transactions</Text>
        <Text style={styles.subtitle}>Check pending forms, payments, and appointment updates.</Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>View Transactions</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.WHITE} />
        </View>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeNumber}>{activeCount}</Text>
        <Text style={styles.badgeLabel}>Active{'\n'}Requests</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  copy: { flex: 1, gap: 6 },
  eyebrow: { color: COLORS.PRIMARY, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { color: COLORS.GRAY_900, fontSize: 16, fontWeight: '800' },
  subtitle: { color: COLORS.GRAY_500, fontSize: 12, lineHeight: 17 },
  cta: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  ctaText: { color: COLORS.WHITE, fontSize: 12, fontWeight: '700' },
  badge: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.GRAY_100,
  },
  badgeNumber: { color: COLORS.PRIMARY, fontSize: 26, fontWeight: '900' },
  badgeLabel: { color: COLORS.GRAY_500, fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 2, lineHeight: 12 },
});
