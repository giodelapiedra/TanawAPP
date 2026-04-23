import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

export type PromoVariant = 'danger' | 'info';

interface Props {
  variant: PromoVariant;
  title: string;
  subtitle: string;
  ctaLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const VARIANT_STYLES: Record<PromoVariant, { bg: string; accent: string }> = {
  danger: { bg: COLORS.PRIMARY, accent: COLORS.GOLD },
  info: { bg: COLORS.BLUE, accent: COLORS.WHITE },
};

export default function PromoCard({ variant, title, subtitle, ctaLabel, icon, onPress }: Props) {
  const v = VARIANT_STYLES[variant];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: v.bg }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color={v.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
      <View style={styles.cta}>
        <Text style={[styles.ctaText, { color: v.bg }]}>{ctaLabel}</Text>
        <Ionicons name="chevron-forward" size={13} color={v.bg} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    borderRadius: RADIUS.lg,
    gap: 6,
    minHeight: 160,
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  title: { color: COLORS.WHITE, fontSize: 16, fontWeight: '800' },
  subtitle: { color: COLORS.WHITE, fontSize: 11, lineHeight: 15, opacity: 0.9 },
  cta: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  ctaText: { fontSize: 12, fontWeight: '700' },
});
