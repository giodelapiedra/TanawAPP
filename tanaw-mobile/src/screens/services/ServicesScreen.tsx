import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import {
  filterAllServices,
  QuickAction,
  ExploreCategory,
  QuickLink,
} from '../../constants/services';
import { AppStackNavigationProp, MainTabParamList } from '../../types/navigation.types';
import ServicesHero from '../../components/services/ServicesHero';
import QuickActionsTiles from '../../components/services/QuickActionsTiles';
import TransactionsPromoCard from '../../components/services/TransactionsPromoCard';
import ExploreServicesGrid from '../../components/services/ExploreServicesGrid';
import QuickLinksRow from '../../components/services/QuickLinksRow';
import PromoCard from '../../components/services/PromoCard';
import ServiceSearchBar from '../../components/services/ServiceSearchBar';
import ComingSoonModal from '../../components/common/ComingSoonModal';
import { CITY_NEWS_CHANNEL_URL } from '../../constants/urls';

type ServicesNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  AppStackNavigationProp
>;

export default function ServicesScreen() {
  const navigation = useNavigation<ServicesNavProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalFeature, setModalFeature] = useState<{ name: string; phase: string } | null>(null);

  const filtered = useMemo(() => filterAllServices(searchQuery), [searchQuery]);

  const openWebView = (url: string, title: string) =>
    navigation.navigate('WebView', { url, title });

  const openExternal = (url: string, fallbackTitle: string) => {
    Linking.openURL(url).catch(() => openWebView(url, fallbackTitle));
  };

  const handleStub = (name: string, phase: string) =>
    setModalFeature({ name, phase: phase || 'Phase 2' });

  const handleQuickAction = (a: QuickAction) => {
    if (a.url) return openWebView(a.url, a.name);
    handleStub(a.name, a.phase);
  };

  const handleExplore = (c: ExploreCategory) => {
    if (c.url) return openWebView(c.url, c.name);
    handleStub(c.name, c.phase);
  };

  const handleQuickLink = (l: QuickLink) => {
    if (l.url) return openWebView(l.url, l.label);
    handleStub(l.label, l.phase);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPad}
      >
        <ServicesHero
          onNotificationPress={() => navigation.navigate('Notifications')}
        />
        <View style={styles.searchCard}>
          <View style={styles.searchField}>
            <ServiceSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search permits, documents, appointments"
            />
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => handleStub('Service Filters', 'Phase 2')}
            accessibilityRole="button"
            accessibilityLabel="Filter services"
          >
            <Ionicons name="options-outline" size={20} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <QuickActionsTiles
            items={filtered.quickActions}
            onItemPress={handleQuickAction}
            onViewAllPress={() => handleStub('All Quick Actions', 'Phase 2')}
          />
        </View>

        <View style={styles.section}>
          <TransactionsPromoCard
            activeCount={0}
            onPress={() => handleStub('My Transactions', 'Phase 2')}
          />
        </View>

        <View style={styles.section}>
          <ExploreServicesGrid
            items={filtered.exploreCategories}
            onItemPress={handleExplore}
            onViewAllPress={() => handleStub('All Services', 'Phase 2')}
          />
        </View>

        <View style={styles.section}>
          <QuickLinksRow items={filtered.quickLinks} onItemPress={handleQuickLink} />
        </View>

        <View style={[styles.section, styles.promoRow]}>
          <PromoCard
            variant="danger"
            title="Emergency"
            subtitle="Live alerts, emergency hotlines & maps."
            ctaLabel="View Now"
            icon="warning"
            onPress={() => navigation.navigate('Emergency')}
          />
          <PromoCard
            variant="info"
            title="CGTV"
            subtitle="Watch live broadcasts from Tanauan City."
            ctaLabel="Watch Now"
            icon="videocam"
            onPress={() => openExternal(CITY_NEWS_CHANNEL_URL, 'CGTV')}
          />
        </View>
      </ScrollView>

      <ComingSoonModal
        visible={modalFeature !== null}
        onClose={() => setModalFeature(null)}
        featureName={modalFeature?.name ?? ''}
        phase={modalFeature?.phase ?? 'Phase 2'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  scrollPad: { paddingBottom: 32 },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: -30,
    marginBottom: 18,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    elevation: 6,
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.12)',
  },
  searchField: { flex: 1 },
  filterBtn: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },
  section: { marginBottom: 20 },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
});
