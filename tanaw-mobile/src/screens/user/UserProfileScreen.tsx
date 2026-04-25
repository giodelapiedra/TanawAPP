import React, { useCallback, useState } from 'react';
import {
  View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppStackNavigationProp, AppStackParamList } from '../../types/navigation.types';
import { PublicUserProfile } from '../../types/public-profile.types';
import * as usersApi from '../../api/users.api';
import * as followsApi from '../../api/follows.api';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { getFullName, getInitials, formatDate, formatRole } from '../../utils/format';
import ScreenHeader from '../../components/common/ScreenHeader';

type Route = RouteProp<AppStackParamList, 'UserProfile'>;

export default function UserProfileScreen() {
  const navigation = useNavigation<AppStackNavigationProp>();
  const route = useRoute<Route>();
  const { userId } = route.params;

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    usersApi
      .getPublicProfile(userId)
      .then(setProfile)
      .catch((e: unknown) => {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg ?? 'Could not load profile');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleToggleFollow = async () => {
    if (!profile || profile.isSelf || followBusy) return;
    setFollowBusy(true);
    const prev = profile;
    // Optimistic update
    setProfile({
      ...profile,
      isFollowedByMe: !profile.isFollowedByMe,
      followerCount: profile.followerCount + (profile.isFollowedByMe ? -1 : 1),
    });
    try {
      if (prev.isFollowedByMe) {
        await followsApi.unfollow(userId);
      } else {
        await followsApi.follow(userId);
      }
    } catch {
      setProfile(prev);
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Profile" onBackPress={() => navigation.goBack()} />
        <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.PRIMARY} /></View>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Profile" onBackPress={() => navigation.goBack()} />
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.GRAY_300} />
          <Text style={styles.errorText}>{error ?? 'Profile unavailable'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const fullName = getFullName(
    profile.firstName,
    profile.lastName,
    profile.middleName ?? undefined,
    profile.suffix ?? undefined,
  );
  const initials = getInitials(profile.firstName, profile.lastName);

  return (
    <View style={styles.root}>
      <ScreenHeader title="Profile" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatarRing}>
            {profile.profilePhoto ? (
              <Image key={profile.profilePhoto} source={{ uri: profile.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>

          <Text style={styles.fullName} numberOfLines={2}>{fullName}</Text>
          <View style={styles.tanawIdPill}>
            <Ionicons name="card-outline" size={12} color={COLORS.GOLD} />
            <Text style={styles.tanawId}>{profile.tanawId}</Text>
          </View>

          <View style={styles.chipRow}>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>{formatRole(profile.role)}</Text>
            </View>
            {profile.barangay && (
              <View style={styles.barangayChip}>
                <Ionicons name="location-outline" size={11} color={COLORS.PRIMARY} />
                <Text style={styles.barangayText}>Brgy. {profile.barangay.name}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCol}
            onPress={() => navigation.navigate('Follows', { initialTab: 'followers' })}
            activeOpacity={0.7}
            disabled={!profile.isSelf}
          >
            <Text style={styles.statNumber}>{profile.followerCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statCol}
            onPress={() => navigation.navigate('Follows', { initialTab: 'following' })}
            activeOpacity={0.7}
            disabled={!profile.isSelf}
          >
            <Text style={styles.statNumber}>{profile.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {!profile.isSelf && (
          <TouchableOpacity
            style={[
              styles.followBtn,
              profile.isFollowedByMe && styles.followBtnActive,
            ]}
            onPress={handleToggleFollow}
            disabled={followBusy}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={profile.isFollowedByMe ? 'Unfollow' : 'Follow'}
          >
            {followBusy ? (
              <ActivityIndicator color={profile.isFollowedByMe ? COLORS.PRIMARY : COLORS.WHITE} />
            ) : (
              <>
                <Ionicons
                  name={profile.isFollowedByMe ? 'checkmark' : 'person-add-outline'}
                  size={16}
                  color={profile.isFollowedByMe ? COLORS.PRIMARY : COLORS.WHITE}
                />
                <Text style={[
                  styles.followBtnText,
                  profile.isFollowedByMe && styles.followBtnTextActive,
                ]}>
                  {profile.isFollowedByMe ? 'Following' : 'Follow'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <InfoRow icon="card-outline" label="TANAW ID" value={profile.tanawId} />
          <InfoRow icon="shield-outline" label="Role" value={formatRole(profile.role)} />
          {profile.barangay && (
            <InfoRow
              icon="location-outline"
              label="Barangay"
              value={`Brgy. ${profile.barangay.name}`}
            />
          )}
          <InfoRow icon="calendar-outline" label="Member since" value={formatDate(profile.createdAt)} last />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon, label, value, last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={COLORS.GRAY_500} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );
}

const AVATAR_SIZE = 100;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 8 },
  errorText: { color: COLORS.GRAY_500, fontSize: 13, textAlign: 'center' },
  retryBtn: {
    marginTop: 8,
    backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.md,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  retryText: { color: COLORS.WHITE, fontSize: 13, fontWeight: '700' },

  content: { padding: 16, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 16 },
  avatarRing: {
    width: AVATAR_SIZE + 8, height: AVATAR_SIZE + 8, borderRadius: (AVATAR_SIZE + 8) / 2,
    backgroundColor: COLORS.WHITE,
    borderWidth: 3,
    borderColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: COLORS.GRAY_100 },
  avatarFallback: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { color: COLORS.PRIMARY, fontSize: 34, fontWeight: '800' },
  fullName: { color: COLORS.GRAY_900, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  tanawIdPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.GOLD_LIGHT, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
  },
  tanawId: { color: COLORS.GOLD, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  roleChip: { backgroundColor: COLORS.GRAY_100, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  roleChipText: { color: COLORS.GRAY_700, fontSize: 12, fontWeight: '600' },
  barangayChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.PRIMARY_LIGHT, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  barangayText: { color: COLORS.PRIMARY, fontSize: 12, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
    paddingVertical: 14,
  },
  statCol: { flex: 1, alignItems: 'center' },
  statNumber: { color: COLORS.GRAY_900, fontSize: 20, fontWeight: '800' },
  statLabel: { color: COLORS.GRAY_500, fontSize: 12, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.GRAY_100 },

  followBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.lg,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  followBtnActive: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
  },
  followBtnText: { color: COLORS.WHITE, fontSize: 14, fontWeight: '800' },
  followBtnTextActive: { color: COLORS.PRIMARY },

  infoCard: {
    backgroundColor: COLORS.WHITE, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.GRAY_100,
    padding: 16, marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.GRAY_500, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.GRAY_50 },
  infoIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.GRAY_50,
    justifyContent: 'center', alignItems: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: { color: COLORS.GRAY_300, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  infoValue: { color: COLORS.GRAY_900, fontSize: 14, fontWeight: '500', marginTop: 2 },
});
