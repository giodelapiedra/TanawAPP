import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel}>
        <Pressable style={styles.card} onPress={() => { /* swallow tap */ }}>
          <View style={[styles.iconBox, destructive && styles.iconBoxDanger]}>
            <Ionicons
              name={destructive ? 'trash-outline' : 'help-circle-outline'}
              size={28}
              color={destructive ? COLORS.DANGER : COLORS.PRIMARY}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={({ pressed }) => [
                styles.btn,
                styles.btnCancel,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.btnCancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [
                styles.btn,
                destructive ? styles.btnDanger : styles.btnConfirm,
                pressed && styles.btnPressed,
                loading && styles.btnDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <Text style={styles.btnConfirmText}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: 'center',
  },
  iconBox: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  iconBoxDanger: { backgroundColor: COLORS.DANGER_LIGHT },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.GRAY_900,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    color: COLORS.GRAY_500,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  btnCancel: {
    backgroundColor: COLORS.GRAY_50,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
  },
  btnConfirm: { backgroundColor: COLORS.PRIMARY },
  btnDanger: { backgroundColor: COLORS.DANGER },
  btnPressed: { opacity: 0.7 },
  btnDisabled: { opacity: 0.6 },
  btnCancelText: { color: COLORS.GRAY_700, fontSize: 14, fontWeight: '700' },
  btnConfirmText: { color: COLORS.WHITE, fontSize: 14, fontWeight: '700' },
});
