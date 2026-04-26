import React, { useState } from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { PostImage } from '../../types/post.types';
import ImageViewer from './ImageViewer';

/**
 * Layout-aware image grid for post tiles.
 *
 * Design notes
 * ─────────────
 * - Uses `flex: 1` + `aspectRatio` instead of `Dimensions.get('window').width`
 *   minus a hand-tuned inset. This way the grid fills its parent (the post
 *   card body) exactly, no matter how the card is padded or how nested it is.
 *   The previous SCREEN_WIDTH-based math overflowed the card by ~24px.
 * - Each tile crops with `resizeMode="cover"`. Cropping in a preview grid is
 *   the standard pattern (Instagram, Facebook); the full uncropped photo is
 *   shown by ImageViewer on tap.
 * - 1-image hero is 4:3 (landscape) so most camera photos fill cleanly.
 *   2-image is two square tiles.
 *   3-image is a slightly portrait 1:1.1 to balance the row.
 *   4-image is a 2×2 of squares.
 */

interface Props {
  images: PostImage[];
}

const GAP = 4;

export default function PostImages({ images }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const openViewer = (index: number) => setViewerIndex(index);
  const closeViewer = () => setViewerIndex(null);

  const Tile = ({ image, index, aspectRatio = 1 }: { image: PostImage; index: number; aspectRatio?: number }) => (
    <Pressable
      onPress={() => openViewer(index)}
      accessibilityRole="imagebutton"
      accessibilityLabel={`View photo ${index + 1} of ${images.length}`}
      style={[styles.tileWrap, { aspectRatio }]}
    >
      <Image source={{ uri: image.url }} style={styles.tileImage} resizeMode="cover" />
    </Pressable>
  );

  let layout: React.ReactNode;

  if (images.length === 1) {
    // Single — landscape hero (4:3).
    layout = (
      <Pressable
        onPress={() => openViewer(0)}
        accessibilityRole="imagebutton"
        style={[styles.singleWrap, { aspectRatio: 4 / 3 }]}
      >
        <Image source={{ uri: images[0].url }} style={styles.tileImage} resizeMode="cover" />
      </Pressable>
    );
  } else if (images.length === 2) {
    // Two squares side by side.
    layout = (
      <View style={styles.row}>
        <Tile image={images[0]} index={0} aspectRatio={1} />
        <Tile image={images[1]} index={1} aspectRatio={1} />
      </View>
    );
  } else if (images.length === 3) {
    // Three slightly portrait tiles.
    layout = (
      <View style={styles.row}>
        <Tile image={images[0]} index={0} aspectRatio={1 / 1.1} />
        <Tile image={images[1]} index={1} aspectRatio={1 / 1.1} />
        <Tile image={images[2]} index={2} aspectRatio={1 / 1.1} />
      </View>
    );
  } else {
    // 4+ — first 4 in a 2×2 of squares. Backend caps at 4 already.
    const visible = images.slice(0, 4);
    layout = (
      <View style={styles.gridCol}>
        <View style={styles.row}>
          <Tile image={visible[0]} index={0} aspectRatio={1} />
          <Tile image={visible[1]} index={1} aspectRatio={1} />
        </View>
        <View style={styles.row}>
          <Tile image={visible[2]} index={2} aspectRatio={1} />
          <Tile image={visible[3]} index={3} aspectRatio={1} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {layout}
      <ImageViewer
        visible={viewerIndex !== null}
        images={images}
        initialIndex={viewerIndex ?? 0}
        onClose={closeViewer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10, width: '100%' },
  row: { flexDirection: 'row', gap: GAP, width: '100%' },
  gridCol: { gap: GAP, width: '100%' },

  singleWrap: {
    width: '100%',
    backgroundColor: COLORS.GRAY_100,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },

  tileWrap: {
    flex: 1,
    backgroundColor: COLORS.GRAY_100,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
});
