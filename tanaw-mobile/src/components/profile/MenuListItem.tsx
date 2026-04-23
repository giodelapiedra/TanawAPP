import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  hint?: string;
  destructive?: boolean;
  isLast?: boolean;
}

export default function MenuListItem({
  icon, label, onPress, hint, destructive, isLast,
}: Props) {
  const tint = destructive ? COLORS.DANGER : COLORS.PRIMARY;
  const labelColor = destructive ? COLORS.DANGER : COLORS.GRAY_900;

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.iconWrap, { backgroundColor: destructive ? COLORS.DANGER_LIGHT : COLORS.PRIMARY_LIGHT }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.GRAY_300} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_50,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  textCol: { flex: 1, marginLeft: 12 },
  label: { fontSize: 14, fontWeight: '700' },
  hint: { color: COLORS.GRAY_500, fontSize: 11, marginTop: 2 },
});
