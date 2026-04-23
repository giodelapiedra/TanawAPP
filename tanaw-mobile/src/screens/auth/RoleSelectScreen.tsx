import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../types/navigation.types';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

type Role = 'RESIDENT' | 'BARANGAY_OFFICIAL' | 'GOVERNMENT_EMPLOYEE';

const ROLES: { key: Role; icon: keyof typeof Ionicons.glyphMap; iconBg: string; iconColor: string; name: string; desc: string; badge: string }[] = [
  { key: 'RESIDENT', icon: 'home-outline', iconBg: COLORS.GOLD_LIGHT, iconColor: '#D4910A', name: 'City Resident', desc: 'Open for all residents of Tanauan City', badge: 'Resident' },
  { key: 'BARANGAY_OFFICIAL', icon: 'people-outline', iconBg: COLORS.BLUE_LIGHT, iconColor: COLORS.BLUE, name: 'Barangay Official', desc: 'For Captains, Kagawad, and SK Officials', badge: 'Official' },
  { key: 'GOVERNMENT_EMPLOYEE', icon: 'business-outline', iconBg: COLORS.SUCCESS_LIGHT, iconColor: COLORS.SUCCESS, name: "Gov't Employee", desc: 'For City Government employees', badge: 'Employee' },
];

export default function RoleSelectScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const [selected, setSelected] = useState<Role>('RESIDENT');

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image source={require('../../../assets/TANAUAN SEAL.png')} style={styles.headerSeal} resizeMode="contain" />
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>Choose Account Type</Text>
            <Text style={styles.headerDesc}>Select the type of account to receive your TANAW ID.</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {ROLES.map((r) => {
          const active = selected === r.key;
          return (
            <TouchableOpacity key={r.key} style={[styles.card, active && styles.cardActive]} onPress={() => setSelected(r.key)} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: r.iconBg }]}>
                <Ionicons name={r.icon} size={22} color={r.iconColor} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{r.name}</Text>
                <Text style={styles.cardDesc}>{r.desc}</Text>
              </View>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>{r.badge}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.notice}>
          <Ionicons name="information-circle" size={18} color={COLORS.GOLD} />
          <Text style={styles.noticeText}>Barangay Officials and Gov't Employees need a special code to register.</Text>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('Register', { role: selected })} activeOpacity={0.8}>
          <View style={styles.continueBtnContent}>
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.WHITE} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  header: { backgroundColor: COLORS.PRIMARY, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerSeal: { width: 48, height: 48, borderRadius: 24 },
  headerTextCol: { flex: 1 },
  headerTitle: { color: COLORS.WHITE, fontSize: 20, fontWeight: '800' },
  headerDesc: { color: COLORS.WHITE, fontSize: 12, opacity: 0.75, marginTop: 4, lineHeight: 18 },
  body: { flex: 1 },
  bodyContent: { padding: 16 },
  card: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.GRAY_100 },
  cardActive: { borderColor: COLORS.PRIMARY, backgroundColor: COLORS.PRIMARY_LIGHT },
  iconBox: { width: 48, height: 48, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardName: { color: COLORS.GRAY_900, fontSize: 15, fontWeight: '700' },
  cardDesc: { color: COLORS.GRAY_500, fontSize: 12, lineHeight: 17, marginTop: 3 },
  idBadge: { backgroundColor: COLORS.PRIMARY_LIGHT, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 4 },
  idBadgeText: { color: COLORS.PRIMARY, fontSize: 11, fontWeight: '700' },
  notice: { backgroundColor: COLORS.GOLD_LIGHT, borderWidth: 1, borderColor: COLORS.GOLD, borderRadius: RADIUS.md, padding: 14, flexDirection: 'row', gap: 8, marginTop: 4 },
  noticeIcon: { marginTop: 1 },
  noticeText: { color: COLORS.GRAY_700, fontSize: 12, lineHeight: 17, flex: 1 },
  continueBtn: { backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.lg, paddingVertical: 16, marginTop: 16 },
  continueBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  continueBtnText: { color: COLORS.WHITE, fontSize: 16, fontWeight: '700' },
});
