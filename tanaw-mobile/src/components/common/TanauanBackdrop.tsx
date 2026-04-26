import React from 'react';
import { View, StyleSheet, ViewStyle, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

/**
 * TanauanBackdrop — decorative inline SVG vignette evoking Tanauan, Batangas:
 * a layered horizon (Taal volcanic hills), a soft sun, and a small skyline
 * silhouette including a church spire (St. John the Evangelist nod).
 *
 * - Real SVG (via react-native-svg) — `<Svg>/<Path>/<Circle>` map 1:1 to the
 *   SVG spec. <2KB rendered, no asset fetch on first paint.
 * - Decorative only (`pointerEvents="none"`); content always sits on top.
 * - Two tonal variants:
 *     `light`  — for dark / red backgrounds (Welcome). Whites + gold sun.
 *     `dark`   — for cream / off-white backgrounds (Login). Brand red.
 *
 * Drop into a flex parent — positions itself absolute-bottom by default.
 */

type Variant = 'light' | 'dark';

interface Props {
  style?: ViewStyle;
  /**
   * Tonal variant. `light` paints whites against a dark background;
   * `dark` paints reds against a light background.
   */
  variant?: Variant;
  /** Override the silhouette tint. Defaults derived from `variant`. */
  tint?: string;
  /** Bottom inset reserved for safe-area / nav bar. */
  bottomOffset?: number;
}

interface VariantTokens {
  silhouette: string;
  sun: string;
  hillFar: number;
  hillMid: number;
  skyline: number;
  ground: number;
  sunOpacity: number;
}

const VARIANTS: Record<Variant, VariantTokens> = {
  light: {
    silhouette: COLORS.WHITE,
    sun: COLORS.GOLD,
    hillFar: 0.05,
    hillMid: 0.07,
    skyline: 0.12,
    ground: 0.08,
    sunOpacity: 0.18,
  },
  dark: {
    silhouette: COLORS.PRIMARY,
    sun: COLORS.GOLD,
    hillFar: 0.06,
    hillMid: 0.09,
    skyline: 0.14,
    ground: 0.10,
    sunOpacity: 0.10,
  },
};

function TanauanBackdropImpl({
  style,
  variant = 'dark',
  tint,
  bottomOffset = 0,
}: Props) {
  const { width, height } = useWindowDimensions();
  const w = width;
  const h = Math.min(height * 0.42, 360);

  const tokens = VARIANTS[variant];
  const fillColor = tint ?? tokens.silhouette;

  return (
    <View pointerEvents="none" style={[styles.wrap, { bottom: bottomOffset, height: h }, style]}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Soft sun / horizon glow */}
        <Circle cx={w * 0.78} cy={h * 0.18} r={h * 0.22} fill={tokens.sun} opacity={tokens.sunOpacity} />

        {/* Far hills — Taal volcanic ridge silhouette */}
        <Path
          d={`
            M 0 ${h * 0.55}
            C ${w * 0.18} ${h * 0.42}, ${w * 0.32} ${h * 0.62}, ${w * 0.5} ${h * 0.5}
            S ${w * 0.78} ${h * 0.36}, ${w} ${h * 0.5}
            L ${w} ${h}
            L 0 ${h}
            Z
          `}
          fill={fillColor}
          opacity={tokens.hillFar}
        />

        {/* Mid hills */}
        <Path
          d={`
            M 0 ${h * 0.72}
            C ${w * 0.2} ${h * 0.6}, ${w * 0.45} ${h * 0.78}, ${w * 0.65} ${h * 0.66}
            S ${w * 0.92} ${h * 0.6}, ${w} ${h * 0.7}
            L ${w} ${h}
            L 0 ${h}
            Z
          `}
          fill={fillColor}
          opacity={tokens.hillMid}
        />

        {/* Foreground city skyline — buildings + church spire */}
        <G opacity={tokens.skyline}>
          {/* Church silhouette (St. John the Evangelist nod) — spire + body */}
          <Path
            d={`
              M ${w * 0.08} ${h * 0.85}
              L ${w * 0.08} ${h * 0.78}
              L ${w * 0.075} ${h * 0.78}
              L ${w * 0.08} ${h * 0.74}
              L ${w * 0.085} ${h * 0.78}
              L ${w * 0.08} ${h * 0.78}
              Z
              M ${w * 0.06} ${h * 0.86}
              L ${w * 0.06} ${h * 0.81}
              L ${w * 0.105} ${h * 0.81}
              L ${w * 0.105} ${h * 0.86}
              Z
            `}
            fill={fillColor}
          />

          {/* Building rectangles — varied heights */}
          <Path
            d={`
              M ${w * 0.16} ${h * 0.86}
              L ${w * 0.16} ${h * 0.78}
              L ${w * 0.21} ${h * 0.78}
              L ${w * 0.21} ${h * 0.86}
              Z
              M ${w * 0.23} ${h * 0.86}
              L ${w * 0.23} ${h * 0.82}
              L ${w * 0.27} ${h * 0.82}
              L ${w * 0.27} ${h * 0.86}
              Z
              M ${w * 0.30} ${h * 0.86}
              L ${w * 0.30} ${h * 0.76}
              L ${w * 0.33} ${h * 0.76}
              L ${w * 0.33} ${h * 0.86}
              Z
              M ${w * 0.36} ${h * 0.86}
              L ${w * 0.36} ${h * 0.80}
              L ${w * 0.42} ${h * 0.80}
              L ${w * 0.42} ${h * 0.86}
              Z
              M ${w * 0.46} ${h * 0.86}
              L ${w * 0.46} ${h * 0.83}
              L ${w * 0.50} ${h * 0.83}
              L ${w * 0.50} ${h * 0.86}
              Z
              M ${w * 0.54} ${h * 0.86}
              L ${w * 0.54} ${h * 0.78}
              L ${w * 0.59} ${h * 0.78}
              L ${w * 0.59} ${h * 0.86}
              Z
              M ${w * 0.62} ${h * 0.86}
              L ${w * 0.62} ${h * 0.81}
              L ${w * 0.66} ${h * 0.81}
              L ${w * 0.66} ${h * 0.86}
              Z
              M ${w * 0.70} ${h * 0.86}
              L ${w * 0.70} ${h * 0.74}
              L ${w * 0.74} ${h * 0.74}
              L ${w * 0.74} ${h * 0.86}
              Z
              M ${w * 0.78} ${h * 0.86}
              L ${w * 0.78} ${h * 0.82}
              L ${w * 0.82} ${h * 0.82}
              L ${w * 0.82} ${h * 0.86}
              Z
              M ${w * 0.85} ${h * 0.86}
              L ${w * 0.85} ${h * 0.79}
              L ${w * 0.92} ${h * 0.79}
              L ${w * 0.92} ${h * 0.86}
              Z
            `}
            fill={fillColor}
          />
        </G>

        {/* Ground — closes off the skyline */}
        <Path
          d={`M 0 ${h * 0.86} L ${w} ${h * 0.86} L ${w} ${h} L 0 ${h} Z`}
          fill={fillColor}
          opacity={tokens.ground}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});

// Memoised: props are simple primitives, so a shallow compare is cheap and
// prevents the SVG from re-rendering when the parent re-renders for an
// unrelated reason (e.g. form state in LoginScreen). Window-dimension
// changes still go through and update the geometry naturally.
const TanauanBackdrop = React.memo(TanauanBackdropImpl);
export default TanauanBackdrop;
