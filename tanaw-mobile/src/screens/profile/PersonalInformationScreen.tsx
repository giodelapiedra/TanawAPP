import React from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppStackNavigationProp } from '../../types/navigation.types';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { getInitials, getFullName, formatRole, formatStatus, formatDate, formatGender } from '../../utils/format';
import { RHFInput } from '../../components/common/RHFFields';
import ErrorMessage from '../../components/common/ErrorMessage';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useProfileEdit } from '../../hooks/useProfileEdit';

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  );
}

export default function PersonalInformationScreen() {
  const navigation = useNavigation<AppStackNavigationProp>();
  const {
    user, form, isEditing, isUpdating, apiError,
    startEditing, cancelEditing, save,
  } = useProfileEdit();

  if (!user) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.PRIMARY} /></View>;
  }

  const initials = getInitials(user.firstName, user.lastName);
  const fullName = getFullName(user.firstName, user.lastName, user.middleName, user.suffix);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Personal Information"
        onBackPress={() => navigation.goBack()}
        rightAction={!isEditing ? {
          icon: 'create-outline',
          onPress: startEditing,
          accessibilityLabel: 'Edit',
        } : undefined}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile block */}
        <View style={styles.profileBlock}>
          {user.profilePhoto ? (
            <Image
              key={`${user.profilePhoto}:${user.updatedAt}`}
              source={{ uri: user.profilePhoto }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <Text style={styles.fullName}>{fullName}</Text>
          <View style={styles.tanawIdPill}>
            <Ionicons name="card-outline" size={12} color={COLORS.GOLD} />
            <Text style={styles.tanawId}>{user.tanawId}</Text>
          </View>
          <View style={styles.chipRow}>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>{formatRole(user.role)}</Text>
            </View>
            <View style={[styles.statusChip, user.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive]}>
              <View style={[styles.statusDot, { backgroundColor: user.status === 'ACTIVE' ? COLORS.SUCCESS : COLORS.DANGER }]} />
              <Text style={[styles.statusChipText, { color: user.status === 'ACTIVE' ? COLORS.SUCCESS : COLORS.DANGER }]}>
                {formatStatus(user.status)}
              </Text>
            </View>
          </View>
        </View>

        {apiError && <ErrorMessage message={apiError} />}

        {isEditing ? (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Edit Personal Information</Text>
              <View style={styles.editRow}>
                <View style={styles.flex1}>
                  <RHFInput control={form.control} name="firstName" label="First Name" placeholder="First Name" />
                </View>
                <View style={styles.flex1ml}>
                  <RHFInput control={form.control} name="lastName" label="Last Name" placeholder="Last Name" />
                </View>
              </View>
              <View style={styles.editRow}>
                <View style={styles.flex2}>
                  <RHFInput control={form.control} name="middleName" label="Middle Name" placeholder="Middle Name" />
                </View>
                <View style={styles.flex1ml}>
                  <RHFInput control={form.control} name="suffix" label="Suffix" placeholder="Jr." />
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Edit Address</Text>
              <View style={styles.editRow}>
                <View style={styles.flex1}>
                  <RHFInput control={form.control} name="houseNo" label="House No." placeholder="123" />
                </View>
                <View style={styles.flex2ml}>
                  <RHFInput control={form.control} name="street" label="Street" placeholder="Rizal St." />
                </View>
              </View>
            </View>

            <View style={styles.editButtons}>
              <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={isUpdating} activeOpacity={0.8}>
                {isUpdating
                  ? <ActivityIndicator color={COLORS.WHITE} size="small" />
                  : <>
                      <Ionicons name="checkmark" size={18} color={COLORS.WHITE} />
                      <Text style={styles.saveBtnText}>Save Changes</Text>
                    </>
                }
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEditing} disabled={isUpdating} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <InfoRow label="First Name" value={user.firstName} />
              <InfoRow label="Last Name" value={user.lastName} />
              <InfoRow label="Middle Name" value={user.middleName ?? ''} />
              <InfoRow label="Date of Birth" value={user.birthDate ? formatDate(user.birthDate) : ''} />
              <InfoRow label="Gender" value={formatGender(user.gender)} last />
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Address</Text>
              <InfoRow label="Barangay" value={user.barangay?.name ?? ''} />
              <InfoRow label="House / Street" value={[user.address?.houseNo, user.address?.street].filter(Boolean).join(' ') || 'N/A'} />
              <InfoRow label="City" value={user.address?.city ?? 'Tanauan City'} />
              <InfoRow label="Province" value={user.address?.province ?? 'Batangas'} />
              <InfoRow label="Zip Code" value={user.address?.zipCode ?? '4232'} last />
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Account</Text>
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone Number" value={user.phone} />
              <InfoRow label="Member Since" value={formatDate(user.createdAt)} last />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.OFF_WHITE },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 80 },

  profileBlock: { alignItems: 'center', marginBottom: 16 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarImage: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.GRAY_100,
    marginBottom: 12,
  },
  avatarInitials: { color: COLORS.PRIMARY, fontSize: 32, fontWeight: '800' },
  fullName: { color: COLORS.GRAY_900, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  tanawIdPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.GOLD_LIGHT, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
  },
  tanawId: { color: COLORS.GOLD, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  roleChip: { backgroundColor: COLORS.GRAY_100, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  roleChipText: { color: COLORS.GRAY_700, fontSize: 12, fontWeight: '600' },
  statusChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusActive: { backgroundColor: COLORS.SUCCESS_LIGHT },
  statusInactive: { backgroundColor: COLORS.DANGER_LIGHT },
  statusChipText: { fontSize: 12, fontWeight: '600' },

  infoCard: {
    backgroundColor: COLORS.WHITE, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.GRAY_100,
    padding: 16, marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.GRAY_500, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },
  infoRow: { paddingVertical: 10 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.GRAY_50 },
  infoLabel: { color: COLORS.GRAY_300, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { color: COLORS.GRAY_900, fontSize: 14, fontWeight: '500' },

  editRow: { flexDirection: 'row' },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex1ml: { flex: 1, marginLeft: 8 },
  flex2ml: { flex: 2, marginLeft: 8 },
  editButtons: { gap: 10, marginTop: 4 },
  saveBtn: {
    backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.lg,
    paddingVertical: 15, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
  },
  saveBtnText: { color: COLORS.WHITE, fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    borderWidth: 1.5, borderColor: COLORS.GRAY_300, borderRadius: RADIUS.lg,
    paddingVertical: 14, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.GRAY_500, fontSize: 14, fontWeight: '600' },
});
