import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { formatBadgeCount } from '../../utils/format-badge.util';
import BrandAccent from '../common/BrandAccent';

interface Props {
  onNotificationPress?: () => void;
  unreadCount?: number;
}

/**
 * Polished brand hero for the Services tab.
 *
 * Red primary background with layered gold brand accents + seal + large title.
 * Rounded bottom corners + extra padding let the search card overlap cleanly.
 */
export default function ServicesHero({ onNotificationPress, unreadCount = 0 }: Props) {
  return (
    <View style={styles.wrap}>
      {/* Decorative layers (painted behind everything) */}
      <BrandAccent />
      <View style={[styles.orb, styles.orbLeft]} />
      <View style={[styles.orb, styles.orbRight]} />
      <View style={styles.waveStripe} />

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
              <Text style={styles.title}>City Services</Text>
              <Text style={styles.subtitle}>Your city, one app away.</Text>
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
              <Ionicons name="notifications" size={20} color={COLORS.PRIMARY} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{formatBadgeCount(unreadCount)}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const HERO_HEIGHT = 110;
const EXTRA_BOTTOM = 56;

const styles = StyleSheet.create({
  wrap: {
    height: HERO_HEIGHT + EXTRA_BOTTOM,
    backgroundColor: COLORS.PRIMARY,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },

  // Decorative shapes — all absolute-positioned, non-interactive
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.PRIMARY_DARK,
    opacity: 0.6,
  },
  orbLeft: {
    width: 140, height: 140,
    top: -60, left: -70,
  },
  orbRight: {
    width: 160, height: 160,
    bottom: -90, right: -60,
    opacity: 0.45,
  },
  waveStripe: {
    position: 'absolute',
    left: -40, right: -40, bottom: 38,
    height: 10,
    backgroundColor: COLORS.GOLD,
    opacity: 0.18,
    transform: [{ rotate: '-4deg' }],
    borderRadius: 8,
  },

  safe: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  brandCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  seal: { width: 48, height: 48 },

  titleBlock: { flex: 1, gap: 2 },
  eyebrow: {
    color: COLORS.GOLD,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: COLORS.WHITE,
    fontSize: 11,
    opacity: 0.85,
  },

  bellBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.18)',
  },
  badge: {
    position: 'absolute',
    top: -3, right: -3,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.GOLD,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2, borderColor: COLORS.WHITE,
  },
  badgeText: { color: COLORS.GRAY_900, fontSize: 10, fontWeight: '800' },
});
