import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

interface Props {
  fullName: string;
  phone: string;
  email: string;
  tanawId: string;
  photoUrl?: string | null;
  photoVersion?: string | null;
  initials: string;
  onEditPhoto?: () => void;
  isUploading?: boolean;
  /** Optional social stats shown below the email. Omit both to hide the row. */
  followerCount?: number | null;
  followingCount?: number | null;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
}

const fmtCount = (n: number | null | undefined): string =>
  n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}k` : String(n);

export default function AccountHeaderCard({
  fullName, phone, email, tanawId, photoUrl, photoVersion, initials, onEditPhoto, isUploading,
  followerCount, followingCount, onFollowersPress, onFollowingPress,
}: Props) {
  const showStats =
    followerCount !== undefined || followingCount !== undefined;
  return (
    <View style={styles.wrap}>
      <SafeAreaView edges={['top']}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Image
              source={require('../../../assets/TANAUAN SEAL.png')}
              style={styles.seal}
              resizeMode="contain"
            />
            <Text style={styles.title}>Account</Text>
            <View style={styles.seal} />
          </View>

          {/* Gold ribbon accents (TANAW brand, not flag pattern) */}
          <View style={[styles.ribbon, styles.ribbonTopRight]} />
          <View style={[styles.ribbon, styles.ribbonMid]} />
          <View style={[styles.ribbon, styles.ribbonBottomLeft]} />
        </View>
      </SafeAreaView>

      {/* Avatar overlapping the hero */}
      <View style={styles.avatarOverlap}>
        <TouchableOpacity
          style={styles.avatarRing}
          onPress={onEditPhoto}
          disabled={!onEditPhoto || isUploading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          {photoUrl ? (
            <Image key={`${photoUrl}:${photoVersion ?? ''}`} source={{ uri: photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          {onEditPhoto && !isUploading && (
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color={COLORS.WHITE} />
            </View>
          )}
          {isUploading && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator size="small" color={COLORS.WHITE} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.identity}>
        <Text style={styles.fullName} numberOfLines={2}>{fullName.toUpperCase()}</Text>
        <Text style={styles.tanawIdText}>{tanawId}</Text>
        {!!phone && <Text style={styles.contact}>{phone}</Text>}
        {!!email && <Text style={styles.contact} numberOfLines={1}>{email}</Text>}

        {showStats && (
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statCol}
              onPress={onFollowersPress}
              disabled={!onFollowersPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View followers`}
            >
              <Text style={styles.statNumber}>{fmtCount(followerCount)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statCol}
              onPress={onFollowingPress}
              disabled={!onFollowingPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View following`}
            >
              <Text style={styles.statNumber}>{fmtCount(followingCount)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const AVATAR_SIZE = 92;

const styles = StyleSheet.create({
  wrap: { backgroundColor: COLORS.OFF_WHITE },

  hero: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: AVATAR_SIZE / 2 + 12,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seal: { width: 32, height: 32 },
  title: { color: COLORS.WHITE, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },

  ribbon: {
    position: 'absolute',
    backgroundColor: COLORS.GOLD,
    opacity: 0.35,
    borderRadius: 4,
  },
  ribbonTopRight: {
    width: 78, height: 10,
    top: 18, right: -18,
    transform: [{ rotate: '-24deg' }],
  },
  ribbonMid: {
    width: 52, height: 8,
    top: 58, left: -8,
    transform: [{ rotate: '28deg' }],
    opacity: 0.22,
  },
  ribbonBottomLeft: {
    width: 120, height: 12,
    bottom: 20, left: -30,
    transform: [{ rotate: '-16deg' }],
    opacity: 0.18,
  },

  avatarOverlap: {
    alignItems: 'center',
    marginTop: -(AVATAR_SIZE / 2),
  },
  avatarRing: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    backgroundColor: COLORS.OFF_WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.GRAY_100,
  },
  avatarFallback: {
    width: AVATAR_SIZE, height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { color: COLORS.PRIMARY, fontSize: 32, fontWeight: '800' },
  editBadge: {
    position: 'absolute',
    bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 2,
    borderColor: COLORS.OFF_WHITE,
    justifyContent: 'center', alignItems: 'center',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },

  identity: { alignItems: 'center', paddingHorizontal: 24, marginTop: 10 },
  fullName: {
    color: COLORS.GRAY_900, fontSize: 16, fontWeight: '800',
    textAlign: 'center', letterSpacing: 0.5,
  },
  tanawIdText: {
    color: COLORS.GOLD, fontSize: 12, fontWeight: '700',
    letterSpacing: 1.5, marginTop: 4,
  },
  contact: { color: COLORS.GRAY_500, fontSize: 13, marginTop: 4 },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.WHITE,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
    gap: 14,
    alignSelf: 'center',
  },
  statCol: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 2,
    minWidth: 78,
  },
  statNumber: { color: COLORS.GRAY_900, fontSize: 17, fontWeight: '800' },
  statLabel: { color: COLORS.GRAY_500, fontSize: 11, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: COLORS.GRAY_100 },
});
