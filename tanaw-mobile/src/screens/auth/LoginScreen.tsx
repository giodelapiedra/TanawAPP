import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthNavigationProp } from '../../types/navigation.types';
import { useAppSelector, useAppDispatch } from '../../store';
import { loginThunk, clearError } from '../../store/slices/authSlice';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import Input from '../../components/common/Input';
import ErrorMessage from '../../components/common/ErrorMessage';
import BrandAccent from '../../components/common/BrandAccent';

export default function LoginScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const trimmedIdentifier = identifier.trim();
  const canSubmit = !!trimmedIdentifier && !!password && !isLoading;

  const handleLogin = () => {
    if (!canSubmit) return;
    dispatch(loginThunk({ identifier: trimmedIdentifier, password }));
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Password recovery',
      'Password recovery will be available in Phase 2. For now, please contact City Government of Tanauan support.',
    );
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <BrandAccent />
            <SafeAreaView edges={['top']} style={styles.heroSafe}>
              <View style={styles.sealWrap}>
                <Image
                  source={require('../../../assets/TANAUAN SEAL.png')}
                  style={styles.seal}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.wordmark}>TANAW</Text>
              <Text style={styles.eyebrow}>CITY GOVERNMENT OF TANAUAN</Text>
            </SafeAreaView>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.welcomeSub}>Log in to continue to your account.</Text>

            <View style={styles.fields}>
              <Input
                label="Email, Phone, or TANAW ID"
                placeholder="juan@email.com / 09XX / TAN-RES-..."
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                leftIcon={<Ionicons name="person-outline" size={18} color={COLORS.GRAY_500} />}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.GRAY_500} />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.GRAY_500}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              hitSlop={8}
              style={styles.forgotBtn}
              accessibilityRole="button"
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {error && (
              <View style={styles.errorWrap}>
                <ErrorMessage message={error} onDismiss={() => dispatch(clearError())} />
              </View>
            )}

            <TouchableOpacity
              style={[styles.loginBtn, !canSubmit && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={!canSubmit}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Log in"
              accessibilityState={{ disabled: !canSubmit, busy: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Log in</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.WHITE} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>new here?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('RoleSelect')}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Text style={styles.registerBtnText}>Create an account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>TANAW One Super App · v1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const HERO_BOTTOM_RADIUS = 32;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 24 },

  hero: {
    backgroundColor: COLORS.PRIMARY,
    paddingBottom: 56,
    borderBottomLeftRadius: HERO_BOTTOM_RADIUS,
    borderBottomRightRadius: HERO_BOTTOM_RADIUS,
    overflow: 'hidden',
  },
  heroSafe: { alignItems: 'center', paddingTop: 28 },
  sealWrap: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.GOLD,
    elevation: 4,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.18)',
  },
  seal: { width: 72, height: 72 },
  wordmark: {
    color: COLORS.WHITE,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: 16,
  },
  eyebrow: {
    color: COLORS.GOLD,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },

  card: {
    marginTop: -32,
    marginHorizontal: 16,
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 4,
    boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.08)',
  },
  welcome: { color: COLORS.GRAY_900, fontSize: 22, fontWeight: '800' },
  welcomeSub: { color: COLORS.GRAY_500, fontSize: 13, marginTop: 4 },
  fields: { marginTop: 20 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: -6, marginBottom: 4 },
  forgotText: { color: COLORS.PRIMARY, fontSize: 12, fontWeight: '700' },

  errorWrap: { marginTop: 8 },

  loginBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.lg,
    paddingVertical: 15,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    boxShadow: '0px 4px 12px rgba(200, 16, 46, 0.25)',
  },
  loginBtnDisabled: { opacity: 0.5, elevation: 0, boxShadow: 'none' as unknown as string },
  loginBtnText: { color: COLORS.WHITE, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 22, marginBottom: 12, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.GRAY_100 },
  dividerText: {
    color: COLORS.GRAY_300,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  registerBtn: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerBtnText: { color: COLORS.PRIMARY, fontSize: 14, fontWeight: '800' },

  footer: {
    marginTop: 24,
    textAlign: 'center',
    color: COLORS.GRAY_300,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
