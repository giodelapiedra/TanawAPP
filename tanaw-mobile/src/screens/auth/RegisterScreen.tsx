import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../types/navigation.types';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { BARANGAYS } from '../../constants/barangays';
import { RHFInput, RHFDropdown, RHFDatePicker } from '../../components/common/RHFFields';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useRegistrationFlow } from '../../hooks/useRegistrationFlow';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
];

const BARANGAY_OPTIONS = BARANGAYS.map((b) => ({
  label: b.name,
  value: b.code,
}));

const STEP_TITLES = ['Personal Info', 'Contact & Address', 'Password'];

export default function RegisterScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const {
    form, step, goNext, goBack, submit,
    successTanawId, apiError, clearApiError, isSubmitting,
  } = useRegistrationFlow();

  const handleBack = () => {
    if (step > 1) goBack();
    else navigation.goBack();
  };

  // ── Success View ──
  if (successTanawId) {
    return (
      <View style={styles.successContainer}>
        <Image
          source={require('../../../assets/TANAUAN SEAL.png')}
          style={styles.successSeal}
          resizeMode="contain"
        />
        <View style={styles.successCheckBadge}>
          <Ionicons name="checkmark" size={16} color={COLORS.WHITE} />
        </View>
        <Text style={styles.successTitle}>Registration Successful!</Text>
        <Text style={styles.successCityLabel}>City Government of Tanauan</Text>
        <Text style={styles.successSub}>Your TANAW ID is:</Text>
        <Text style={styles.successId}>{successTanawId}</Text>
        <Text style={styles.successNote}>Save this ID — you can use it to login</Text>
        <TouchableOpacity style={styles.successBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
          <Text style={styles.successBtnText}>Login Now</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>
    );
  }

  const progressColors = [
    step >= 1 ? COLORS.WHITE_90 : COLORS.WHITE_25,
    step >= 2 ? COLORS.WHITE_90 : COLORS.WHITE_25,
    step >= 3 ? COLORS.GOLD : COLORS.WHITE_25,
  ];

  return (
    <View style={styles.root}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={styles.stepTitle}>{STEP_TITLES[step - 1]}</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.progressBar}>
          {progressColors.map((c, i) => (
            <View key={i} style={[styles.progressSeg, { backgroundColor: c }]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step {step} of 3</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <ErrorMessage message={apiError} onDismiss={clearApiError} />

        {/* ── Step 1: Personal Info ── */}
        {step === 1 && (
          <>
            <View style={styles.row}>
              <View style={styles.flex2}>
                <RHFInput control={form.control} name="firstName" label="First Name" placeholder="Juan" />
              </View>
              <View style={styles.flex1ml}>
                <RHFInput control={form.control} name="middleName" label="Middle Name" placeholder="M." />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.flex2}>
                <RHFInput control={form.control} name="lastName" label="Last Name" placeholder="Dela Cruz" />
              </View>
              <View style={styles.flex1ml}>
                <RHFInput control={form.control} name="suffix" label="Suffix" placeholder="Jr." />
              </View>
            </View>
            <RHFDatePicker control={form.control} name="birthDate" label="Date of Birth" />
            <RHFDropdown
              control={form.control}
              name="gender"
              label="Gender"
              placeholder="Select gender"
              options={GENDER_OPTIONS}
            />
          </>
        )}

        {/* ── Step 2: Contact & Address ── */}
        {step === 2 && (
          <>
            <RHFInput
              control={form.control}
              name="email"
              label="Email"
              placeholder="juan@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <RHFInput
              control={form.control}
              name="phone"
              label="Phone Number"
              placeholder="09171234567"
              keyboardType="phone-pad"
            />
            <RHFDropdown
              control={form.control}
              name="barangayCode"
              label="Barangay"
              placeholder="Select your barangay"
              options={BARANGAY_OPTIONS}
              searchable
              searchPlaceholder="Search barangay..."
            />
            <View style={styles.row}>
              <View style={styles.flex1}>
                <RHFInput control={form.control} name="houseNo" label="House No." placeholder="123" />
              </View>
              <View style={styles.flex2ml}>
                <RHFInput control={form.control} name="street" label="Street" placeholder="Rizal St." />
              </View>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Your TANAW ID will be created after registration.</Text>
            </View>
          </>
        )}

        {/* ── Step 3: Password ── */}
        {step === 3 && (
          <>
            <RHFInput
              control={form.control}
              name="password"
              label="Password"
              placeholder="Minimum 8 characters"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <RHFInput
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.passNoteRow}>
              <Ionicons name="ellipse" size={6} color={COLORS.GRAY_300} />
              <Text style={styles.passNote}>Minimum 8 characters</Text>
            </View>
          </>
        )}

        {step < 3 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.WHITE} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={submit} disabled={isSubmitting} activeOpacity={0.8}>
            {isSubmitting ? <ActivityIndicator color={COLORS.WHITE} /> : <Text style={styles.nextBtnText}>Register</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  progressHeader: { backgroundColor: COLORS.PRIMARY, paddingHorizontal: 16, paddingBottom: 16 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.WHITE_15, justifyContent: 'center', alignItems: 'center' },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex1ml: { flex: 1, marginLeft: 8 },
  flex2ml: { flex: 2, marginLeft: 8 },
  stepTitle: { flex: 1, color: COLORS.WHITE, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  progressBar: { flexDirection: 'row', gap: 4 },
  progressSeg: { flex: 1, height: 4, borderRadius: 2 },
  stepLabel: { color: COLORS.WHITE, fontSize: 11, opacity: 0.7, marginTop: 6 },
  body: { flex: 1 },
  bodyContent: { padding: 16 },
  row: { flexDirection: 'row' },
  infoBox: { backgroundColor: COLORS.GRAY_50, borderRadius: 10, padding: 10, marginBottom: 14 },
  infoText: { color: COLORS.GRAY_500, fontSize: 11, lineHeight: 17 },
  passNoteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  passNote: { color: COLORS.GRAY_300, fontSize: 11 },
  nextBtn: { backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.lg, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 },
  nextBtnText: { color: COLORS.WHITE, fontSize: 16, fontWeight: '700' },
  successContainer: { flex: 1, backgroundColor: COLORS.OFF_WHITE, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successSeal: { width: 90, height: 90, borderRadius: 45 },
  successCheckBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.SUCCESS, justifyContent: 'center', alignItems: 'center', marginTop: -14, marginLeft: 50 },
  successTitle: { color: COLORS.GRAY_900, fontSize: 22, fontWeight: '800', marginTop: 12 },
  successCityLabel: { color: COLORS.GOLD, fontSize: 12, fontWeight: '600', marginTop: 4 },
  successSub: { color: COLORS.GRAY_500, fontSize: 14, marginTop: 12 },
  successId: { color: COLORS.PRIMARY, fontSize: 26, fontWeight: '800', letterSpacing: 2, marginTop: 4 },
  successNote: { color: COLORS.GRAY_300, fontSize: 12, marginTop: 8 },
  successBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.lg, paddingVertical: 15, paddingHorizontal: 32, marginTop: 24 },
  successBtnText: { color: COLORS.WHITE, fontSize: 16, fontWeight: '700' },
});
