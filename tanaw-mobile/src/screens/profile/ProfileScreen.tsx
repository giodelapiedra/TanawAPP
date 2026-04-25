import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, Alert, Linking, StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store';
import { AppStackNavigationProp } from '../../types/navigation.types';
import { logoutThunk } from '../../store/slices/authSlice';
import { fetchProfileThunk, updateProfilePhotoThunk } from '../../store/slices/userSlice';
import { pickSingleImage } from '../../utils/imagePicker.util';
import * as followsApi from '../../api/follows.api';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { getInitials, getFullName } from '../../utils/format';
import AccountHeaderCard from '../../components/profile/AccountHeaderCard';
import MenuListItem from '../../components/profile/MenuListItem';
import ComingSoonModal from '../../components/common/ComingSoonModal';
import {
  CITY_NEWS_CHANNEL_URL,
  FB_CITY_URL,
  FB_MAYOR_URL,
  FB_CONG_URL,
  TANAW_WEBSITE,
  SUPPORT_EMAIL,
} from '../../constants/urls';

const FOLLOW_LINKS: { key: string; icon: Parameters<typeof MenuListItem>[0]['icon']; label: string; hint: string; url: string; webview?: boolean }[] = [
  { key: 'fb-city', icon: 'logo-facebook', label: 'City of Tanauan', hint: 'Official Facebook page', url: FB_CITY_URL },
  { key: 'fb-mayor', icon: 'logo-facebook', label: 'Mayor Sonny Collantes', hint: 'Mayor\'s official page', url: FB_MAYOR_URL },
  { key: 'fb-cong', icon: 'logo-facebook', label: 'Cong. King Collantes', hint: 'Congressman\'s page', url: FB_CONG_URL },
  { key: 'yt-cgtv', icon: 'logo-youtube', label: 'CGTV Channel', hint: 'Official YouTube channel', url: CITY_NEWS_CHANNEL_URL },
  { key: 'web', icon: 'globe-outline', label: 'Tanauan City Website', hint: 'tanauancity.gov.ph', url: TANAW_WEBSITE, webview: true },
];

interface Section {
  title: string;
  items: {
    key: string;
    icon: Parameters<typeof MenuListItem>[0]['icon'];
    label: string;
    hint?: string;
    onPress: () => void;
    destructive?: boolean;
  }[];
}

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<AppStackNavigationProp>();
  const user = useAppSelector((s) => s.auth.user);
  const isUpdating = useAppSelector((s) => s.user.isUpdating);
  const u = user;

  const [stubFeature, setStubFeature] = useState<string | null>(null);
  const [counts, setCounts] = useState<{ followers: number; following: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!u?.id) return;
      followsApi.getCounts(u.id).then(setCounts).catch(() => { /* silent */ });
    }, [u?.id])
  );

  const handleEditPhoto = async () => {
    try {
      const image = await pickSingleImage({ allowsEditing: true, aspect: [1, 1] });
      if (!image) return;
      const result = await dispatch(updateProfilePhotoThunk(image));
      if (updateProfilePhotoThunk.rejected.match(result)) {
        const resolved = result.payload;
        Alert.alert(
          resolved?.title ?? 'Upload failed',
          resolved?.message ?? 'Please try again'
        );
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not pick image';
      Alert.alert('Photo', msg);
    }
  };

  useEffect(() => { dispatch(fetchProfileThunk()); }, [dispatch]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutThunk()) },
    ]);
  };

  if (!u) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.PRIMARY} /></View>;
  }

  const initials = getInitials(u.firstName, u.lastName);
  const fullName = getFullName(u.firstName, u.lastName, u.middleName, u.suffix);

  const sections: Section[] = [
    {
      title: 'My Account',
      items: [
        {
          key: 'personal',
          icon: 'person-outline',
          label: 'Personal Information',
          hint: 'Name, address, and contact',
          onPress: () => navigation.navigate('PersonalInformation'),
        },
        {
          key: 'contact',
          icon: 'call-outline',
          label: 'Contact Us',
          hint: SUPPORT_EMAIL,
          onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {}),
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          key: 'about',
          icon: 'information-circle-outline',
          label: 'About TANAW',
          onPress: () => navigation.navigate('WebView', { url: TANAW_WEBSITE, title: 'About TANAW' }),
        },
        {
          key: 'privacy',
          icon: 'shield-checkmark-outline',
          label: 'Privacy Notice',
          onPress: () => setStubFeature('Privacy Notice'),
        },
        {
          key: 'faqs',
          icon: 'help-circle-outline',
          label: 'FAQs',
          onPress: () => setStubFeature('FAQs'),
        },
        {
          key: 'rate',
          icon: 'star-outline',
          label: 'Rate our app',
          onPress: () => setStubFeature('Rate our app'),
        },
        {
          key: 'settings',
          icon: 'options-outline',
          label: 'Settings',
          onPress: () => setStubFeature('Settings'),
        },
      ],
    },
    {
      title: 'Follow Us',
      items: FOLLOW_LINKS.map((l) => ({
        key: l.key,
        icon: l.icon,
        label: l.label,
        hint: l.hint,
        onPress: () => {
          if (l.webview) {
            navigation.navigate('WebView', { url: l.url, title: l.label });
          } else {
            Linking.openURL(l.url).catch(() => {});
          }
        },
      })),
    },
  ];

  return (
    <View style={styles.root}>
      <AccountHeaderCard
        fullName={fullName}
        phone={u.phone}
        email={u.email}
        tanawId={u.tanawId}
        photoUrl={u.profilePhoto}
        initials={initials}
        onEditPhoto={handleEditPhoto}
        isUploading={isUpdating}
        followerCount={counts?.followers ?? null}
        followingCount={counts?.following ?? null}
        onFollowersPress={() => navigation.navigate('Follows', { initialTab: 'followers' })}
        onFollowingPress={() => navigation.navigate('Follows', { initialTab: 'following' })}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => (
                <MenuListItem
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  hint={item.hint}
                  onPress={item.onPress}
                  isLast={idx === section.items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <View style={styles.card}>
            <MenuListItem
              icon="log-out-outline"
              label="Log out"
              onPress={handleLogout}
              destructive
              isLast
            />
          </View>
        </View>

        <Text style={styles.versionText}>TANAW One App • v1.0.0</Text>
      </ScrollView>

      <ComingSoonModal
        visible={stubFeature !== null}
        onClose={() => setStubFeature(null)}
        featureName={stubFeature ?? ''}
        phase="Phase 2"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.OFF_WHITE },
  scrollPad: { paddingTop: 18, paddingBottom: 140, paddingHorizontal: 16 },
  section: { marginBottom: 16 },
  sectionTitle: {
    color: COLORS.GRAY_500, fontSize: 11, fontWeight: '800',
    letterSpacing: 1.5, textTransform: 'uppercase',
    marginBottom: 8, marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
    overflow: 'hidden',
  },
  versionText: {
    color: COLORS.GRAY_300, fontSize: 11, fontWeight: '600',
    textAlign: 'center', marginTop: 8, letterSpacing: 0.5,
  },
});
