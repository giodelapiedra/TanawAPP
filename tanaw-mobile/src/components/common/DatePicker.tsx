import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import Dropdown from './Dropdown';

interface Props {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  error?: string;
  style?: ViewStyle;
}

const MONTHS = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

const DAYS = Array.from({ length: 31 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1).padStart(2, '0'),
}));

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => {
  const y = String(currentYear - 10 - i);
  return { label: y, value: y };
});

export default function DatePicker({ label, value, onChange, error, style }: Props) {
  const parts = value ? value.split('-') : ['', '', ''];
  const year = parts[0] || '';
  const month = parts[1] || '';
  const day = parts[2] || '';

  const update = (y: string, m: string, d: string) => {
    if (y && m && d) {
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange([y, m, d].join('-'));
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <View style={styles.monthCol}>
          <Dropdown
            placeholder="Month"
            options={MONTHS}
            value={month}
            onSelect={(v) => update(year, v, day)}
            style={styles.noMargin}
          />
        </View>
        <View style={styles.dayCol}>
          <Dropdown
            placeholder="Day"
            options={DAYS}
            value={day}
            onSelect={(v) => update(year, month, v)}
            style={styles.noMargin}
          />
        </View>
        <View style={styles.yearCol}>
          <Dropdown
            placeholder="Year"
            options={YEARS}
            value={year}
            onSelect={(v) => update(v, month, day)}
            style={styles.noMargin}
          />
        </View>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { color: COLORS.GRAY_500, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  row: { flexDirection: 'row' },
  monthCol: { flex: 3, marginRight: 6 },
  dayCol: { flex: 2, marginRight: 6 },
  yearCol: { flex: 2 },
  noMargin: { marginBottom: 0 },
  error: { color: COLORS.DANGER, fontSize: 11, marginTop: 4 },
});
