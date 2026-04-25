import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator,
  Modal, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchDigitalIdThunk } from '../../store/slices/userSlice';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { getInitials, getFullName } from '../../utils/format';
import TanawIDCard from '../../components/id-card/TanawIDCard';
import ComingSoonModal from '../../components/common/ComingSoonModal';
import ScreenHeader from '../../components/common/ScreenHeader';

type Enlarged = 'id' | 'qr' | null;

export default function DigitalIDScreen() {
  const dispatch = useAppDispatch();
  const idData = useAppSelector((s) => s.user.digitalIdData);
  const user = useAppSelector((s) => s.auth.user);
  const isLoading = useAppSelector((s) => s.user.isLoading);

  const [enlarged, setEnlarged] = useState<Enlarged>(null);
  const [stubFeature, setStubFeature] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchDigitalIdThunk()); }, [dispatch]);

  if (isLoading || !idData) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  const fullName = getFullName(idData.firstName, idData.lastName, idData.middleName, idData.suffix);
  const initials = getInitials(idData.firstName, idData.lastName);

  const qrPayload = JSON.stringify({
    tanawId: idData.tanawId,
    name: fullName,
    role: idData.role,
    barangay: idData.barangay?.name,
    issued: idData.createdAt,
  });

  return (
    <View style={styles.root}>
      <ScreenHeader title="Digital IDs" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile header */}
        <View style={styles.profileBlock}>
          <View style={styles.avatarWrap}>
            {idData.profilePhoto ? (
              <Image
                key={idData.profilePhoto}
                source={{ uri: idData.profilePhoto }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.avatarEditBadge}
              onPress={() => setStubFeature('Change Profile Photo')}
              accessibilityLabel="Edit photo"
              hitSlop={6}
            >
              <Ionicons name="create" size={14} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{fullName.toUpperCase()}</Text>
          {user?.email && <Text style={styles.contact}>{user.email}</Text>}
          {user?.phone && <Text style={styles.contact}>{user.phone}</Text>}
        </View>

        {/* ID card (with subtle stack backdrop for depth) */}
        <View style={styles.cardStack}>
          <View style={styles.cardShadow} />
          <TanawIDCard idData={idData} gender={user?.gender} />
        </View>

        {/* Enlarge pills */}
        <View style={styles.enlargeRow}>
          <TouchableOpacity
            style={styles.enlargePill}
            onPress={() => setEnlarged('id')}
            activeOpacity={0.8}
          >
            <Text style={styles.enlargePillText}>Enlarge ID</Text>
            <Ionicons name="expand-outline" size={14} color={COLORS.PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.enlargePill}
            onPress={() => setEnlarged('qr')}
            activeOpacity={0.8}
          >
            <Text style={styles.enlargePillText}>Enlarge QR</Text>
            <Ionicons name="qr-code-outline" size={14} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Enlarge modal */}
      <Modal
        visible={enlarged !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEnlarged(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEnlarged(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => { /* swallow */ }}>
            {enlarged === 'qr' ? (
              <View style={styles.qrModalBox}>
                <Text style={styles.qrModalLabel}>TANAW ID</Text>
                <Text style={styles.qrModalId}>{idData.tanawId}</Text>
                <View style={styles.qrModalCode}>
                  <QRCode value={qrPayload} size={240} backgroundColor={COLORS.WHITE} />
                </View>
                <Text style={styles.qrModalHint}>Scan to verify identity</Text>
              </View>
            ) : (
              <View style={styles.idModalBox}>
                <TanawIDCard idData={idData} gender={user?.gender} qrSize={100} />
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
  scrollContent: { paddingBottom: 120 },

  profileBlock: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 4, paddingBottom: 18 },
  avatarWrap: { marginBottom: 14 },
  avatar: { width: 116, height: 116, borderRadius: 58, backgroundColor: COLORS.GRAY_100 },
  avatarFallback: {
    width: 116, height: 116, borderRadius: 58,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { color: COLORS.PRIMARY, fontSize: 38, fontWeight: '800' },
  avatarEditBadge: {
    position: 'absolute', right: 2, bottom: 2,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 3, borderColor: COLORS.OFF_WHITE,
    justifyContent: 'center', alignItems: 'center',
  },
  name: {
    color: COLORS.GRAY_900, fontSize: 16, fontWeight: '800',
    textAlign: 'center', letterSpacing: 0.4, marginBottom: 8,
  },
  contact: { color: COLORS.GRAY_500, fontSize: 13, fontWeight: '500', marginTop: 2 },

  cardStack: { marginHorizontal: 20, marginTop: 8, marginBottom: 18 },
  cardShadow: {
    position: 'absolute', top: -10, left: 14, right: 14, height: 30,
    backgroundColor: COLORS.WHITE, borderRadius: 18, opacity: 0.85,
    elevation: 4, boxShadow: '0px 4px 10px rgba(0,0,0,0.08)',
  },

  enlargeRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 4 },
  enlargePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: RADIUS.full, paddingVertical: 10, paddingHorizontal: 18,
  },
  enlargePillText: { color: COLORS.PRIMARY, fontSize: 13, fontWeight: '700' },

  modalOverlay: {
    flex: 1, backgroundColor: COLORS.OVERLAY,
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  qrModalBox: {
    backgroundColor: COLORS.WHITE, borderRadius: RADIUS.xl,
    padding: 24, alignItems: 'center', minWidth: 280,
  },
  qrModalLabel: { color: COLORS.GRAY_300, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  qrModalId: {
    color: COLORS.PRIMARY, fontSize: 20, fontWeight: '800',
    letterSpacing: 1, marginTop: 4, marginBottom: 16,
  },
  qrModalCode: { padding: 10, backgroundColor: COLORS.WHITE, borderRadius: RADIUS.md },
  qrModalHint: { color: COLORS.GRAY_500, fontSize: 12, marginTop: 14 },
  idModalBox: { width: '100%', maxWidth: 380 },
});
