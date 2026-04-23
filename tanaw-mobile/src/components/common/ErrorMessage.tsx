import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

interface Props {
  message: string | null;
  onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: Props) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={16} color={COLORS.DANGER} style={styles.icon} />
      <Text style={styles.text}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={14} color={COLORS.DANGER} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.DANGER_LIGHT, borderRadius: RADIUS.sm, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  icon: { marginRight: 8 },
  text: { color: COLORS.DANGER, fontSize: 13, flex: 1, lineHeight: 18 },
  dismiss: { color: COLORS.DANGER, fontSize: 12, paddingLeft: 8 },
});
