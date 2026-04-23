import React, { useState } from 'react';
import {
  View, Text, Modal, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { useAppDispatch } from '../../store';
import { setUser } from '../../store/slices/authSlice';
import * as usersApi from '../../api/users.api';

interface Props {
  visible: boolean;
  /** If true, user cannot dismiss until they agree (first-time flow). */
  blocking: boolean;
  onClose: () => void;
  onAgreed?: () => void;
}

interface Rule {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  title: string;
  desc: string;
}

const RULES: Rule[] = [
  {
    icon: 'heart-outline', color: COLORS.PRIMARY, bg: COLORS.PRIMARY_LIGHT,
    title: 'Be respectful',
    desc: 'Treat fellow kababayans with courtesy. No personal attacks, slurs, or harassment.',
  },
  {
    icon: 'ban-outline', color: COLORS.DANGER, bg: COLORS.DANGER_LIGHT,
    title: 'No spam or ads',
    desc: 'Do not post commercial promotions, link spam, or repeated content.',
  },
  {
    icon: 'newspaper-outline', color: COLORS.WARNING, bg: COLORS.WARNING_LIGHT,
    title: 'No fake news',
    desc: 'Verify before sharing. Misinformation about emergencies or government may be removed.',
  },
  {
    icon: 'people-outline', color: COLORS.SUCCESS, bg: COLORS.SUCCESS_LIGHT,
    title: 'Stay on topic',
    desc: 'Keep posts relevant to your barangay community — events, concerns, announcements.',
  },
  {
    icon: 'lock-closed-outline', color: COLORS.BLUE, bg: COLORS.BLUE_LIGHT,
    title: 'Protect privacy',
    desc: 'Do not share other people\'s personal data, phone numbers, or addresses without consent.',
  },
  {
    icon: 'shield-checkmark-outline', color: COLORS.PURPLE, bg: COLORS.PURPLE_LIGHT,
    title: 'No incitement',
    desc: 'No posts that promote violence, illegal activity, or political harassment.',
  },
];

export default function CommunityRulesModal({ visible, blocking, onClose, onAgreed }: Props) {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const handleAgree = async () => {
    setSaving(true);
    try {
      const updated = await usersApi.acceptCommunityRules();
      dispatch(setUser(updated));
      onAgreed?.();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to save agreement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={blocking ? undefined : onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          {!blocking && (
            <Pressable
              onPress={onClose}
              hitSlop={14}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            >
              <Ionicons name="close" size={24} color={COLORS.WHITE} />
            </Pressable>
          )}
          <Text style={styles.headerTitle}>
            {blocking ? 'Welcome' : 'Community Rules'}
          </Text>
          {!blocking && <View style={styles.headerSpacer} />}
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.intro}>
            <View style={styles.introIconBox}>
              <Ionicons name="sparkles-outline" size={28} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.introTitle}>Welcome to TANAW One Super App</Text>
            <Text style={styles.introDesc}>
              Isang official city super-app ng Tanauan City para sa mga residente. Gamitin ang app
              para mag-access sa e-services, barangay community feed, news, at iba pa.
            </Text>
          </View>

          <View style={styles.rulesIntro}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.PRIMARY} />
            <Text style={styles.rulesIntroText}>Community Guidelines</Text>
          </View>
          <Text style={styles.rulesSub}>
            Bago gumamit ng Community Feed, basahin at sumang-ayon sa mga patakaran:
          </Text>

          {RULES.map((rule, i) => (
            <View key={i} style={styles.rule}>
              <View style={[styles.ruleIcon, { backgroundColor: rule.bg }]}>
                <Ionicons name={rule.icon} size={18} color={rule.color} />
              </View>
              <View style={styles.ruleText}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleDesc}>{rule.desc}</Text>
              </View>
            </View>
          ))}

          <View style={styles.warning}>
            <Ionicons name="warning-outline" size={16} color={COLORS.WARNING} />
            <Text style={styles.warningText}>
              Ang mga posts na lumalabag sa patakaran ay maaaring tanggalin. Paulit-ulit na paglabag
              ay maaaring magresulta sa suspensyon ng account.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {!blocking ? (
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}
            >
              <Text style={styles.doneBtnText}>Close</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleAgree}
              disabled={saving}
              style={({ pressed }) => [
                styles.agreeBtn,
                pressed && styles.pressed,
                saving && styles.disabled,
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.WHITE} />
                  <Text style={styles.agreeBtnText}>I Agree — Sumasang-ayon ako</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  header: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 10,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', color: COLORS.WHITE, fontSize: 17, fontWeight: '700' },
  headerSpacer: { width: 40 },
  pressed: { opacity: 0.6 },

  scroll: { padding: 16, paddingBottom: 24 },

  intro: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, marginBottom: 18 },
  rulesIntro: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  rulesIntroText: { fontSize: 14, fontWeight: '700', color: COLORS.GRAY_900 },
  rulesSub: { fontSize: 12, color: COLORS.GRAY_500, marginBottom: 12, lineHeight: 17 },
  introIconBox: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  introTitle: { fontSize: 18, fontWeight: '800', color: COLORS.GRAY_900, marginBottom: 6 },
  introDesc: { fontSize: 13, color: COLORS.GRAY_500, textAlign: 'center', lineHeight: 19 },

  rule: {
    flexDirection: 'row', gap: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
  },
  ruleIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  ruleText: { flex: 1 },
  ruleTitle: { fontSize: 14, fontWeight: '700', color: COLORS.GRAY_900, marginBottom: 2 },
  ruleDesc: { fontSize: 12, color: COLORS.GRAY_500, lineHeight: 17 },

  warning: {
    flexDirection: 'row', gap: 8,
    backgroundColor: COLORS.WARNING_LIGHT,
    borderRadius: RADIUS.md,
    padding: 12,
    marginTop: 10,
  },
  warningText: { flex: 1, fontSize: 12, color: COLORS.GRAY_700, lineHeight: 17 },

  footer: {
    padding: 14,
    borderTopWidth: 1, borderTopColor: COLORS.GRAY_100,
    backgroundColor: COLORS.WHITE,
  },
  agreeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  agreeBtnText: { color: COLORS.WHITE, fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.6 },

  doneBtn: {
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.GRAY_50,
    alignItems: 'center',
  },
  doneBtnText: { color: COLORS.GRAY_700, fontSize: 14, fontWeight: '700' },
});
