// MergedImageGrid.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";

const MAX_COLS = 4;
const MAX_IMAGES = 16;

type TImageSize = { uri: string; width: number; height: number };

const fetchImageSize = (uri: string): Promise<TImageSize> =>
  new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ uri, width, height }),
      () => resolve({ uri, width: 1, height: 1 }),
    );
  });

const MergedImageGrid = ({
  images = [],
  onCapture,
}: {
  images: string[];
  onCapture: any;
}) => {
  const gridRef = useRef(null);
  const imageSizes = useRef<TImageSize[]>([]);

  const { width: screenWidth } = useWindowDimensions();

  const [loading, setLoading] = useState(true);

  const visibleImages = images.slice(0, MAX_IMAGES);
  const cols = Math.min(visibleImages.length, MAX_COLS);
  const cellWidth = screenWidth / cols;

  const getRowHeights = useCallback(() => {
    const sizes = imageSizes.current;
    const rowHeights = [];
    for (let i = 0; i < sizes.length; i += cols) {
      const rowImages = sizes.slice(i, i + cols);
      const maxHeight = Math.max(
        ...rowImages.map(({ width, height }) => {
          const aspectRatio = height / width;
          return cellWidth * aspectRatio;
        }),
      );
      rowHeights.push(maxHeight);
    }
    return rowHeights;
  }, [cellWidth, cols]);

  const capture = useCallback(async () => {
    try {
      const base64 = await captureRef(gridRef, {
        format: "png",
        result: "base64",
        quality: 1,
      });
      return base64;
    } catch (err) {
      console.error("Capture failed:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (visibleImages.length === 0) return;
    const fetchSize = async () => {
      try {
        const size = await Promise.all(visibleImages.map(fetchImageSize));
        imageSizes.current = size;
      } finally {
        setLoading(false);
      }
    };

    fetchSize();
  }, [visibleImages]);

  useEffect(() => {
    if (onCapture) {
      onCapture(capture);
    }
  }, [capture, onCapture]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  const rowHeights = getRowHeights();
  const rows = [];
  for (let i = 0; i < visibleImages.length; i += cols) {
    rows.push(visibleImages.slice(i, i + cols));
  }

  return (
    <ViewShot ref={gridRef} style={{ backgroundColor: "#ffffff" }}>
      {rows.map((rowImages, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {rowImages.map((uri, colIndex) => (
            <Image
              key={colIndex}
              source={{ uri }}
              style={{
                width: cellWidth,
                height: rowHeights[rowIndex],
                backgroundColor: "#ffffff",
              }}
              resizeMode="contain"
            />
          ))}
        </View>
      ))}
    </ViewShot>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
});

export default MergedImageGrid;
