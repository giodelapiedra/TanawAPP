import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Linking, Alert, StyleSheet, Platform, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

// ─── Helpers ─────────────────────────────────────────────

function dialNumber(number: string) {
  const cleaned = number.replace(/[^0-9+#]/g, '');
  Linking.openURL(`tel:${cleaned}`).catch(() => {
    Alert.alert('Cannot make calls', `Please call ${number} manually.`);
  });
}

function copyNumber(number: string) {
  if (Platform.OS === 'web') return;
  try {
    const Clipboard = require('expo-clipboard');
    Clipboard.setStringAsync(number);
    Alert.alert('Copied', `${number} copied to clipboard.`);
  } catch {}
}

// ─── Slide to Call ───────────────────────────────────────

const TRACK_HEIGHT = 64;
const HANDLE_SIZE = 52;
const TRACK_PADDING = 6;

function SlideToCall({ number, label }: { number: string; label: string }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentValueRef = useRef(0);
  const startXRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [called, setCalled] = useState(false);
  const [dragging, setDragging] = useState(false);

  const maxDrag = Math.max(0, trackWidth - HANDLE_SIZE - TRACK_PADDING * 2);
  const threshold = maxDrag * 0.85;

  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentValueRef.current = value;
    });
    return () => {
      translateX.removeListener(id);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [translateX]);

  const springBack = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
      bounciness: 6,
      speed: 18,
    }).start();
  }, [translateX]);

  const fire = useCallback(() => {
    setCalled(true);
    setDragging(false);
    Animated.timing(translateX, {
      toValue: maxDrag,
      duration: 140,
      useNativeDriver: false,
    }).start(() => {
      dialNumber(number);
      resetTimerRef.current = setTimeout(() => {
        setCalled(false);
        springBack();
      }, 1800);
    });
  }, [maxDrag, number, springBack, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !called && maxDrag > 0,
        onMoveShouldSetPanResponder: () => !called && maxDrag > 0,
        onPanResponderGrant: () => {
          setDragging(true);
          translateX.stopAnimation((v: number) => {
            startXRef.current = v;
          });
        },
        onPanResponderMove: (_, g) => {
          const next = Math.max(0, Math.min(startXRef.current + g.dx, maxDrag));
          translateX.setValue(next);
        },
        onPanResponderRelease: () => {
          if (currentValueRef.current >= threshold) {
            fire();
          } else {
            setDragging(false);
            springBack();
          }
        },
        onPanResponderTerminate: () => {
          setDragging(false);
          springBack();
        },
      }),
    [called, fire, maxDrag, springBack, threshold, translateX],
  );

  const fillWidth = maxDrag > 0
    ? translateX.interpolate({
        inputRange: [0, maxDrag],
        outputRange: [HANDLE_SIZE + TRACK_PADDING * 2, trackWidth],
        extrapolate: 'clamp',
      })
    : HANDLE_SIZE + TRACK_PADDING * 2;

  const textOpacity = maxDrag > 0
    ? translateX.interpolate({
        inputRange: [0, maxDrag * 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })
    : 1;

  return (
    <View style={slideStyles.card}>
      <View style={slideStyles.labelRow}>
        <Ionicons name="alert-circle" size={20} color={COLORS.PRIMARY} />
        <Text style={slideStyles.label}>{label}</Text>
      </View>

      <View
        style={slideStyles.track}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={[slideStyles.fill, { width: fillWidth }]} />

        <Animated.View style={[slideStyles.textWrap, { opacity: textOpacity }]} pointerEvents="none">
          <Text style={slideStyles.trackText}>
            {called ? 'Calling 911...' : dragging ? 'Keep sliding...' : 'Slide to Call 911'}
          </Text>
          {!called && !dragging && (
            <Ionicons name="chevron-forward" size={16} color={COLORS.PRIMARY} style={slideStyles.chevron} />
          )}
        </Animated.View>

        <Animated.View
          style={[slideStyles.handle, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <Ionicons name={called ? 'checkmark' : 'call'} size={22} color={COLORS.WHITE} />
        </Animated.View>
      </View>
    </View>
  );
}

const slideStyles = StyleSheet.create({
  card: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.lg, padding: 16, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.GRAY_100 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { color: COLORS.GRAY_900, fontSize: 15, fontWeight: '700', marginLeft: 8 },
  track: { height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2, backgroundColor: COLORS.PRIMARY_LIGHT, overflow: 'hidden', justifyContent: 'center' },
  fill: { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: COLORS.PRIMARY, borderRadius: TRACK_HEIGHT / 2 },
  textWrap: { position: 'absolute', left: HANDLE_SIZE + TRACK_PADDING * 2 + 8, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  trackText: { color: COLORS.PRIMARY, fontSize: 15, fontWeight: '700' },
  chevron: { marginLeft: 6 },
  handle: { position: 'absolute', top: TRACK_PADDING, left: TRACK_PADDING, width: HANDLE_SIZE, height: HANDLE_SIZE, borderRadius: HANDLE_SIZE / 2, backgroundColor: COLORS.PRIMARY, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
});

// ─── Main Screen ─────────────────────────────────────────

const HOTLINES: { icon: keyof typeof Ionicons.glyphMap; name: string; number: string; color: string }[] = [
  { icon: 'shield-outline', name: 'Tanauan City Police', number: '#166', color: COLORS.BLUE },
  { icon: 'flame-outline', name: 'Bureau of Fire Protection', number: '(043) 778-0911', color: COLORS.ORANGE },
  { icon: 'medkit-outline', name: 'City Health Office', number: '(043) 778-1234', color: COLORS.SUCCESS },
  { icon: 'warning-outline', name: 'CDRRMO', number: '(043) 778-5678', color: COLORS.PRIMARY },
  { icon: 'business-outline', name: 'City Hall Hotline', number: '(043) 778-0001', color: COLORS.PURPLE },
];

export default function EmergencyScreen() {
  return (
    <View style={styles.root}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Emergency</Text>
          <Ionicons name="notifications-outline" size={22} color={COLORS.WHITE} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 911 Slide to Call */}
        <SlideToCall number="911" label="For Emergencies, Call 911" />

        {/* Hotlines */}
        <View style={styles.hotlineSection}>
          <Text style={styles.sectionTitle}>Emergency Hotlines</Text>
          <Text style={styles.sectionSub}>Tap to call or copy the number.</Text>

          <View style={styles.hotlineCard}>
            {HOTLINES.map((h, i) => (
              <View key={h.name} style={[styles.hotlineRow, i < HOTLINES.length - 1 && styles.hotlineBorder]}>
                <View style={[styles.hotlineIconBox, { backgroundColor: h.color + '20' }]}>
                  <Ionicons name={h.icon} size={18} color={h.color} />
                </View>
                <View style={styles.hotlineInfo}>
                  <Text style={styles.hotlineName}>{h.name}</Text>
                  <Text style={styles.hotlineNumber}>{h.number}</Text>
                </View>
                <TouchableOpacity style={styles.callBtn} onPress={() => dialNumber(h.number)} activeOpacity={0.7}>
                  <Ionicons name="call" size={16} color={COLORS.PRIMARY} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.copyBtn} onPress={() => copyNumber(h.number)} activeOpacity={0.7}>
                  <Ionicons name="copy-outline" size={16} color={COLORS.GRAY_500} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesRow}>
          <TouchableOpacity style={styles.categoryCard} activeOpacity={0.7} onPress={() => Alert.alert('Coming Soon', 'Hospital directory coming in Phase 2.')}>
            <View style={[styles.categoryIcon, { backgroundColor: COLORS.BLUE_LIGHT }]}>
              <Ionicons name="medical-outline" size={22} color={COLORS.BLUE} />
            </View>
            <Text style={styles.categoryLabel}>Hospitals</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard} activeOpacity={0.7} onPress={() => Alert.alert('Coming Soon', 'Fire stations coming in Phase 2.')}>
            <View style={[styles.categoryIcon, { backgroundColor: COLORS.ORANGE_LIGHT }]}>
              <Ionicons name="flame-outline" size={22} color={COLORS.ORANGE} />
            </View>
            <Text style={styles.categoryLabel}>Fire Stations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard} activeOpacity={0.7} onPress={() => Alert.alert('Coming Soon', 'Evacuation centers coming in Phase 2.')}>
            <View style={[styles.categoryIcon, { backgroundColor: COLORS.SUCCESS_LIGHT }]}>
              <Ionicons name="home-outline" size={22} color={COLORS.SUCCESS} />
            </View>
            <Text style={styles.categoryLabel}>Evacuation</Text>
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View style={styles.mapCard}>
          <Ionicons name="map-outline" size={28} color={COLORS.GRAY_300} />
          <Text style={styles.mapTitle}>Live Emergency Map</Text>
          <Text style={styles.mapSub}>Coming in Phase 2</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.OFF_WHITE },
  header: { backgroundColor: COLORS.PRIMARY, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  headerTitle: { color: COLORS.WHITE, fontSize: 22, fontWeight: '700' },
  content: { paddingTop: 16, paddingBottom: 40 },
  hotlineSection: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: COLORS.GRAY_900, fontSize: 16, fontWeight: '700' },
  sectionSub: { color: COLORS.GRAY_500, fontSize: 12, marginTop: 4, marginBottom: 12 },
  hotlineCard: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.GRAY_100 },
  hotlineRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  hotlineBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.GRAY_50 },
  hotlineIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  hotlineInfo: { flex: 1, marginLeft: 12 },
  hotlineName: { color: COLORS.GRAY_900, fontSize: 13, fontWeight: '600' },
  hotlineNumber: { color: COLORS.GRAY_500, fontSize: 12, marginTop: 1 },
  callBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.PRIMARY_LIGHT, justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  copyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.GRAY_50, justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  categoriesRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 16 },
  categoryCard: { flex: 1, backgroundColor: COLORS.WHITE, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: COLORS.GRAY_100 },
  categoryIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryLabel: { color: COLORS.GRAY_700, fontSize: 12, fontWeight: '600' },
  mapCard: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.lg, marginHorizontal: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.GRAY_100 },
  mapTitle: { color: COLORS.GRAY_700, fontSize: 14, fontWeight: '700', marginTop: 8 },
  mapSub: { color: COLORS.GRAY_300, fontSize: 11, marginTop: 4 },
});
