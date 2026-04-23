import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../types/navigation.types';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

export default function WelcomeScreen() {
  const navigation = useNavigation<AuthNavigationProp>();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <Image
          source={require('../../../assets/TANAUAN SEAL.png')}
          style={styles.seal}
          resizeMode="contain"
        />
        <Text style={styles.title}>TANAW</Text>
        <Text style={styles.subtitle}>ONE APP</Text>
        <Text style={styles.cityName}>City Government of Tanauan</Text>
        <Text style={styles.tagline}>
          Your digital gateway to all services of the City of Tanauan, Batangas.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>48</Text>
            <Text style={styles.statLabel}>BARANGAYS</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>1</Text>
            <Text style={styles.statLabel}>DIGITAL ID</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{'+'}</Text>
            <Text style={styles.statLabel}>SERVICES</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('RoleSelect')} activeOpacity={0.8}>
          <Text style={styles.btnPrimaryText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
          <Text style={styles.btnOutlineText}>Already have an account? Login</Text>
        </TouchableOpacity>
        <Text style={styles.footer}>Official App — Lungsod ng Tanauan, Batangas</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.PRIMARY },
  top: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  seal: { width: 110, height: 110, borderRadius: 55 },
  title: { color: COLORS.WHITE, fontSize: 38, fontWeight: '800', letterSpacing: -1, marginTop: 14 },
  subtitle: { color: COLORS.WHITE, fontSize: 11, fontWeight: '600', letterSpacing: 6, opacity: 0.6, marginTop: 2 },
  cityName: { color: COLORS.GOLD, fontSize: 13, fontWeight: '700', marginTop: 10, letterSpacing: 0.5 },
  tagline: { color: COLORS.WHITE, fontSize: 14, textAlign: 'center', opacity: 0.7, lineHeight: 22, marginTop: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 28 },
  stat: { alignItems: 'center' },
  statNum: { color: COLORS.WHITE, fontSize: 22, fontWeight: '700' },
  statLabel: { color: COLORS.WHITE, fontSize: 9, opacity: 0.5, marginTop: 2, letterSpacing: 1 },
  divider: { width: 1, height: 28, backgroundColor: COLORS.WHITE_15 },
  bottom: { paddingHorizontal: 24, paddingBottom: 36, gap: 12 },
  btnPrimary: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.lg, paddingVertical: 16 },
  btnPrimaryText: { color: COLORS.PRIMARY, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  btnOutline: { borderWidth: 1.5, borderColor: COLORS.WHITE_25, borderRadius: RADIUS.lg, paddingVertical: 16 },
  btnOutlineText: { color: COLORS.WHITE, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  footer: { color: COLORS.WHITE, fontSize: 10, opacity: 0.3, textAlign: 'center', marginTop: 8 },
});
