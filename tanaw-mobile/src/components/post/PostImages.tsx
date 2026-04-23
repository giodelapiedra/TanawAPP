import React, { useState } from 'react';
import { View, Image, Pressable, Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { PostImage } from '../../types/post.types';
import ImageViewer from './ImageViewer';

interface Props {
  images: PostImage[];
  horizontalInset?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PostImages({ images, horizontalInset = 32 }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const containerWidth = SCREEN_WIDTH - horizontalInset;
  const openViewer = (index: number) => setViewerIndex(index);
  const closeViewer = () => setViewerIndex(null);

  const renderTile = (img: PostImage, index: number, style: object) => (
    <Pressable
      key={img.id}
      onPress={() => openViewer(index)}
      accessibilityRole="imagebutton"
      accessibilityLabel={`View photo ${index + 1} of ${images.length}`}
    >
      <Image source={{ uri: img.url }} style={[styles.tile, style]} resizeMode="cover" />
    </Pressable>
  );

  let layout: React.ReactNode;

  if (images.length === 1) {
    layout = (
      <View style={[styles.wrap, { width: containerWidth }]}>
        <Pressable onPress={() => openViewer(0)} accessibilityRole="imagebutton">
          <Image
            source={{ uri: images[0].url }}
            style={[styles.single, { width: containerWidth, height: containerWidth * 0.75 }]}
            resizeMode="cover"
          />
        </Pressable>
      </View>
    );
  } else if (images.length === 2) {
    const side = (containerWidth - 4) / 2;
    layout = (
      <View style={[styles.row, { width: containerWidth }]}>
        {images.map((img, i) => renderTile(img, i, { width: side, height: side }))}
      </View>
    );
  } else if (images.length === 3) {
    const tileSide = (containerWidth - 8) / 3;
    layout = (
      <View style={[styles.row, { width: containerWidth }]}>
        {images.map((img, i) => renderTile(img, i, { width: tileSide, height: tileSide * 1.1 }))}
      </View>
    );
  } else {
    const tileSide = (containerWidth - 4) / 2;
    layout = (
      <View style={[styles.grid, { width: containerWidth }]}>
        {images.slice(0, 4).map((img, i) => renderTile(img, i, { width: tileSide, height: tileSide }))}
      </View>
    );
  }

  return (
    <>
      {layout}
      <ImageViewer
        visible={viewerIndex !== null}
        images={images}
        initialIndex={viewerIndex ?? 0}
        onClose={closeViewer}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10, borderRadius: RADIUS.md, overflow: 'hidden', backgroundColor: COLORS.GRAY_100 },
  single: { borderRadius: RADIUS.md },
  row: { flexDirection: 'row', gap: 4, marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 10 },
  tile: { backgroundColor: COLORS.GRAY_100, borderRadius: RADIUS.sm },
});
