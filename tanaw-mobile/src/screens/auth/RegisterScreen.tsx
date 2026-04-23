import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RegisterRouteProp, AuthNavigationProp } from '../../types/navigation.types';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { BARANGAYS } from '../../constants/barangays';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import DatePicker from '../../components/common/DatePicker';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as authApi from '../../api/auth.api';

type Gender = 'MALE' | 'FEMALE';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
];

const BARANGAY_OPTIONS = BARANGAYS.map((b) => ({
  label: b.name,
  value: b.code,
}));

export default function RegisterScreen() {
  const route = useRoute<RegisterRouteProp>();
  const navigation = useNavigation<AuthNavigationProp>();
  const { role } = route.params;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successTanawId, setSuccessTanawId] = useState<string | null>(null);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');

  // Step 2
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [barangayCode, setBarangayCode] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');

  // Step 3
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!firstName.trim()) e.firstName = 'Required';
      if (!lastName.trim()) e.lastName = 'Required';
      if (!birthDate || birthDate.includes('--') || birthDate.split('-').some((p) => !p)) e.birthDate = 'Select complete date';
      if (!gender) e.gender = 'Select gender';
    } else if (step === 2) {
      if (!email.trim() || !email.includes('@')) e.email = 'Enter a valid email';
      if (!/^09\d{9}$/.test(phone)) e.phone = 'Format: 09XXXXXXXXX';
      if (!barangayCode) e.barangayCode = 'Select your barangay';
      if (role === 'BARANGAY_OFFICIAL' && !position.trim()) e.position = 'Required';
      if (role === 'GOVERNMENT_EMPLOYEE') {
        if (!employeeCode.trim()) e.employeeCode = 'Required';
        if (!department.trim()) e.department = 'Required';
        if (!position.trim()) e.position = 'Required';
      }
    } else {
      if (password.length < 8) e.password = 'Minimum 8 characters';
      if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); else navigation.goBack(); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const base = {
        email, phone, password, firstName, lastName,
        middleName: middleName || undefined,
        suffix: suffix || undefined,
        birthDate, gender: gender as Gender, barangayCode,
        street: street || undefined, houseNo: houseNo || undefined,
      };
      let result;
      if (role === 'RESIDENT') result = await authApi.registerResident(base);
      else if (role === 'BARANGAY_OFFICIAL') result = await authApi.registerBarangay({ ...base, position });
      else result = await authApi.registerEmployee({ ...base, employeeCode, department, position });
      setSuccessTanawId(result.tanawId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      if (e.response?.data?.message) {
        setApiError(e.response.data.message);
      } else if (e.message === 'Network Error') {
        setApiError('Cannot connect to server. Make sure the backend is running.');
      } else {
        setApiError(e.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
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

  const stepTitles = ['Personal Info', 'Contact & Address', 'Password'];
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
          <Text style={styles.stepTitle}>{stepTitles[step - 1]}</Text>
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
        <ErrorMessage message={apiError} onDismiss={() => setApiError(null)} />

        {/* ── Step 1: Personal Info ── */}
        {step === 1 && (
          <>
            <View style={styles.row}>
              <View style={styles.flex2}>
                <Input label="First Name" value={firstName} onChangeText={setFirstName} error={errors.firstName} placeholder="Juan" />
              </View>
              <View style={styles.flex1ml}>
                <Input label="Middle Name" value={middleName} onChangeText={setMiddleName} placeholder="M." />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.flex2}>
                <Input label="Last Name" value={lastName} onChangeText={setLastName} error={errors.lastName} placeholder="Dela Cruz" />
              </View>
              <View style={styles.flex1ml}>
                <Input label="Suffix" value={suffix} onChangeText={setSuffix} placeholder="Jr." />
              </View>
            </View>
            <DatePicker
              label="Date of Birth"
              value={birthDate}
              onChange={setBirthDate}
              error={errors.birthDate}
            />
            <Dropdown
              label="Gender"
              placeholder="Select gender"
              options={GENDER_OPTIONS}
              value={gender}
              onSelect={(v) => { setGender(v); setErrors((e) => { const n = { ...e }; delete n.gender; return n; }); }}
              error={errors.gender}
            />
          </>
        )}

        {/* ── Step 2: Contact & Address ── */}
        {step === 2 && (
          <>
            <Input label="Email" value={email} onChangeText={setEmail} error={errors.email} placeholder="juan@email.com" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Phone Number" value={phone} onChangeText={setPhone} error={errors.phone} placeholder="09171234567" keyboardType="phone-pad" />
            <Dropdown
              label="Barangay"
              placeholder="Select your barangay"
              options={BARANGAY_OPTIONS}
              value={barangayCode}
              onSelect={(v) => { setBarangayCode(v); setErrors((e) => { const n = { ...e }; delete n.barangayCode; return n; }); }}
              error={errors.barangayCode}
              searchable
              searchPlaceholder="Search barangay..."
            />
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input label="House No." value={houseNo} onChangeText={setHouseNo} placeholder="123" />
              </View>
              <View style={styles.flex2ml}>
                <Input label="Street" value={street} onChangeText={setStreet} placeholder="Rizal St." />
              </View>
            </View>
            {role === 'BARANGAY_OFFICIAL' && (
              <Input label="Position" value={position} onChangeText={setPosition} error={errors.position} placeholder="Barangay Captain" />
            )}
            {role === 'GOVERNMENT_EMPLOYEE' && (
              <>
                <Input label="Employee Code" value={employeeCode} onChangeText={setEmployeeCode} error={errors.employeeCode} placeholder="EMP-CHO-2026-001" autoCapitalize="characters" />
                <Input label="Department" value={department} onChangeText={setDepartment} error={errors.department} placeholder="City Health Office" />
                <Input label="Position" value={position} onChangeText={setPosition} error={errors.position} placeholder="Nurse" />
              </>
            )}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Your TANAW ID will be created after registration.</Text>
            </View>
          </>
        )}

        {/* ── Step 3: Password ── */}
        {step === 3 && (
          <>
            <Input label="Password" value={password} onChangeText={setPassword} error={errors.password} placeholder="Minimum 8 characters" secureTextEntry />
            <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} placeholder="Re-enter password" secureTextEntry />
            <View style={styles.passNoteRow}>
              <Ionicons name="ellipse" size={6} color={COLORS.GRAY_300} />
              <Text style={styles.passNote}>Minimum 8 characters</Text>
            </View>
          </>
        )}

        {step < 3 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.WHITE} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8}>
            {isLoading ? <ActivityIndicator color={COLORS.WHITE} /> : <Text style={styles.nextBtnText}>Register</Text>}
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
  backText: { color: COLORS.WHITE, fontSize: 18 },
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
