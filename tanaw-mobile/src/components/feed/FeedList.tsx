import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, Alert, Platform, Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAppSelector } from '../../store';
import { Post } from '../../types/post.types';
import { AppStackNavigationProp } from '../../types/navigation.types';
import * as feedApi from '../../api/feed.api';
import * as groupsApi from '../../api/groups.api';
import PostComposer, { QuickAction } from '../post/PostComposer';
import PostCard from '../post/PostCard';
import EditPostModal from '../post/EditPostModal';
import ConfirmDialog from '../common/ConfirmDialog';
import ComingSoonModal from '../common/ComingSoonModal';
import CityHighlights from '../home/CityHighlights';
import FeedFilterChips, { FeedFilter } from '../home/FeedFilterChips';
import { CityHighlight } from '../../constants/cityHighlights';
import { getApiErrorMessage } from '../../utils/apiError.util';
import { PickedImage } from '../../utils/imagePicker.util';
import { listCityVideos } from '../../api/youtube.api';
import { CITY_NEWS_CHANNEL_URL } from '../../constants/urls';

const PAGE_SIZE = 20;

export default function FeedList() {
  const navigation = useNavigation<AppStackNavigationProp>();
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const currentUserPhoto = useAppSelector((s) => s.auth.user?.profilePhoto);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);

  const [stubFeature, setStubFeature] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('ALL');
  const [highlights, setHighlights] = useState<CityHighlight[]>([]);

  const loadingMoreRef = useRef(false);

  const loadFirstPage = useCallback(async () => {
    setError(null);
    const feed = await feedApi.listMyFeed({ limit: PAGE_SIZE });
    setPosts(feed.items);
    setNextCursor(feed.nextCursor);
  }, []);

  const loadHighlights = useCallback(async () => {
    try {
      const videos = await listCityVideos(8);
      const mapped: CityHighlight[] = videos.map((v) => ({
        id: v.id,
        title: v.title,
        category: 'NEWS',
        date: v.publishedAt || '',
        imageUrl: v.thumbnailUrl,
        url: v.videoUrl,
      }));
      setHighlights(mapped);
    } catch {
      setHighlights([]);
    }
  }, []);

  useEffect(() => {
    loadHighlights();
  }, [loadHighlights]);

  // When the user changes their profile photo, (1) patch cached posts locally for instant UI
  // and (2) refetch the feed to pick up any other freshness from the server.
  const photoSyncInitDone = useRef(false);
  useEffect(() => {
    if (!currentUserId) return;

    setPosts((prev) => {
      let changed = false;
      const next = prev.map((p) => {
        if (p.author.id !== currentUserId) return p;
        if (p.author.profilePhoto === currentUserPhoto) return p;
        changed = true;
        return { ...p, author: { ...p.author, profilePhoto: currentUserPhoto ?? null } };
      });
      return changed ? next : prev;
    });

    if (!photoSyncInitDone.current) {
      photoSyncInitDone.current = true;
      return;
    }
    loadFirstPage().catch(() => { /* silent */ });
  }, [currentUserId, currentUserPhoto, loadFirstPage]);

  useEffect(() => {
    setLoading(true);
    loadFirstPage()
      .catch((e: any) => {
        setError(e?.response?.data?.message ?? 'Failed to load feed');
      })
      .finally(() => setLoading(false));
  }, [loadFirstPage]);

  useFocusEffect(
    useCallback(() => {
      loadFirstPage().catch(() => { /* silent */ });
    }, [loadFirstPage])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadFirstPage();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (loadingMoreRef.current || !nextCursor) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const feed = await feedApi.listMyFeed({ cursor: nextCursor, limit: PAGE_SIZE });
      setPosts((prev) => [...prev, ...feed.items]);
      setNextCursor(feed.nextCursor);
    } catch { /* silent */ } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const handleCreatePost = async (content: string, images: PickedImage[]) => {
    const created = await feedApi.createPublicPost(content, images);
    setPosts((prev) => [created, ...prev]);
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
    }
  }, []);

  const handleOpenComments = useCallback(
    (p: Post) => navigation.navigate('PostDetail', { postId: p.id }),
    [navigation]
  );

  const handlePostSaved = (updated: Post) => {
    setPosts((curr) => curr.map((p) => (p.id === updated.id ? updated : p)));
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    try {
      await groupsApi.deletePost(postToDelete.id);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setPostToDelete(null);
    } catch (e: any) {
      Alert.alert('Error', getApiErrorMessage(e, 'Failed to delete post'));
    } finally {
      setDeleting(false);
    }
  };

  // The composer modal already has a working Photo button. We don't surface a
  // quick-action shortcut for it here so we don't have two entry points doing
  // the same thing. Video / Feeling / Check-In are still Phase-2 stubs.
  const quickActions: QuickAction[] = [
    { key: 'video', icon: 'videocam-outline', label: 'Video', color: COLORS.PRIMARY, onPress: () => setStubFeature('Video Upload') },
    { key: 'feeling', icon: 'happy-outline', label: 'Feeling', color: COLORS.GOLD, onPress: () => setStubFeature('Feeling / Activity') },
    { key: 'checkin', icon: 'location-outline', label: 'Check In', color: COLORS.PRIMARY, onPress: () => setStubFeature('Check In') },
  ];

  const handleFilterChange = (filter: FeedFilter) => {
    setFeedFilter(filter);
    if (filter !== 'ALL') {
      setStubFeature(`${filter.charAt(0) + filter.slice(1).toLowerCase()} category`);
      setFeedFilter('ALL');
    }
  };

  const handleHighlightPress = (item: CityHighlight) => {
    if (item.url) {
      Linking.openURL(item.url).catch(() => {
        navigation.navigate('WebView', { url: item.url!, title: item.title });
      });
    } else {
      setStubFeature('Highlight details');
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.PRIMARY} /></View>;
  }

  if (error) {
    return (
      <View style={styles.errorBox}>
        <Ionicons name="alert-circle-outline" size={36} color={COLORS.GRAY_300} />
        <Text style={styles.errorText}>{error}</Text>
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
            <CityHighlights
              items={highlights}
              onItemPress={handleHighlightPress}
              onSeeAllPress={() => {
                Linking.openURL(CITY_NEWS_CHANNEL_URL).catch(() => {
                  navigation.navigate('WebView', { url: CITY_NEWS_CHANNEL_URL, title: 'City Government of Tanauan' });
                });
              }}
            />
            <PostComposer
              onSubmit={handleCreatePost}
              triggerText="What's on your mind, Tanauan?"
              audience={{ icon: 'globe', label: 'Public' }}
              quickActions={quickActions}
            />
            <FeedFilterChips value={feedFilter} onChange={handleFilterChange} />
          </>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={currentUserId}
            onLike={handleLike}
            onComment={handleOpenComments}
            onDelete={setPostToDelete}
            onEdit={setPostToEdit}
          />
        )}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}><ActivityIndicator color={COLORS.PRIMARY} /></View>
          ) : !nextCursor && posts.length > 0 ? (
            <Text style={styles.endText}>You're all caught up</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="people-outline" size={40} color={COLORS.GRAY_300} />
            <Text style={styles.emptyTitle}>Your feed is empty</Text>
            <Text style={styles.emptySub}>Tap the search icon above to find residents by TANAW ID and follow them.</Text>
          </View>
        }
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
        message="This post will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={confirmDeletePost}
        onCancel={() => setPostToDelete(null)}
      />

      <ComingSoonModal
        visible={stubFeature !== null}
        onClose={() => setStubFeature(null)}
        featureName={stubFeature ?? ''}
        phase="Phase 2"
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: 14, paddingBottom: 100 },
  center: { paddingVertical: 60, alignItems: 'center' },
  errorBox: { paddingVertical: 60, alignItems: 'center', paddingHorizontal: 32 },
  errorText: { color: COLORS.GRAY_500, fontSize: 13, textAlign: 'center', marginTop: 10 },
  emptyBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { color: COLORS.GRAY_900, fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptySub: { color: COLORS.GRAY_500, fontSize: 13, textAlign: 'center', marginTop: 4 },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  endText: { textAlign: 'center', color: COLORS.GRAY_300, fontSize: 12, paddingVertical: 20 },
});
