import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

export interface CitizenAction {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  onPress: () => void;
}

interface Props {
  actions: CitizenAction[];
}

export default function CitizenActionPanel({ actions }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Citizen shortcuts</Text>
          <Text style={styles.title}>What do you need today?</Text>
        </View>
        <View style={styles.statusPill}>
          <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.SUCCESS} />
          <Text style={styles.statusText}>Verified</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={styles.action}
            onPress={action.onPress}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={action.title}
          >
            <View style={[styles.iconBox, { backgroundColor: action.bg }]}>
              <Ionicons name={action.icon} size={22} color={action.color} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.actionTitle} numberOfLines={2}>{action.title}</Text>
              <Text style={styles.actionSub} numberOfLines={2}>{action.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  eyebrow: {
    color: COLORS.PRIMARY,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    color: COLORS.GRAY_900,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 3,
  },
  statusPill: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.SUCCESS_LIGHT,
  },
  statusText: {
    color: COLORS.SUCCESS,
    fontSize: 11,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  action: {
    width: '48.4%',
    minHeight: 116,
    padding: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.SURFACE_MUTED,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  copy: { flex: 1 },
  actionTitle: {
    color: COLORS.GRAY_900,
    fontSize: 13,
    fontWeight: '800',
  },
  actionSub: {
    color: COLORS.GRAY_500,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },
});
