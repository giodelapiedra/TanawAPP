import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as notificationsApi from '../../api/notifications.api';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { AppStackNavigationProp, MainTabParamList } from '../../types/navigation.types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import WelcomeRulesModal from '../../components/common/WelcomeRulesModal';
import AppTopBar from '../../components/common/AppTopBar';
import CommunityGroup from '../../components/community/CommunityGroup';
import FeedList from '../../components/feed/FeedList';
import UserSearchModal from '../../components/feed/UserSearchModal';
import { useAppSelector } from '../../store';

type TopTab = 'public' | 'community';

export default function HomeScreen() {
  const navigation = useNavigation<CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    AppStackNavigationProp
  >>();
  const [topTab, setTopTab] = useState<TopTab>('public');
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const acceptedRulesAt = useAppSelector((s) => s.auth.user?.acceptedCommunityRulesAt);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    if (acceptedRulesAt === null || acceptedRulesAt === undefined) {
      setWelcomeOpen(true);
    }
  }, [acceptedRulesAt]);

  const refreshUnreadCount = useCallback(() => {
    notificationsApi.getUnreadCount()
      .then((res) => setUnreadCount(res.count))
      .catch(() => { /* silent */ });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount();
    }, [refreshUnreadCount])
  );

  useEffect(() => {
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  return (
    <View style={styles.root}>
      <AppTopBar
        onSearchPress={() => setSearchOpen(true)}
        onNotificationPress={() => navigation.navigate('Notifications')}
        unreadCount={unreadCount}
      >
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, topTab === 'public' && styles.tabActive]}
            onPress={() => setTopTab('public')}
          >
            <Text style={[styles.tabText, topTab === 'public' && styles.tabTextActive]}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, topTab === 'community' && styles.tabActive]}
            onPress={() => setTopTab('community')}
          >
            <Text style={[styles.tabText, topTab === 'community' && styles.tabTextActive]}>Community Feed</Text>
          </TouchableOpacity>
        </View>
      </AppTopBar>

      <View style={styles.body}>
        {topTab === 'public' ? <FeedList /> : <CommunityGroup />}
      </View>

      <UserSearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <WelcomeRulesModal
        visible={welcomeOpen}
        blocking
        onClose={() => setWelcomeOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  body: { flex: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: 14, marginTop: 14, marginBottom: 10, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.WHITE_15,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.WHITE },
  tabText: { color: COLORS.WHITE_90, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.PRIMARY, fontWeight: '700' },
});
