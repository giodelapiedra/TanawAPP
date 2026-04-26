import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthNavigationProp } from '../../types/navigation.types';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { RHFInput } from '../../components/common/RHFFields';
import ErrorMessage from '../../components/common/ErrorMessage';
import TanauanBackdrop from '../../components/common/TanauanBackdrop';
import { useLoginFlow } from '../../hooks/useLoginFlow';

/**
 * Login screen — clean hierarchy
 * ──────────────────────────────────────────────
 *  Background:  cream + soft gold halo + Tanauan SVG silhouette (bottom)
 *  L1  Top bar:    only the back button
 *  L2  Headline:   "Welcome back" + subtitle (anchors the page)
 *  L3  Form group: identifier + password + forgot link
 *  L4  Primary:    big red CTA "Log in →"
 *  L5  Secondary:  divider + outline "Create an account"
 *  L6  Footer:     trust signal
 *  Branding (seal + wordmark) lives on the Welcome screen only.
 *  Form state owned by useLoginFlow (RHF + zod) — screen handles layout only.
 * ──────────────────────────────────────────────
 */

export default function LoginScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const {
    form, submit, showPassword, togglePassword,
    apiError, clearApiError, isLoading, canSubmit,
  } = useLoginFlow();

  const handleForgotPassword = () => {
    Alert.alert(
      'Password recovery',
      'Password recovery will be available in Phase 2. For now, please contact City Government of Tanauan support.',
    );
  };

  return (
    <View style={styles.root}>
      {/* Background layers — warm cream + tinted halo + Tanauan silhouette */}
      <LinearGradient
        colors={['#FFF7E8', COLORS.OFF_WHITE]}
        locations={[0, 0.55]}
        style={StyleSheet.absoluteFill}
      />
      <TanauanBackdrop variant="dark" />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView edges={['top']}>
          {/* L1 — top bar (single back button only) */}
          <View style={styles.topBar}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={12}
              style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.GRAY_900} />
            </Pressable>
          </View>
        </SafeAreaView>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* L2 — headline */}
          <View style={styles.headline}>
            <Text style={styles.eyebrow}>WELCOME BACK</Text>
            <Text style={styles.title}>Log in to TANAW</Text>
            <Text style={styles.subtitle}>
              Continue managing your city services and digital ID.
            </Text>
          </View>

          {/* L3 — form */}
          <View style={styles.form}>
            <RHFInput
              control={form.control}
              name="identifier"
              label="Email, Phone, or TANAW ID"
              placeholder="juan@email.com / 09XX / TAN-RES-..."
              autoCapitalize="none"
              leftIcon={<Ionicons name="person-outline" size={18} color={COLORS.GRAY_500} />}
            />

            <RHFInput
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.GRAY_500} />}
              rightIcon={
                <TouchableOpacity
                  onPress={togglePassword}
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

            <TouchableOpacity
              onPress={handleForgotPassword}
              hitSlop={8}
              style={styles.forgotBtn}
              accessibilityRole="button"
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {apiError && (
              <View style={styles.errorWrap}>
                <ErrorMessage message={apiError} onDismiss={clearApiError} />
              </View>
            )}
          </View>

          {/* L4 — primary action */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              !canSubmit && styles.primaryBtnDisabled,
              pressed && canSubmit && styles.primaryBtnPressed,
            ]}
            onPress={submit}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityLabel="Log in"
            accessibilityState={{ disabled: !canSubmit, busy: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Log in</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.WHITE} />
              </>
            )}
          </Pressable>

          {/* L5 — secondary path */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>new here?</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}
            onPress={() => navigation.navigate('RoleSelect')}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryBtnText}>Create an account</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.PRIMARY} />
          </Pressable>

          {/* L6 — trust footer */}
          <View style={styles.trustRow}>
            <Ionicons name="lock-closed" size={11} color={COLORS.GRAY_500} />
            <Text style={styles.trustText}>Official app · End-to-end encrypted</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },

  // L1
  topBar: { paddingHorizontal: 16, paddingTop: 4 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
  },
  backBtnPressed: { opacity: 0.7 },

  // L2 — headline
  headline: { marginTop: 24, marginBottom: 28 },
  eyebrow: {
    color: COLORS.PRIMARY,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  title: {
    color: COLORS.GRAY_900,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  subtitle: {
    color: COLORS.GRAY_500,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  // L3 — form
  form: { gap: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 4, paddingVertical: 4 },
  forgotText: { color: COLORS.PRIMARY, fontSize: 12, fontWeight: '700' },
  errorWrap: { marginTop: 8 },

  // L4 — primary
  primaryBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.lg,
    paddingVertical: 17,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 6,
    boxShadow: '0px 10px 24px rgba(200, 16, 46, 0.32)',
  },
  primaryBtnPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  primaryBtnDisabled: {
    opacity: 0.4,
    elevation: 0,
    boxShadow: 'none' as unknown as string,
  },
  primaryBtnText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // L5 — secondary
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.GRAY_100 },
  dividerText: {
    color: COLORS.GRAY_300,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '700',
  },

  secondaryBtn: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnPressed: { backgroundColor: COLORS.PRIMARY_LIGHT },
  secondaryBtnText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // L6 — trust
  trustRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    color: COLORS.GRAY_500,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
