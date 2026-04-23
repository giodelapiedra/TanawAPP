import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl,
  TouchableOpacity, Pressable, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { AppStackNavigationProp, AppStackParamList } from '../../types/navigation.types';
import { UserCard } from '../../types/post.types';
import * as followsApi from '../../api/follows.api';
import UserRow from '../../components/user/UserRow';

const PAGE_SIZE = 20;

type Tab = 'followers' | 'following';

interface ListState {
  users: UserCard[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  nextCursor: string | null;
  error: string | null;
  loaded: boolean;
}

const EMPTY_STATE: ListState = {
  users: [], loading: false, refreshing: false, loadingMore: false,
  nextCursor: null, error: null, loaded: false,
};

export default function FollowsScreen() {
  const navigation = useNavigation<AppStackNavigationProp>();
  const route = useRoute<RouteProp<AppStackParamList, 'Follows'>>();
  const initialTab = route.params?.initialTab ?? 'following';

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [followers, setFollowers] = useState<ListState>(EMPTY_STATE);
  const [following, setFollowing] = useState<ListState>(EMPTY_STATE);

  const loadingMoreRef = useRef({ followers: false, following: false });

  const loadFirstPage = useCallback(async (tab: Tab) => {
    const fetcher = tab === 'followers' ? followsApi.myFollowers : followsApi.myFollowing;
    const setState = tab === 'followers' ? setFollowers : setFollowing;

    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetcher({ limit: PAGE_SIZE });
      setState({
        users: res.items,
        loading: false,
        refreshing: false,
        loadingMore: false,
        nextCursor: res.nextCursor,
        error: null,
        loaded: true,
      });
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e?.response?.data?.message ?? 'Failed to load',
        loaded: true,
      }));
    }
  }, []);

  useEffect(() => {
    const state = activeTab === 'followers' ? followers : following;
    if (!state.loaded) loadFirstPage(activeTab);
  }, [activeTab, followers, following, loadFirstPage]);

  const onRefresh = async () => {
    const setState = activeTab === 'followers' ? setFollowers : setFollowing;
    setState((s) => ({ ...s, refreshing: true }));
    await loadFirstPage(activeTab);
  };

  const loadMore = async () => {
    const state = activeTab === 'followers' ? followers : following;
    const setState = activeTab === 'followers' ? setFollowers : setFollowing;
    const fetcher = activeTab === 'followers' ? followsApi.myFollowers : followsApi.myFollowing;

    if (loadingMoreRef.current[activeTab] || !state.nextCursor) return;
    loadingMoreRef.current[activeTab] = true;
    setState((s) => ({ ...s, loadingMore: true }));
    try {
      const res = await fetcher({ cursor: state.nextCursor, limit: PAGE_SIZE });
      setState((s) => ({
        ...s,
        users: [...s.users, ...res.items],
        nextCursor: res.nextCursor,
        loadingMore: false,
      }));
    } catch {
      setState((s) => ({ ...s, loadingMore: false }));
    } finally {
      loadingMoreRef.current[activeTab] = false;
    }
  };

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    // Update both lists optimistically since a user can appear in both.
    const update = (prev: ListState): ListState => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, isFollowedByMe: isFollowing } : u)),
    });
    setFollowers(update);
    setFollowing(update);

    // On the Following tab, unfollowing also removes the row from the list.
    if (activeTab === 'following' && !isFollowing) {
      setFollowing((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== userId),
      }));
    }
  };

  const state = activeTab === 'followers' ? followers : following;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.title}>Follows</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.tabs}>
          <TabButton
            label="Followers"
            active={activeTab === 'followers'}
            onPress={() => setActiveTab('followers')}
          />
          <TabButton
            label="Following"
            active={activeTab === 'following'}
            onPress={() => setActiveTab('following')}
          />
        </View>
      </SafeAreaView>

      <View style={styles.body}>
        {state.loading && !state.users.length ? (
          <View style={styles.center}><ActivityIndicator color={COLORS.PRIMARY} /></View>
        ) : state.error ? (
          <View style={styles.emptyBox}>
            <Ionicons name="alert-circle-outline" size={36} color={COLORS.GRAY_300} />
            <Text style={styles.emptyText}>{state.error}</Text>
          </View>
        ) : (
          <FlatList
            data={state.users}
            keyExtractor={(u) => u.id}
            refreshControl={<RefreshControl refreshing={state.refreshing} onRefresh={onRefresh} tintColor={COLORS.PRIMARY} />}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={12}
            windowSize={7}
            removeClippedSubviews={Platform.OS === 'android'}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => <UserRow user={item} onFollowChange={handleFollowChange} />}
            ListFooterComponent={
              state.loadingMore ? (
                <View style={styles.center}><ActivityIndicator color={COLORS.PRIMARY} /></View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons
                  name={activeTab === 'followers' ? 'people-outline' : 'person-add-outline'}
                  size={40}
                  color={COLORS.GRAY_300}
                />
                <Text style={styles.emptyTitle}>
                  {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                </Text>
                <Text style={styles.emptyText}>
                  {activeTab === 'followers'
                    ? 'When people follow you, they will appear here.'
                    : 'Use the search icon on the Home tab to find residents to follow.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      {active && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  headerSafe: { backgroundColor: COLORS.PRIMARY },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  btnPressed: { opacity: 0.6 },
  title: { flex: 1, textAlign: 'center', color: COLORS.WHITE, fontSize: 17, fontWeight: '700' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.WHITE_90 },
  tabTextActive: { color: COLORS.WHITE, fontWeight: '700' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0, left: '20%', right: '20%',
    height: 3,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  body: { flex: 1 },
  list: { padding: 14, paddingBottom: 40 },
  center: { paddingVertical: 24, alignItems: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { color: COLORS.GRAY_900, fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptyText: { color: COLORS.GRAY_500, fontSize: 13, textAlign: 'center', marginTop: 4 },
});
