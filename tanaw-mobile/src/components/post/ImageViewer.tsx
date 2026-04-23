import React, { useRef } from 'react';
import {
  Modal, View, Image, Text, TouchableOpacity, FlatList, Dimensions, StatusBar, StyleSheet,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { PostImage } from '../../types/post.types';

interface Props {
  visible: boolean;
  images: PostImage[];
  initialIndex: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ImageViewer({ visible, images, initialIndex, onClose }: Props) {
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);
  const listRef = useRef<FlatList<PostImage>>(null);

  React.useEffect(() => {
    if (visible) setActiveIndex(initialIndex);
  }, [visible, initialIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BLACK} />
      <View style={styles.root}>
        <FlatList
          ref={listRef}
          data={images}
          keyExtractor={(img) => img.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.page}
              activeOpacity={1}
              onPress={onClose}
            >
              <Image source={{ uri: item.url }} style={styles.image} resizeMode="contain" />
            </TouchableOpacity>
          )}
        />

        <SafeAreaView edges={['top']} style={styles.topBar} pointerEvents="box-none">
          <View style={styles.topBarInner} pointerEvents="box-none">
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close image viewer"
            >
              <Ionicons name="close" size={26} color={COLORS.WHITE} />
            </TouchableOpacity>
            {images.length > 1 && (
              <Text style={styles.counter}>
                {activeIndex + 1} / {images.length}
              </Text>
            )}
            <View style={styles.rightSpacer} />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.BLACK },
  page: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  image: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  counter: { color: COLORS.WHITE, fontSize: 14, fontWeight: '700' },
  rightSpacer: { width: 40 },
});
