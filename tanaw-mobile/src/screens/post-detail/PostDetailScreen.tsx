import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, FlatList, TextInput,
  TouchableOpacity, Pressable, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { useAppSelector } from '../../store';
import { AppStackNavigationProp, AppStackParamList } from '../../types/navigation.types';
import { Comment, Post } from '../../types/post.types';
import * as groupsApi from '../../api/groups.api';
import { formatTimeAgo, getFullName, getInitials } from '../../utils/format';
import PostCard from '../../components/post/PostCard';
import EditPostModal from '../../components/post/EditPostModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const PAGE_SIZE = 20;

export default function PostDetailScreen() {
  const navigation = useNavigation<AppStackNavigationProp>();
  const route = useRoute<RouteProp<AppStackParamList, 'PostDetail'>>();
  const { postId } = route.params;
  const currentUserId = useAppSelector((s) => s.auth.user?.id);

  const [post, setPost] = useState<Post | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [postToDelete, setPostToDelete] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [editing, setEditing] = useState(false);

  const loadingMoreRef = useRef(false);

  useEffect(() => {
    groupsApi.getPostById(postId)
      .then((p) => setPost(p))
      .catch((e: any) => {
        setPostError(e?.response?.data?.message ?? 'Post is no longer available');
      })
      .finally(() => setLoadingPost(false));
  }, [postId]);

  useEffect(() => {
    setLoadingComments(true);
    groupsApi.listComments(postId, { limit: PAGE_SIZE })
      .then((res) => {
        setComments(res.items);
        setNextCursor(res.nextCursor);
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoadingComments(false));
  }, [postId]);

  const loadMore = async () => {
    if (loadingMoreRef.current || !nextCursor) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await groupsApi.listComments(postId, { cursor: nextCursor, limit: PAGE_SIZE });
      setComments((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } catch (e: any) {
      console.warn('[comments loadMore] failed:', e?.response?.data?.message ?? e?.message);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const handleLike = useCallback(async (p: Post) => {
    setPost((curr) =>
      curr ? { ...curr, likedByMe: !curr.likedByMe, likeCount: curr.likedByMe ? curr.likeCount - 1 : curr.likeCount + 1 } : curr
    );
    try {
      const res = await groupsApi.toggleLike(p.id);
      setPost((curr) => (curr ? { ...curr, likedByMe: res.liked, likeCount: res.likeCount } : curr));
    } catch {
      setPost((curr) => (curr ? { ...curr, likedByMe: p.likedByMe, likeCount: p.likeCount } : curr));
      Alert.alert('Error', 'Failed to update like');
    }
  }, []);

  const handleSubmitComment = async () => {
    const trimmed = input.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const created = await groupsApi.createComment(postId, trimmed);
      setComments((prev) => [...prev, created]);
      setPost((curr) => (curr ? { ...curr, commentCount: curr.commentCount + 1 } : curr));
      setInput('');
    } catch {
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    setDeletingComment(true);
    try {
      await groupsApi.deleteComment(commentToDelete.id);
      setComments((prev) => prev.filter((c) => c.id !== commentToDelete.id));
      setPost((curr) => (curr ? { ...curr, commentCount: Math.max(0, curr.commentCount - 1) } : curr));
      setCommentToDelete(null);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to delete comment');
    } finally {
      setDeletingComment(false);
    }
  };

  const confirmDeletePost = async () => {
    if (!post) return;
    setDeletingPost(true);
    try {
      await groupsApi.deletePost(post.id);
      setPostToDelete(false);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to delete post');
    } finally {
      setDeletingPost(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const fullName = getFullName(
      item.author.firstName,
      item.author.lastName,
      item.author.middleName ?? undefined,
      item.author.suffix ?? undefined,
    );
    const initials = getInitials(item.author.firstName, item.author.lastName);
    const isOwn = currentUserId === item.author.id;
    return (
      <View style={styles.commentRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.commentBubbleWrap}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentName} numberOfLines={1}>{fullName}</Text>
            <Text style={styles.commentContent}>{item.content}</Text>
          </View>
          <View style={styles.commentMetaRow}>
            <Text style={styles.commentTime}>{formatTimeAgo(item.createdAt)}</Text>
            {isOwn && (
              <Pressable
                onPress={() => setCommentToDelete(item)}
                hitSlop={12}
                style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
              >
                <Ionicons name="trash-outline" size={13} color={COLORS.DANGER} />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={16}
              style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
            </Pressable>
            <Text style={styles.headerTitle}>Post</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </View>

      {loadingPost ? (
        <View style={styles.state}>
          <ActivityIndicator color={COLORS.PRIMARY} />
        </View>
      ) : postError || !post ? (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" size={36} color={COLORS.GRAY_300} />
          <Text style={styles.stateText}>{postError ?? 'Post unavailable'}</Text>
          <TouchableOpacity style={styles.backToFeedBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backToFeedText}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <FlatList
            data={comments}
            keyExtractor={(c) => c.id}
            renderItem={renderComment}
            style={styles.flatList}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            initialNumToRender={15}
            maxToRenderPerBatch={15}
            windowSize={7}
            removeClippedSubviews={Platform.OS === 'android'}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={
              <View style={styles.postWrap}>
                <PostCard
                  post={post}
                  currentUserId={currentUserId}
                  onLike={handleLike}
                  onComment={() => { /* already on detail */ }}
                  onDelete={() => setPostToDelete(true)}
                  onEdit={() => setEditing(true)}
                />
                <View style={styles.commentsHeader}>
                  <Text style={styles.commentsHeaderText}>
                    {post.commentCount.toLocaleString()} {post.commentCount === 1 ? 'Comment' : 'Comments'}
                  </Text>
                </View>
              </View>
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator color={COLORS.PRIMARY} />
                </View>
              ) : nextCursor && comments.length > 0 ? (
                <TouchableOpacity onPress={loadMore} style={styles.viewMoreBtn} activeOpacity={0.7}>
                  <Ionicons name="chevron-down" size={14} color={COLORS.PRIMARY} />
                  <Text style={styles.viewMoreText}>View more comments</Text>
                </TouchableOpacity>
              ) : null
            }
            ListEmptyComponent={
              loadingComments ? (
                <View style={styles.commentsLoading}>
                  <ActivityIndicator color={COLORS.PRIMARY} />
                </View>
              ) : (
                <Text style={styles.empty}>No comments yet. Be the first to comment.</Text>
              )
            }
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment…"
              placeholderTextColor={COLORS.GRAY_500}
              value={input}
              onChangeText={setInput}
              maxLength={500}
              editable={!submitting}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || submitting) && styles.sendBtnDisabled]}
              onPress={handleSubmitComment}
              disabled={!input.trim() || submitting}
            >
              {submitting
                ? <ActivityIndicator size="small" color={COLORS.WHITE} />
                : <Ionicons name="send" size={16} color={COLORS.WHITE} />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      <EditPostModal
        visible={editing}
        post={post}
        onClose={() => setEditing(false)}
        onSaved={(updated) => setPost(updated)}
      />

      <ConfirmDialog
        visible={commentToDelete !== null}
        title="Are you sure you want to delete?"
        message="Move to your trash? This comment will be permanently removed."
        confirmLabel="Delete"
        destructive
        loading={deletingComment}
        onConfirm={confirmDeleteComment}
        onCancel={() => setCommentToDelete(null)}
      />

      <ConfirmDialog
        visible={postToDelete}
        title="Are you sure you want to delete?"
        message="Move to your trash? This post will be permanently removed."
        confirmLabel="Delete"
        destructive
        loading={deletingPost}
        onConfirm={confirmDeletePost}
        onCancel={() => setPostToDelete(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  header: { backgroundColor: COLORS.PRIMARY },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 8,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnPressed: { backgroundColor: COLORS.WHITE_15 },
  headerTitle: { flex: 1, textAlign: 'center', color: COLORS.WHITE, fontSize: 17, fontWeight: '700' },
  headerSpacer: { width: 44 },

  body: { flex: 1, minHeight: 0 },
  flatList: { flex: 1 },
  state: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, gap: 10 },
  stateText: { color: COLORS.GRAY_500, fontSize: 13, textAlign: 'center' },
  backToFeedBtn: {
    marginTop: 4, backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.md,
  },
  backToFeedText: { color: COLORS.WHITE, fontSize: 13, fontWeight: '700' },

  list: { padding: 14, paddingBottom: 20 },
  postWrap: { marginBottom: 4 },
  commentsHeader: {
    borderTopWidth: 1, borderTopColor: COLORS.GRAY_100,
    paddingVertical: 12, marginTop: 6, marginBottom: 6,
  },
  commentsHeaderText: { fontSize: 13, fontWeight: '700', color: COLORS.GRAY_700 },

  commentsLoading: { paddingVertical: 30, alignItems: 'center' },
  empty: { textAlign: 'center', color: COLORS.GRAY_500, fontSize: 13, marginTop: 20 },

  commentRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: COLORS.WHITE, fontSize: 11, fontWeight: '700' },
  commentBubbleWrap: { flex: 1 },
  commentBubble: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
  },
  commentName: { fontSize: 12, fontWeight: '700', color: COLORS.GRAY_900, marginBottom: 2 },
  commentContent: { fontSize: 13, color: COLORS.GRAY_700, lineHeight: 18 },
  commentMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 10, gap: 12 },
  commentTime: { fontSize: 10, color: COLORS.GRAY_300 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 4, paddingHorizontal: 6,
    borderRadius: 6,
  },
  deleteBtnPressed: { backgroundColor: COLORS.DANGER_LIGHT, opacity: 0.6 },
  deleteBtnText: { fontSize: 11, color: COLORS.DANGER, fontWeight: '700' },

  footerLoader: { paddingVertical: 16, alignItems: 'center' },
  viewMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 10, paddingHorizontal: 4,
  },
  viewMoreText: { color: COLORS.PRIMARY, fontSize: 13, fontWeight: '700' },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 10,
    borderTopWidth: 1, borderTopColor: COLORS.GRAY_100,
    backgroundColor: COLORS.WHITE,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.GRAY_50,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.GRAY_900,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.GRAY_300 },
});
