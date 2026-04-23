import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface HeaderAction {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
}

interface Props {
  title: string;
  onBackPress?: () => void;
  rightAction?: HeaderAction;
}

export default function ScreenHeader({ title, onBackPress, rightAction }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.inner}>
        <View style={styles.sideSlot}>
          {onBackPress && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.sideBtn}
              hitSlop={8}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.GRAY_900} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title} numberOfLines={1}>{title}</Text>

        <View style={styles.sideSlot}>
          {rightAction && (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={styles.sideBtn}
              hitSlop={8}
              accessibilityLabel={rightAction.accessibilityLabel}
            >
              <Ionicons
                name={rightAction.icon}
                size={20}
                color={rightAction.color ?? COLORS.PRIMARY}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Gold brand accent bar */}
      <View style={styles.accentBar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sideSlot: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  sideBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  title: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.GRAY_900,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  accentBar: {
    height: 2,
    backgroundColor: COLORS.GOLD,
    opacity: 0.55,
  },
});
