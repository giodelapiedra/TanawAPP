import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import * as followsApi from '../../api/follows.api';
import ConfirmDialog from '../common/ConfirmDialog';

interface Props {
  userId: string;
  isFollowing: boolean;
  onChange: (userId: string, isFollowing: boolean) => void;
  size?: 'sm' | 'md';
  /** Display name used in the unfollow confirmation dialog. */
  confirmName?: string;
}

export default function FollowButton({
  userId, isFollowing, onChange, size = 'md', confirmName,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const doUnfollow = async () => {
    setConfirmOpen(false);
    setLoading(true);
    onChange(userId, false);
    try {
      await followsApi.unfollow(userId);
    } catch (e: any) {
      onChange(userId, true);
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to unfollow');
    } finally {
      setLoading(false);
    }
  };

  const doFollow = async () => {
    setLoading(true);
    onChange(userId, true);
    try {
      await followsApi.follow(userId);
    } catch (e: any) {
      onChange(userId, false);
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to follow');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    if (loading) return;
    if (isFollowing) {
      setConfirmOpen(true);
    } else {
      doFollow();
    }
  };

  const isSmall = size === 'sm';

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        disabled={loading}
        activeOpacity={0.8}
        style={[
          styles.btn,
          isSmall && styles.btnSm,
          isFollowing ? styles.btnFollowing : styles.btnNotFollowing,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={isFollowing ? COLORS.GRAY_700 : COLORS.WHITE} />
        ) : (
          <>
            <Ionicons
              name={isFollowing ? 'checkmark' : 'person-add-outline'}
              size={isSmall ? 13 : 14}
              color={isFollowing ? COLORS.GRAY_700 : COLORS.WHITE}
            />
            <Text style={[styles.label, isSmall && styles.labelSm, isFollowing ? styles.labelFollowing : styles.labelNotFollowing]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <ConfirmDialog
        visible={confirmOpen}
        title="Unfollow?"
        message={
          confirmName
            ? `Are you sure you want to unfollow ${confirmName}? You will no longer see their public posts in your feed.`
            : 'Are you sure you want to unfollow? You will no longer see their public posts in your feed.'
        }
        confirmLabel="Unfollow"
        cancelLabel="Cancel"
        destructive
        onConfirm={doUnfollow}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    minWidth: 100,
  },
  btnSm: { paddingHorizontal: 10, paddingVertical: 6, minWidth: 88 },
  btnNotFollowing: { backgroundColor: COLORS.PRIMARY },
  btnFollowing: { backgroundColor: COLORS.GRAY_50, borderWidth: 1, borderColor: COLORS.GRAY_100 },
  label: { fontSize: 13, fontWeight: '700' },
  labelSm: { fontSize: 12 },
  labelFollowing: { color: COLORS.GRAY_700 },
  labelNotFollowing: { color: COLORS.WHITE },
});
