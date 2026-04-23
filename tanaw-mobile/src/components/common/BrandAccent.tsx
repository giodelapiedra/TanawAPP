import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface Props {
  style?: ViewStyle;
}

/**
 * TANAW brand accent — decorative gold shapes for header corners.
 * Rendered absolute-positioned; parent must be `overflow: hidden` and
 * leave empty space in the top-right area for visibility.
 */
export default function BrandAccent({ style }: Props) {
  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      <View style={[styles.shape, styles.goldBig]} />
      <View style={[styles.shape, styles.goldSmall]} />
      <View style={[styles.shape, styles.goldThin]} />
      <View style={[styles.shape, styles.dot]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0, right: 0,
    width: 120, height: 100,
  },
  shape: { position: 'absolute', backgroundColor: COLORS.GOLD },
  goldBig: {
    width: 46, height: 12, borderRadius: 4,
    top: 18, right: -10,
    transform: [{ rotate: '-28deg' }],
    opacity: 0.55,
  },
  goldSmall: {
    width: 24, height: 8, borderRadius: 3,
    top: 42, right: 34,
    transform: [{ rotate: '22deg' }],
    opacity: 0.35,
  },
  goldThin: {
    width: 70, height: 6, borderRadius: 3,
    top: 68, right: -20,
    transform: [{ rotate: '-14deg' }],
    opacity: 0.22,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    top: 12, right: 58,
    opacity: 0.5,
  },
});
