import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, Alert, Platform, TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { useAppSelector } from '../../store';
import { MyGroup, Post } from '../../types/post.types';
import { AppStackNavigationProp } from '../../types/navigation.types';
import { getApiErrorMessage } from '../../utils/apiError.util';
import * as groupsApi from '../../api/groups.api';
import PostComposer from '../post/PostComposer';
import PostCard from '../post/PostCard';
import EditPostModal from '../post/EditPostModal';
import WelcomeRulesModal from '../common/WelcomeRulesModal';
import ConfirmDialog from '../common/ConfirmDialog';

const PAGE_SIZE = 20;

export default function CommunityGroup() {
  const navigation = useNavigation<AppStackNavigationProp>();
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const acceptedRulesAt = useAppSelector((s) => s.auth.user?.acceptedCommunityRulesAt);
  const hasAccepted = !!acceptedRulesAt;

  const [group, setGroup] = useState<MyGroup | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  const loadingMoreRef = useRef(false);

  const loadFirstPage = useCallback(async () => {
    setError(null);
    const g = await groupsApi.getMyGroup();
    setGroup(g);
    const feed = await groupsApi.listPosts(g.code, { limit: PAGE_SIZE });
    setPosts(feed.items);
    setNextCursor(feed.nextCursor);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadFirstPage()
      .catch((e: any) => {
        const msg = e?.response?.data?.message ?? 'Failed to load community feed';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [loadFirstPage]);

  // Refresh feed when returning from PostDetail so like/comment/delete sync
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadFirstPage().catch(() => { /* silent on focus refresh */ });
      return () => { cancelled = true; void cancelled; };
    }, [loadFirstPage])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadFirstPage();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Failed to refresh';
      setError(msg);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (loadingMoreRef.current) return;
    if (!group || !nextCursor) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const feed = await groupsApi.listPosts(group.code, { cursor: nextCursor, limit: PAGE_SIZE });
      setPosts((prev) => [...prev, ...feed.items]);
      setNextCursor(feed.nextCursor);
    } catch (e: any) {
      console.warn('[loadMore] failed:', e?.response?.data?.message ?? e?.message);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const handleCreatePost = async (content: string) => {
    if (!group) return;
    const created = await groupsApi.createPost(group.code, content);
    setPosts((prev) => [created, ...prev]);
    setGroup({ ...group, postCount: group.postCount + 1 });
  };

  const handleCreatePostWithImages = async (content: string) => {
    await handleCreatePost(content);
  };

  const handleLike = useCallback(async (post: Post) => {
    setPosts((curr) =>
      curr.map((p) =>
        p.id === post.id
          ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );
    try {
      const res = await groupsApi.toggleLike(post.id);
      setPosts((curr) =>
        curr.map((p) =>
          p.id === post.id ? { ...p, likedByMe: res.liked, likeCount: res.likeCount } : p
        )
      );
    } catch {
      setPosts((curr) =>
        curr.map((p) =>
          p.id === post.id
            ? { ...p, likedByMe: post.likedByMe, likeCount: post.likeCount }
            : p
        )
      );
      Alert.alert('Error', 'Failed to update like');
    }
  }, []);

  const handleOpenComments = useCallback(
    (p: Post) => navigation.navigate('PostDetail', { postId: p.id }),
    [navigation]
  );
  const handleRequestDelete = useCallback((p: Post) => setPostToDelete(p), []);
  const handleRequestEdit = useCallback((p: Post) => setPostToEdit(p), []);

  const handlePostSaved = (updated: Post) => {
    setPosts((curr) => curr.map((p) => (p.id === updated.id ? updated : p)));
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    try {
      await groupsApi.deletePost(postToDelete.id);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setGroup((g) => (g ? { ...g, postCount: Math.max(0, g.postCount - 1) } : g));
      setPostToDelete(null);
    } catch (e: any) {
      const msg = getApiErrorMessage(e, 'Failed to delete post');
      console.warn('[deletePost] failed:', msg, e?.response?.data);
      Alert.alert('Error', msg);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (error || !group) {
    return (
      <View style={styles.errorBox}>
        <Ionicons name="alert-circle-outline" size={36} color={COLORS.GRAY_300} />
        <Text style={styles.errorText}>{error ?? 'Unable to load feed'}</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.PRIMARY} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            <View style={styles.groupHeader}>
              <View style={styles.groupIcon}>
                <Ionicons name="people" size={22} color={COLORS.PRIMARY} />
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupEyebrow}>Barangay community</Text>
                <Text style={styles.groupName}>Brgy. {group.name}</Text>
                <Text style={styles.groupMeta}>
                  {group.memberCount.toLocaleString()} members - {group.postCount.toLocaleString()} posts
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setRulesOpen(true)}
                hitSlop={10}
                style={styles.rulesLink}
              >
                <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.PRIMARY} />
                <Text style={styles.rulesLinkText}>Rules</Text>
              </TouchableOpacity>
            </View>
            {hasAccepted && <PostComposer onSubmit={handleCreatePostWithImages} allowImages={false} />}
          </>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={currentUserId}
            onLike={handleLike}
            onComment={handleOpenComments}
            onDelete={handleRequestDelete}
            onEdit={handleRequestEdit}
          />
        )}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={COLORS.PRIMARY} />
            </View>
          ) : !nextCursor && posts.length > 0 ? (
            <Text style={styles.endText}>You're all caught up</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={36} color={COLORS.GRAY_300} />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySub}>Be the first to share something with Brgy. {group.name}.</Text>
          </View>
        }
      />

      <WelcomeRulesModal
        visible={rulesOpen}
        blocking={false}
        onClose={() => setRulesOpen(false)}
      />

      <EditPostModal
        visible={postToEdit !== null}
        post={postToEdit}
        onClose={() => setPostToEdit(null)}
        onSaved={handlePostSaved}
      />

      <ConfirmDialog
        visible={postToDelete !== null}
        title="Are you sure you want to delete?"
        message="Move to your trash? This post will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={confirmDeletePost}
        onCancel={() => setPostToDelete(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 100 },
  loading: { paddingVertical: 60, alignItems: 'center' },
  errorBox: { paddingVertical: 60, alignItems: 'center', paddingHorizontal: 32 },
  errorText: { color: COLORS.GRAY_500, fontSize: 13, textAlign: 'center', marginTop: 10 },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  groupIcon: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },
  groupInfo: { flex: 1 },
  groupEyebrow: { color: COLORS.PRIMARY, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  groupName: { fontSize: 16, fontWeight: '800', color: COLORS.GRAY_900, marginTop: 2 },
  groupMeta: { fontSize: 12, color: COLORS.GRAY_500, marginTop: 3 },
  rulesLink: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
  },
  rulesLinkText: { color: COLORS.PRIMARY, fontSize: 11, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { color: COLORS.GRAY_900, fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptySub: { color: COLORS.GRAY_500, fontSize: 13, textAlign: 'center', marginTop: 4 },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  endText: { textAlign: 'center', color: COLORS.GRAY_300, fontSize: 12, paddingVertical: 20 },
});
