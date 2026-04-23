import React, { useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { Post } from '../../types/post.types';
import { AppStackNavigationProp } from '../../types/navigation.types';
import { formatTimeAgo, getFullName, getInitials } from '../../utils/format';
import ActionMenu, { ActionItem } from '../common/ActionMenu';
import PostImages from './PostImages';

const TRUNCATE_LINES = 5;
const TRUNCATE_CHARS = 150;
const TRUNCATE_NEWLINES = 3;

function shouldTruncate(content: string): boolean {
  if (content.length > TRUNCATE_CHARS) return true;
  if ((content.match(/\n/g) || []).length >= TRUNCATE_NEWLINES) return true;
  return false;
}

interface Props {
  post: Post;
  currentUserId?: string;
  onLike: (post: Post) => void;
  onComment: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  /** When true, show full content without truncation (used on PostDetailScreen). */
  fullContent?: boolean;
}

function PostCardComponent({
  post, currentUserId, onLike, onComment, onDelete, onEdit, fullContent = false,
}: Props) {
  const navigation = useNavigation<AppStackNavigationProp>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const truncated = !fullContent && shouldTruncate(post.content);
  const showFull = fullContent || expanded || !truncated;

  const fullName = getFullName(
    post.author.firstName,
    post.author.lastName,
    post.author.middleName ?? undefined,
    post.author.suffix ?? undefined,
  );
  const initials = getInitials(post.author.firstName, post.author.lastName);
  const isOwnPost = currentUserId === post.author.id;
  const wasEdited = new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 1000;

  const menuItems = useMemo<ActionItem[]>(() => {
    const items: ActionItem[] = [];
    if (onEdit) items.push({ key: 'edit', label: 'Edit post', icon: 'create-outline', onPress: () => onEdit(post) });
    if (onDelete) items.push({ key: 'delete', label: 'Move to trash', icon: 'trash-outline', destructive: true, onPress: () => onDelete(post) });
    return items;
  }, [onEdit, onDelete, post]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          style={styles.authorPressable}
          onPress={() => navigation.navigate('UserProfile', { userId: post.author.id })}
          accessibilityRole="button"
          accessibilityLabel={`View ${fullName} profile`}
          hitSlop={4}
        >
          {post.author.profilePhoto ? (
            <Image
              key={post.author.profilePhoto}
              source={{ uri: post.author.profilePhoto }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>{fullName}</Text>
            <Text style={styles.time}>
              {formatTimeAgo(post.createdAt)}
              {wasEdited ? ' · edited' : ''}
            </Text>
          </View>
        </Pressable>
        {isOwnPost && menuItems.length > 0 && (
          <Pressable
            onPress={() => setMenuOpen(true)}
            hitSlop={12}
            style={({ pressed }) => [styles.menuBtn, pressed && styles.menuBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Post options"
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.GRAY_500} />
          </Pressable>
        )}
      </View>
      <Text
        style={styles.content}
        numberOfLines={showFull ? undefined : TRUNCATE_LINES}
      >
        {showFull || !truncated
          ? post.content
          : post.content.length > TRUNCATE_CHARS
            ? post.content.slice(0, TRUNCATE_CHARS).trimEnd() + '…'
            : post.content}
      </Text>
      {truncated && !expanded && (
        <Pressable onPress={() => setExpanded(true)} hitSlop={6}>
          <Text style={styles.seeMore}>See more</Text>
        </Pressable>
      )}
      {truncated && expanded && (
        <Pressable onPress={() => setExpanded(false)} hitSlop={6}>
          <Text style={styles.seeMore}>See less</Text>
        </Pressable>
      )}
      {post.images && post.images.length > 0 && (
        <PostImages images={post.images} />
      )}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={() => onLike(post)}>
          <Ionicons
            name={post.likedByMe ? 'heart' : 'heart-outline'}
            size={16}
            color={post.likedByMe ? COLORS.PRIMARY : COLORS.GRAY_500}
          />
          <Text style={[styles.footerText, post.likedByMe && styles.footerTextActive]}>
            {post.likeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn} onPress={() => onComment(post)}>
          <Ionicons name="chatbubble-outline" size={15} color={COLORS.GRAY_500} />
          <Text style={styles.footerText}>{post.commentCount}</Text>
        </TouchableOpacity>
      </View>

      <ActionMenu
        visible={menuOpen}
        items={menuItems}
        onClose={() => setMenuOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
    marginBottom: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  authorPressable: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarImage: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.GRAY_100,
  },
  avatarText: { color: COLORS.WHITE, fontSize: 13, fontWeight: '700' },
  headerInfo: { flex: 1 },
  name: { fontSize: 13, fontWeight: '700', color: COLORS.GRAY_900 },
  time: { fontSize: 11, color: COLORS.GRAY_300, marginTop: 1 },
  content: { fontSize: 14, color: COLORS.GRAY_700, lineHeight: 20 },
  seeMore: { fontSize: 13, color: COLORS.PRIMARY, fontWeight: '700', marginTop: 4 },
  footer: {
    borderTopWidth: 1, borderTopColor: COLORS.GRAY_50,
    marginTop: 12, paddingTop: 10,
    flexDirection: 'row', gap: 20,
  },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { color: COLORS.GRAY_500, fontSize: 12, fontWeight: '600' },
  footerTextActive: { color: COLORS.PRIMARY },
  menuBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  menuBtnPressed: { backgroundColor: COLORS.GRAY_50 },
});

const PostCard = React.memo(PostCardComponent, (prev, next) =>
  prev.post.id === next.post.id &&
  prev.post.likedByMe === next.post.likedByMe &&
  prev.post.likeCount === next.post.likeCount &&
  prev.post.commentCount === next.post.commentCount &&
  prev.post.content === next.post.content &&
  prev.post.updatedAt === next.post.updatedAt &&
  prev.post.author.profilePhoto === next.post.author.profilePhoto &&
  prev.currentUserId === next.currentUserId
);

export default PostCard;
