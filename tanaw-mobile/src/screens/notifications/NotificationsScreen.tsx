import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl,
  TouchableOpacity, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { Notification } from '../../types/notification.types';
import * as notificationsApi from '../../api/notifications.api';
import { formatTimeAgo, getFullName, getInitials } from '../../utils/format';
import { AppStackNavigationProp } from '../../types/navigation.types';

const PAGE_SIZE = 20;

function buildMessage(n: Notification): string {
  const name = getFullName(
    n.actor.firstName,
    n.actor.lastName,
    n.actor.middleName ?? undefined,
    n.actor.suffix ?? undefined,
  );
  if (n.type === 'POST_COMMENT') return `${name} commented on your post`;
  if (n.type === 'POST_LIKE') return `${name} liked your post`;
  return `${name} interacted with your post`;
}

export default function NotificationsScreen() {
  const navigation = useNavigation<AppStackNavigationProp>();

  const [items, setItems] = useState<Notification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingMoreRef = useRef(false);

  const loadFirstPage = useCallback(async () => {
    setError(null);
    const res = await notificationsApi.listNotifications({ limit: PAGE_SIZE });
    setItems(res.items);
    setNextCursor(res.nextCursor);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadFirstPage()
      .catch((e: any) => {
        setError(e?.response?.data?.message ?? 'Failed to load notifications');
      })
      .finally(() => setLoading(false));
  }, [loadFirstPage]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadFirstPage();
    } catch {
      // silent — keep current data
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (loadingMoreRef.current || !nextCursor) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await notificationsApi.listNotifications({ cursor: nextCursor, limit: PAGE_SIZE });
      setItems((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } catch (e: any) {
      console.warn('[notifications loadMore] failed:', e?.response?.data?.message ?? e?.message);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const handlePress = async (n: Notification) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      notificationsApi.markAsRead(n.id).catch(() => { /* silent */ });
    }
    if (n.postId) {
      navigation.navigate('PostDetail', { postId: n.postId });
    }
  };

  const handleMarkAllRead = async () => {
    const prev = items;
    setItems((curr) => curr.map((x) => ({ ...x, isRead: true })));
    try {
      await notificationsApi.markAllAsRead();
    } catch (e: any) {
      setItems(prev);
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to mark all as read');
    }
  };

  const hasUnread = items.some((x) => !x.isRead);

  const renderItem = ({ item }: { item: Notification }) => {
    const initials = getInitials(item.actor.firstName, item.actor.lastName);
    return (
      <TouchableOpacity
        style={[styles.row, !item.isRead && styles.rowUnread]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.message}>{buildMessage(item)}</Text>
          <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
              <Ionicons name="arrow-back" size={22} color={COLORS.WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity
              onPress={handleMarkAllRead}
              hitSlop={10}
              disabled={!hasUnread}
              style={styles.markAllBtn}
            >
              <Text style={[styles.markAllText, !hasUnread && styles.markAllDisabled]}>
                Mark all read
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator color={COLORS.PRIMARY} />
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" size={32} color={COLORS.GRAY_300} />
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.PRIMARY} />}
          initialNumToRender={15}
          maxToRenderPerBatch={15}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={COLORS.PRIMARY} />
              </View>
            ) : !nextCursor && items.length > 0 ? (
              <Text style={styles.endText}>You're all caught up</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={40} color={COLORS.GRAY_300} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySub}>You'll see updates here when people interact with your posts.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  header: { backgroundColor: COLORS.PRIMARY },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  headerTitle: { flex: 1, color: COLORS.WHITE, fontSize: 18, fontWeight: '700' },
  markAllBtn: { paddingVertical: 4 },
  markAllText: { color: COLORS.WHITE, fontSize: 12, fontWeight: '700' },
  markAllDisabled: { opacity: 0.4 },

  state: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, gap: 8 },
  stateText: { color: COLORS.GRAY_500, fontSize: 13, textAlign: 'center' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: COLORS.WHITE,
  },
  rowUnread: { backgroundColor: COLORS.PRIMARY_LIGHT },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: COLORS.WHITE, fontSize: 13, fontWeight: '700' },
  info: { flex: 1 },
  message: { color: COLORS.GRAY_900, fontSize: 13, lineHeight: 18 },
  time: { color: COLORS.GRAY_500, fontSize: 11, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.PRIMARY },
  sep: { height: 1, backgroundColor: COLORS.GRAY_100 },

  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  endText: { textAlign: 'center', color: COLORS.GRAY_300, fontSize: 12, paddingVertical: 20 },
  empty: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  emptyTitle: { color: COLORS.GRAY_900, fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptySub: { color: COLORS.GRAY_500, fontSize: 13, textAlign: 'center', marginTop: 4, lineHeight: 18 },
});
