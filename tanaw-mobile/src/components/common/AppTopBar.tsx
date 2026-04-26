import React, { ReactNode } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { formatBadgeCount } from '../../utils/format-badge.util';
import BrandAccent from './BrandAccent';

interface Props {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  unreadCount?: number;
  children?: ReactNode;
  bottomRounded?: boolean;
  extraBottomPadding?: number;
}

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
            <View style={styles.brandCopy}>
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
    paddingBottom: 8,
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
    paddingBottom: 2,
    gap: 12,
  },
  brandRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandCopy: { flex: 1 },
  seal: { width: 38, height: 38, borderRadius: 19 },
  title: { color: COLORS.WHITE, fontSize: 16, fontWeight: '800' },
  subtitle: { color: COLORS.WHITE, fontSize: 10, opacity: 0.78, letterSpacing: 1.2, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.DANGER,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
  },
  badgeText: { color: COLORS.WHITE, fontSize: 9, fontWeight: '700' },
});
