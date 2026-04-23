import React, { useEffect, useState } from 'react';
import {
  View, Text, Modal, TextInput, StyleSheet, Pressable, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { Post } from '../../types/post.types';
import * as groupsApi from '../../api/groups.api';

interface Props {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onSaved: (updated: Post) => void;
}

export default function EditPostModal({ visible, post, onClose, onSaved }: Props) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && post) setContent(post.content);
  }, [visible, post]);

  const trimmed = content.trim();
  const isUnchanged = post ? trimmed === post.content.trim() : false;
  const canSave = trimmed.length > 0 && trimmed.length <= 1800 && !isUnchanged && !saving;

  const handleSave = async () => {
    if (!post || !canSave) return;
    setSaving(true);
    try {
      const updated = await groupsApi.updatePost(post.id, trimmed);
      onSaved(updated);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={saving ? undefined : onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Pressable
              onPress={saving ? undefined : onClose}
              hitSlop={12}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.btnPressed]}
            >
              <Ionicons name="close" size={22} color={COLORS.GRAY_900} />
            </Pressable>
            <Text style={styles.title}>Edit post</Text>
            <View style={styles.headerSpacer} />
          </View>

          <TextInput
            style={styles.input}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={1800}
            placeholder="What's on your mind?"
            placeholderTextColor={COLORS.GRAY_500}
            editable={!saving}
            autoFocus
          />

          <View style={styles.footer}>
            <Text style={styles.counter}>{content.length}/1800</Text>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={({ pressed }) => [
                styles.saveBtn,
                !canSave && styles.saveBtnDisabled,
                pressed && styles.btnPressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.xl,
    padding: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  btnPressed: { opacity: 0.6 },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: COLORS.GRAY_900 },
  headerSpacer: { width: 36 },
  input: {
    fontSize: 14,
    color: COLORS.GRAY_900,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: COLORS.GRAY_50,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12,
  },
  counter: { fontSize: 11, color: COLORS.GRAY_300 },
  saveBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 22, paddingVertical: 10,
    borderRadius: RADIUS.md,
    minWidth: 80,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: COLORS.GRAY_300 },
  saveBtnText: { color: COLORS.WHITE, fontSize: 13, fontWeight: '700' },
});
