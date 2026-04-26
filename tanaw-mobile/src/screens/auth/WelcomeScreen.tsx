import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthNavigationProp } from '../../types/navigation.types';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import TanauanBackdrop from '../../components/common/TanauanBackdrop';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BLOB_SIZE = SCREEN_WIDTH * 0.9;

export default function WelcomeScreen() {
  const navigation = useNavigation<AuthNavigationProp>();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[COLORS.PRIMARY_DEEPER, COLORS.PRIMARY_DARK, COLORS.PRIMARY]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blobTop]} pointerEvents="none" />
      <View style={[styles.blob, styles.blobBottom]} pointerEvents="none" />
      <TanauanBackdrop variant="light" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.officialPill}>
            <Ionicons name="shield-checkmark" size={11} color={COLORS.GOLD} />
            <Text style={styles.officialPillText}>OFFICIAL CITY APP</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Image
            source={require('../../../assets/TANAUAN SEAL.png')}
            style={styles.seal}
            resizeMode="contain"
          />

          <Text style={styles.wordmark}>TANAW</Text>
          <View style={styles.goldUnderline} />
          <Text style={styles.wordmarkSub}>O N E   A P P</Text>

          <Text style={styles.cityLine}>City Government of Tanauan</Text>

          <Text style={styles.tagline}>
            Your digital gateway to every service of the
            {'\n'}
            City of Tanauan, Batangas.
          </Text>

          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Ionicons name="card-outline" size={13} color={COLORS.GOLD} />
              <Text style={styles.chipText}>Digital ID</Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="people-outline" size={13} color={COLORS.GOLD} />
              <Text style={styles.chipText}>48 Barangays</Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="grid-outline" size={13} color={COLORS.GOLD} />
              <Text style={styles.chipText}>City Services</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
            onPress={() => navigation.navigate('RoleSelect')}
            accessibilityRole="button"
            accessibilityLabel="Create an account"
          >
            <Text style={styles.btnPrimaryText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.PRIMARY} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnGhost, pressed && styles.btnGhostPressed]}
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel="Log in to existing account"
          >
            <Text style={styles.btnGhostText}>
              Already have an account?  <Text style={styles.btnGhostLink}>Log in</Text>
            </Text>
          </Pressable>

          <View style={styles.footerRow}>
            <View style={styles.footerDot} />
            <Text style={styles.footerText}>Lungsod ng Tanauan, Batangas</Text>
            <View style={styles.footerDot} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.PRIMARY_DEEPER },
  safe: { flex: 1, paddingHorizontal: 24 },

  blob: {
    position: 'absolute',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
    backgroundColor: COLORS.WHITE,
    opacity: 0.04,
  },
  blobTop: { top: -BLOB_SIZE * 0.45, right: -BLOB_SIZE * 0.35 },
  blobBottom: { bottom: -BLOB_SIZE * 0.5, left: -BLOB_SIZE * 0.4 },

  topBar: { alignItems: 'center', paddingTop: 8 },
  officialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.WHITE_15,
    borderWidth: 1,
    borderColor: COLORS.WHITE_25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  officialPillText: {
    color: COLORS.GOLD,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // No frame, no shadow — logo sits flat on the red gradient.
  seal: {
    width: 132,
    height: 132,
    marginBottom: 18,
  },

  wordmark: {
    color: COLORS.WHITE,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 4,
  },
  goldUnderline: {
    width: 56,
    height: 3,
    backgroundColor: COLORS.GOLD,
    borderRadius: 2,
    marginTop: 10,
  },
  wordmarkSub: {
    color: COLORS.WHITE_90,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 8,
    marginTop: 10,
  },

  cityLine: {
    color: COLORS.GOLD,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 14,
  },
  tagline: {
    color: COLORS.WHITE_90,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
    paddingHorizontal: 12,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.WHITE_15,
    borderWidth: 1,
    borderColor: COLORS.WHITE_25,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  bottom: { paddingBottom: 8, gap: 12 },
  btnPrimary: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.lg,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 6,
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.18)',
  },
  btnPrimaryPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  btnPrimaryText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  btnGhost: { paddingVertical: 14, alignItems: 'center' },
  btnGhostPressed: { opacity: 0.6 },
  btnGhostText: { color: COLORS.WHITE_90, fontSize: 14, fontWeight: '500' },
  btnGhostLink: { color: COLORS.GOLD, fontWeight: '800' },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  footerDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.WHITE_25 },
  footerText: {
    color: COLORS.WHITE_90,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    opacity: 0.7,
  },
});
