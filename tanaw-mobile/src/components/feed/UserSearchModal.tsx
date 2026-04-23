import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Modal, FlatList, ActivityIndicator,
  Pressable, TouchableOpacity, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { UserCard } from '../../types/post.types';
import { AppStackNavigationProp } from '../../types/navigation.types';
import * as feedApi from '../../api/feed.api';
import UserRow from '../user/UserRow';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function UserSearchModal({ visible, onClose }: Props) {
  const navigation = useNavigation<AppStackNavigationProp>();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [users, setUsers] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setDebounced('');
      setUsers([]);
      setNextCursor(null);
      setError(null);
    }
  }, [visible]);

  const runSearch = useCallback(async (q: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await feedApi.discoverUsers({ q, limit: PAGE_SIZE });
      setUsers(res.items);
      setNextCursor(res.nextCursor);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Search failed');
      setUsers([]);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (!debounced) {
      setUsers([]);
      setNextCursor(null);
      setLoading(false);
      return;
    }
    runSearch(debounced);
  }, [debounced, visible, runSearch]);

  const loadMore = async () => {
    if (loadingMoreRef.current || !nextCursor || !debounced) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await feedApi.discoverUsers({ q: debounced, cursor: nextCursor, limit: PAGE_SIZE });
      setUsers((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } catch { /* silent */ } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isFollowedByMe: isFollowing } : u)));
  };

  const handleOpenProfile = (user: UserCard) => {
    // Close the modal first, then navigate — otherwise the profile screen
    // renders under the modal and is not visible to the user.
    onClose();
    navigation.navigate('UserProfile', { userId: user.id });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.btnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.GRAY_900} />
          </Pressable>
          <Text style={styles.title}>Find people</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.GRAY_500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by TANAW ID or name…"
            placeholderTextColor={COLORS.GRAY_500}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={COLORS.GRAY_300} />
            </TouchableOpacity>
          )}
        </View>

        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <FlatList
            data={users}
            keyExtractor={(u) => u.id}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            initialNumToRender={12}
            windowSize={7}
            removeClippedSubviews={Platform.OS === 'android'}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => (
              <UserRow
                user={item}
                onFollowChange={handleFollowChange}
                onPress={handleOpenProfile}
              />
            )}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.centered}><ActivityIndicator color={COLORS.PRIMARY} /></View>
              ) : null
            }
            ListEmptyComponent={
              !debounced ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="search-outline" size={40} color={COLORS.GRAY_300} />
                  <Text style={styles.emptyTitle}>Find residents to follow</Text>
                  <Text style={styles.emptySub}>
                    Type a TANAW ID (e.g., TAN-RES-2026-00001) or a name.
                  </Text>
                </View>
              ) : loading ? (
                <View style={styles.centered}><ActivityIndicator color={COLORS.PRIMARY} /></View>
              ) : error ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="alert-circle-outline" size={36} color={COLORS.GRAY_300} />
                  <Text style={styles.emptyTitle}>Search error</Text>
                  <Text style={styles.emptySub}>{error}</Text>
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Ionicons name="person-outline" size={40} color={COLORS.GRAY_300} />
                  <Text style={styles.emptyTitle}>No match</Text>
                  <Text style={styles.emptySub}>No users found for &quot;{debounced}&quot;.</Text>
                </View>
              )
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.WHITE },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.GRAY_100,
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  btnPressed: { opacity: 0.6 },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: COLORS.GRAY_900 },
  headerSpacer: { width: 44 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.OFF_WHITE,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    height: 44,
    marginHorizontal: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.GRAY_900, padding: 0 },
  body: { flex: 1 },
  list: { paddingHorizontal: 14, paddingBottom: 40, flexGrow: 1 },
  centered: { paddingVertical: 24, alignItems: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { color: COLORS.GRAY_900, fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptySub: { color: COLORS.GRAY_500, fontSize: 13, textAlign: 'center', marginTop: 4 },
});

