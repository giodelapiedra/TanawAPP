import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../../constants/colors';
import { DigitalIdData, Gender } from '../../types/user.types';
import {
  getInitials, getFullName, formatRoleTagalog, formatDate, formatStatus, formatGender,
} from '../../utils/format';

interface Props {
  idData: DigitalIdData;
  gender?: Gender | string;
  qrSize?: number;
  style?: ViewStyle;
  photoVersion?: string | null;
}

export default function TanawIDCard({ idData, gender, qrSize = 80, style, photoVersion }: Props) {
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
    <View style={[styles.card, style]}>
      <View style={styles.cardTop}>
        <View style={styles.cardTopRow}>
          <Image
            source={require('../../../assets/TANAUAN SEAL.png')}
            style={styles.cardLogo}
            resizeMode="contain"
          />
          <View style={styles.cardLogoInfo}>
            <Text style={styles.cardAppName}>TANAW ONE APP</Text>
            <Text style={styles.cardCity}>CITY OF TANAUAN</Text>
          </View>
          <Ionicons name="flag-outline" size={16} color={COLORS.WHITE_25} />
        </View>

        <View style={styles.cardProfile}>
          {idData.profilePhoto ? (
            <Image
              key={`${idData.profilePhoto}:${photoVersion ?? ''}`}
              source={{ uri: idData.profilePhoto }}
              style={styles.photoCircle}
            />
          ) : (
            <View style={styles.photoCircle}>
              <Text style={styles.photoInitials}>{initials}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={2}>
              {fullName.toUpperCase()}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{formatRoleTagalog(idData.role)}</Text>
            </View>
            <Text style={styles.profileLocation}>
              Brgy. {idData.barangay?.name ?? 'N/A'}, Tanauan City
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardMiddle}>
        <View style={styles.idRow}>
          <View style={styles.idLeft}>
            <Text style={styles.idLabel}>TANAW ID NUMBER</Text>
            <Text style={styles.idValue}>{idData.tanawId}</Text>
          </View>
          <View style={styles.qrBox}>
            <QRCode value={qrPayload} size={qrSize} backgroundColor={COLORS.GRAY_50} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoCellLabel}>DATE ISSUED</Text>
            <Text style={styles.infoCellValue}>{formatDate(idData.createdAt)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoCellLabel}>DATE OF BIRTH</Text>
            <Text style={styles.infoCellValue}>{formatDate(idData.birthDate)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoCellLabel}>STATUS</Text>
            <Text style={styles.infoCellValue}>{formatStatus(idData.status)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoCellLabel}>GENDER</Text>
            <Text style={styles.infoCellValue}>{formatGender(gender ?? '')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerUrl}>tanaw.tanauan.gov.ph</Text>
        <Text style={styles.footerVerified}>VERIFIED</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
    boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.18)',
    backgroundColor: COLORS.WHITE,
  },
  cardTop: { backgroundColor: COLORS.PRIMARY_DEEPER, padding: 18 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  cardLogo: { width: 30, height: 30, borderRadius: 15 },
  cardLogoInfo: { flex: 1, marginLeft: 8 },
  cardAppName: { color: COLORS.WHITE, fontSize: 13, fontWeight: '700' },
  cardCity: { color: COLORS.WHITE, fontSize: 9, opacity: 0.6, letterSpacing: 2 },
  cardProfile: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 14 },
  photoCircle: {
    width: 64, height: 64, borderRadius: 14,
    backgroundColor: COLORS.WHITE_15,
    borderWidth: 2, borderColor: COLORS.WHITE_25,
    justifyContent: 'center', alignItems: 'center',
  },
  photoInitials: { color: COLORS.WHITE, fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { color: COLORS.WHITE, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  roleBadge: {
    backgroundColor: COLORS.GOLD, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start', marginTop: 6,
  },
  roleBadgeText: { color: COLORS.GRAY_900, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  profileLocation: { color: COLORS.WHITE, fontSize: 11, opacity: 0.7, marginTop: 5 },
  cardMiddle: { backgroundColor: COLORS.WHITE, padding: 16 },
  idRow: { flexDirection: 'row', alignItems: 'center' },
  idLeft: { flex: 1 },
  idLabel: { color: COLORS.GRAY_300, fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  idValue: { color: COLORS.PRIMARY, fontSize: 18, fontWeight: '800', letterSpacing: 1, marginTop: 4 },
  qrBox: {
    borderRadius: 10, backgroundColor: COLORS.GRAY_50,
    padding: 4, borderWidth: 1, borderColor: COLORS.GRAY_100,
  },
  divider: { height: 1, backgroundColor: COLORS.GRAY_100, marginVertical: 14 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  infoCell: { width: '50%', marginBottom: 12 },
  infoCellLabel: { color: COLORS.GRAY_300, fontSize: 9, letterSpacing: 1.5, fontWeight: '600' },
  infoCellValue: { color: COLORS.GRAY_700, fontSize: 13, fontWeight: '600', marginTop: 3 },
  cardFooter: {
    backgroundColor: COLORS.GRAY_50,
    paddingVertical: 10, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  footerUrl: { color: COLORS.GRAY_300, fontSize: 9 },
  footerVerified: { color: COLORS.SUCCESS, fontSize: 9, fontWeight: '700' },
});
