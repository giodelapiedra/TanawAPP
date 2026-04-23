import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { UserCard } from '../../types/post.types';
import { AppStackNavigationProp } from '../../types/navigation.types';
import { getFullName, getInitials } from '../../utils/format';
import FollowButton from '../feed/FollowButton';

interface Props {
  user: UserCard;
  onFollowChange: (userId: string, isFollowing: boolean) => void;
  /** Override the default "navigate to profile" tap behavior — useful when
   *  the row lives inside a modal that must close itself first. */
  onPress?: (user: UserCard) => void;
}

export default function UserRow({ user, onFollowChange, onPress }: Props) {
  const navigation = useNavigation<AppStackNavigationProp>();
  const fullName = getFullName(
    user.firstName,
    user.lastName,
    user.middleName ?? undefined,
    user.suffix ?? undefined,
  );
  const initials = getInitials(user.firstName, user.lastName);
  const barangayName = user.barangay?.name;

  const openProfile = () => {
    if (onPress) onPress(user);
    else navigation.navigate('UserProfile', { userId: user.id });
  };

  return (
    <Pressable
      onPress={openProfile}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={`View ${fullName} profile`}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{fullName}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {user.tanawId}
          {barangayName ? ` · Brgy. ${barangayName}` : ''}
        </Text>
      </View>
      {!user.isSelf && (
        <FollowButton
          userId={user.id}
          isFollowing={user.isFollowedByMe}
          onChange={onFollowChange}
          size="sm"
          confirmName={fullName}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
    marginBottom: 8,
  },
  rowPressed: { opacity: 0.75 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: COLORS.WHITE, fontSize: 15, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.GRAY_900 },
  meta: { fontSize: 11, color: COLORS.GRAY_500, marginTop: 2 },
});
