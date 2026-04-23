import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

export interface ActionItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  items: ActionItem[];
  onClose: () => void;
}

export default function ActionMenu({ visible, items, onClose }: Props) {
  const handlePress = (item: ActionItem) => {
    onClose();
    setTimeout(() => item.onPress(), 150);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <SafeAreaView edges={['bottom']} style={styles.sheetWrap}>
          <Pressable style={styles.sheet} onPress={() => { /* swallow */ }}>
            <View style={styles.handle} />
            {items.map((item, i) => (
              <Pressable
                key={item.key}
                onPress={() => handlePress(item)}
                style={({ pressed }) => [
                  styles.row,
                  i !== items.length - 1 && styles.rowBorder,
                  pressed && styles.rowPressed,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.destructive ? COLORS.DANGER : COLORS.GRAY_700}
                />
                <Text style={[styles.label, item.destructive && styles.labelDanger]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.cancelRow, pressed && styles.rowPressed]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  sheet: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.GRAY_100,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    gap: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.GRAY_50 },
  rowPressed: { backgroundColor: COLORS.GRAY_50 },
  label: { fontSize: 15, color: COLORS.GRAY_900, fontWeight: '600' },
  labelDanger: { color: COLORS.DANGER },
  cancelRow: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 8, borderTopColor: COLORS.GRAY_50,
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, color: COLORS.GRAY_500, fontWeight: '700' },
});
