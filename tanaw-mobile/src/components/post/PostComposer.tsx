import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet,
  ActivityIndicator, Modal, KeyboardAvoidingView, Platform, Alert, ScrollView, Image,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../store';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { getFullName, getInitials } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/apiError.util';
import { pickMultipleImages, PickedImage } from '../../utils/imagePicker.util';
import { MAX_IMAGES_PER_POST, MAX_POST_LENGTH, POST_WARN_AT } from '../../constants/posting';

export interface QuickAction {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

interface Props {
  onSubmit: (content: string, images: PickedImage[]) => Promise<void>;
  triggerText?: string;
  placeholder?: string;
  audience?: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  };
  quickActions?: QuickAction[];
  allowImages?: boolean;
}

export default function PostComposer({
  onSubmit,
  triggerText,
  placeholder,
  audience,
  quickActions,
  allowImages = true,
}: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<PickedImage[]>([]);

  const initials = user ? getInitials(user.firstName, user.lastName) : '?';
  const fullName = user ? getFullName(user.firstName, user.lastName, user.middleName, user.suffix) : 'Me';
  const barangayName = user?.barangay?.name;

  const effectiveAudience = audience ?? (barangayName ? { icon: 'people' as const, label: `Brgy. ${barangayName}` } : null);
  const effectiveTriggerText = triggerText ?? 'Share something with your barangay…';
  const effectivePlaceholder = placeholder ?? "What's on your mind?";

  const trimmed = content.trim();
  const remaining = MAX_POST_LENGTH - content.length;
  const isNearLimit = content.length >= POST_WARN_AT;
  const isAtLimit = content.length >= MAX_POST_LENGTH;
  const hasContent = trimmed.length > 0 || images.length > 0;
  const canSubmit = hasContent && trimmed.length <= MAX_POST_LENGTH && !submitting;

  const handleOpen = () => {
    setContent('');
    setImages([]);
    setOpen(true);
  };

  const handleClose = () => {
    if (submitting) return;
    setOpen(false);
    setContent('');
    setImages([]);
  };

  const handleAddImages = async () => {
    if (!allowImages || submitting) return;
    const remainingSlots = MAX_IMAGES_PER_POST - images.length;
    if (remainingSlots <= 0) {
      Alert.alert('Photos', `Maximum ${MAX_IMAGES_PER_POST} photos per post`);
      return;
    }
    try {
      const picked = await pickMultipleImages(remainingSlots);
      if (picked.length > 0) setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES_PER_POST));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not pick images';
      Alert.alert('Photos', msg);
    }
  };

  const handleRemoveImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed, images);
      setContent('');
      setImages([]);
      setOpen(false);
    } catch (e: any) {
      Alert.alert('Error', getApiErrorMessage(e, 'Failed to create post'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger bar */}
      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
      >
        {user?.profilePhoto ? (
          <Image
            key={user.profilePhoto}
            source={{ uri: user.profilePhoto }}
            style={styles.avatarSmImage}
          />
        ) : (
          <View style={styles.avatarSm}>
            <Text style={styles.avatarSmText}>{initials}</Text>
          </View>
        )}
        <Text style={styles.triggerText}>{effectiveTriggerText}</Text>
        <Ionicons name="create-outline" size={18} color={COLORS.GRAY_500} />
      </Pressable>

      {quickActions && quickActions.length > 0 && (
        <View style={styles.quickActionRow}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              onPress={action.onPress}
              style={styles.quickAction}
              activeOpacity={0.7}
            >
              <Ionicons name={action.icon} size={16} color={action.color} />
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Full-screen compose modal */}
      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <SafeAreaProvider>
        <SafeAreaView style={styles.modalRoot} edges={['top']}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={handleClose}
              hitSlop={14}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.btnPressed]}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.GRAY_900} />
            </Pressable>
            <Text style={styles.modalTitle}>Create post</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[styles.postBtn, !canSubmit && styles.postBtnDisabled]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <Text style={styles.postBtnText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.authorRow}>
            {user?.profilePhoto ? (
              <Image
                key={user.profilePhoto}
                source={{ uri: user.profilePhoto }}
                style={styles.avatarLgImage}
              />
            ) : (
              <View style={styles.avatarLg}>
                <Text style={styles.avatarLgText}>{initials}</Text>
              </View>
            )}
            <View style={styles.authorInfo}>
              <Text style={styles.authorName} numberOfLines={1}>{fullName}</Text>
              {effectiveAudience && (
                <View style={styles.audiencePill}>
                  <Ionicons name={effectiveAudience.icon} size={11} color={COLORS.PRIMARY} />
                  <Text style={styles.audienceText}>{effectiveAudience.label}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <KeyboardAvoidingView
            style={styles.body}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                style={styles.input}
                placeholder={effectivePlaceholder}
                placeholderTextColor={COLORS.GRAY_500}
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={MAX_POST_LENGTH}
                editable={!submitting}
                autoFocus
                textAlignVertical="top"
              />

              {images.length > 0 && (
                <View style={styles.imagePreviewGrid}>
                  {images.map((img) => (
                    <View key={img.uri} style={styles.imagePreviewBox}>
                      <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                      <Pressable
                        style={styles.imageRemove}
                        onPress={() => handleRemoveImage(img.uri)}
                        hitSlop={6}
                        disabled={submitting}
                        accessibilityRole="button"
                        accessibilityLabel="Remove photo"
                      >
                        <Ionicons name="close" size={14} color={COLORS.WHITE} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {allowImages && (
              <View style={styles.attachRow}>
                <TouchableOpacity
                  onPress={handleAddImages}
                  style={styles.attachBtn}
                  disabled={submitting || images.length >= MAX_IMAGES_PER_POST}
                  activeOpacity={0.7}
                >
                  <Ionicons name="image-outline" size={20} color={COLORS.SUCCESS} />
                  <Text style={styles.attachLabel}>
                    Photo {images.length > 0 ? `(${images.length}/${MAX_IMAGES_PER_POST})` : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.counterRow}>
              {isAtLimit && (
                <Text style={styles.limitReached}>Character limit reached</Text>
              )}
              <Text
                style={[
                  styles.counter,
                  isNearLimit && styles.counterWarn,
                  isAtLimit && styles.counterDanger,
                ]}
              >
                {isNearLimit ? `${remaining} left` : `${content.length}/${MAX_POST_LENGTH}`}
              </Text>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
    marginBottom: 12,
  },
  triggerPressed: { backgroundColor: COLORS.GRAY_50 },
  triggerText: { flex: 1, fontSize: 14, color: COLORS.GRAY_500 },
  quickActionRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
    marginTop: -6,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  quickActionLabel: { fontSize: 12, color: COLORS.GRAY_700, fontWeight: '600' },

  avatarSm: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarSmText: { color: COLORS.WHITE, fontSize: 12, fontWeight: '700' },
  avatarSmImage: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.GRAY_100 },

  modalRoot: { flex: 1, backgroundColor: COLORS.WHITE },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.GRAY_100,
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  btnPressed: { opacity: 0.6 },
  modalTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: COLORS.GRAY_900 },
  postBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: RADIUS.md,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnDisabled: { backgroundColor: COLORS.GRAY_300 },
  postBtnText: { color: COLORS.WHITE, fontSize: 13, fontWeight: '700' },

  authorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  avatarLg: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarLgText: { color: COLORS.WHITE, fontSize: 15, fontWeight: '700' },
  avatarLgImage: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.GRAY_100 },
  authorInfo: { flex: 1, gap: 4 },
  authorName: { fontSize: 14, fontWeight: '700', color: COLORS.GRAY_900 },
  audiencePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  audienceText: { fontSize: 11, color: COLORS.PRIMARY, fontWeight: '700' },

  divider: { height: 1, backgroundColor: COLORS.GRAY_50, marginHorizontal: 16 },

  body: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  input: {
    fontSize: 18,
    color: COLORS.GRAY_900,
    padding: 0,
    lineHeight: 26,
    minHeight: 120,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none', borderWidth: 0 } as object) : {}),
  },
  counterRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_50,
  },
  counter: { fontSize: 11, color: COLORS.GRAY_300, fontWeight: '600' },
  counterWarn: { color: COLORS.WARNING },
  counterDanger: { color: COLORS.DANGER },
  limitReached: { fontSize: 11, color: COLORS.DANGER, fontWeight: '700' },

  imagePreviewGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14,
  },
  imagePreviewBox: {
    width: 100, height: 100, borderRadius: RADIUS.md, overflow: 'hidden',
    backgroundColor: COLORS.GRAY_100,
  },
  imagePreview: { width: '100%', height: '100%' },
  imageRemove: {
    position: 'absolute',
    top: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center', alignItems: 'center',
  },
  attachRow: {
    borderTopWidth: 1, borderTopColor: COLORS.GRAY_50,
    paddingHorizontal: 12, paddingVertical: 8,
    flexDirection: 'row', gap: 12,
  },
  attachBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.SUCCESS_LIGHT,
  },
  attachLabel: { fontSize: 13, color: COLORS.SUCCESS, fontWeight: '700' },
});
