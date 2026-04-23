import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

interface Props {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
  phase?: string;
}

export default function ComingSoonModal({ visible, onClose, featureName, phase = 'Phase 2' }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.card}>
          <Image source={require('../../../assets/TANAUAN SEAL.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Coming Soon!</Text>
          <Text style={styles.feature}>{featureName ?? 'This feature'}</Text>
          <Text style={styles.desc}>This feature will be available in the next update of TANAW One App.</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{phase} Feature</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Got it!</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.OVERLAY, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: COLORS.WHITE, borderRadius: 24, padding: 28, marginHorizontal: 40, alignItems: 'center', width: '85%' },
  logo: { width: 56, height: 56, borderRadius: 28 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.GRAY_900, marginTop: 16 },
  feature: { fontSize: 16, fontWeight: '700', color: COLORS.PRIMARY, marginTop: 6 },
  desc: { fontSize: 13, color: COLORS.GRAY_500, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  badge: { backgroundColor: COLORS.PRIMARY_LIGHT, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 4, marginTop: 12 },
  badgeText: { color: COLORS.PRIMARY, fontSize: 11, fontWeight: '700' },
  button: { backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.md, paddingVertical: 14, width: '100%', marginTop: 20 },
  buttonText: { color: COLORS.WHITE, fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
