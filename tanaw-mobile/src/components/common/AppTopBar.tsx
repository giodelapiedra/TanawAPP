import React, { ReactNode } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { formatBadgeCount } from '../../utils/format-badge.util';
import BrandAccent from './BrandAccent';

interface Props {
  /** Optional search icon handler. When omitted, the search button is hidden. */
  onSearchPress?: () => void;
  /** Optional bell handler. When omitted, the bell is hidden. */
  onNotificationPress?: () => void;
  /** Unread notifications count — renders a badge on the bell when > 0. */
  unreadCount?: number;
  /** Optional slot rendered below the brand row (e.g., Public/Community tabs on Home). */
  children?: ReactNode;
  /** When true, rounds the bottom corners so content below can overlap cleanly. */
  bottomRounded?: boolean;
  /** Extra padding at the bottom — useful when the next element overlaps upward. */
  extraBottomPadding?: number;
}

/**
 * Canonical top bar shared across tab screens (Home, Services, …).
 *
 * Renders: red brand background + gold accent + Tanauan seal + "TANAW One Super App"
 * + optional search/bell actions + optional children slot for tab-specific controls.
 *
 * To keep the header consistent, do NOT recreate this structure inside a screen —
 * always compose with this component and pass slots via props/children.
 */
export default function AppTopBar({
  onSearchPress,
  onNotificationPress,
  unreadCount = 0,
  children,
  bottomRounded = false,
  extraBottomPadding = 0,
}: Props) {
  return (
    <View
      style={[
        styles.wrap,
        bottomRounded && styles.wrapRounded,
        extraBottomPadding > 0 && { paddingBottom: extraBottomPadding },
      ]}
    >
      <BrandAccent />
      <SafeAreaView edges={['top']}>
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../../assets/TANAUAN SEAL.png')}
              style={styles.seal}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.title}>TANAW One Super App</Text>
              <Text style={styles.subtitle}>CITY OF TANAUAN</Text>
            </View>
          </View>

          <View style={styles.actions}>
            {onSearchPress && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onSearchPress}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Search"
              >
                <Ionicons name="search-outline" size={20} color={COLORS.WHITE} />
              </TouchableOpacity>
            )}
            {onNotificationPress && (
              <TouchableOpacity
                style={styles.iconBtn}
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
        </View>

        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.PRIMARY,
    paddingBottom: 4,
    overflow: 'hidden',
  },
  wrapRounded: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  seal: { width: 32, height: 32, borderRadius: 16 },
  title: { color: COLORS.WHITE, fontSize: 16, fontWeight: '800' },
  subtitle: { color: COLORS.WHITE, fontSize: 9, opacity: 0.65, letterSpacing: 1.5 },
  actions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 30, height: 30,
    justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4, right: -4,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.DANGER,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5, borderColor: COLORS.PRIMARY,
  },
  badgeText: { color: COLORS.WHITE, fontSize: 9, fontWeight: '700' },
});
