import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { formatBadgeCount } from '../../utils/format-badge.util';
import BrandAccent from '../common/BrandAccent';

interface Props {
  onNotificationPress?: () => void;
  unreadCount?: number;
}

export default function ServicesHero({ onNotificationPress, unreadCount = 0 }: Props) {
  return (
    <View style={styles.wrap}>
      <BrandAccent />

      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.topRow}>
          <View style={styles.brandCluster}>
            <Image
              source={require('../../../assets/TANAUAN SEAL.png')}
              style={styles.seal}
              resizeMode="contain"
            />
            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>CITY OF TANAUAN</Text>
              <Text style={styles.title}>Government Services</Text>
              <Text style={styles.subtitle}>Permits, records, appointments and requests</Text>
            </View>
          </View>

          {onNotificationPress && (
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={onNotificationPress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={20} color={COLORS.WHITE} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{formatBadgeCount(unreadCount)}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.WHITE} />
            <Text style={styles.summaryText}>Track requests</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.WHITE} />
            <Text style={styles.summaryText}>Official city portal</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const HERO_HEIGHT = 128;
const EXTRA_BOTTOM = 56;

const styles = StyleSheet.create({
  wrap: {
    height: HERO_HEIGHT + EXTRA_BOTTOM,
    backgroundColor: COLORS.PRIMARY,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  safe: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  brandCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  seal: { width: 48, height: 48 },
  titleBlock: { flex: 1, gap: 2 },
  eyebrow: {
    color: COLORS.GOLD,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 21,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.WHITE,
    fontSize: 12,
    opacity: 0.86,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  badgeText: { color: COLORS.GRAY_900, fontSize: 10, fontWeight: '800' },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  summaryText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.24)',
    marginHorizontal: 10,
  },
});
