import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";

interface ImageType {
  url: string;
  imageType: "full" | "group" | "card";
}

const MAX_COLS = 4;
const MAX_IMAGES = 16;

type TRow = {
  images: TImageSize[];
  colsCount: number;
};

type TImageSize = {
  uri: string;
  width: number;
  height: number;
  imageType: "group" | "full" | "card";
};

const fetchImageSize = (image: ImageType): Promise<TImageSize> =>
  new Promise((resolve) => {
    Image.getSize(
      image.url,
      (width, height) => {
        resolve({
          uri: image.url,
          width,
          height,
          imageType: image.imageType,
        });
      },
      () =>
        resolve({
          uri: image.url,
          width: 1,
          height: 1,
          imageType: image.imageType,
        }),
    );
  });

const buildSmartRows = (sizes: TImageSize[]): TRow[] => {
  const grouped = sizes.filter((s) => s.imageType === "group");
  const cards = sizes.filter((s) => s.imageType === "card");

  const sorted = [...grouped, ...cards];

  let i = 0;
  const rows: TRow[] = [];

  for (const image of sorted) {
    if (image.imageType === "group") {
      rows.push({
        images: [image],
        colsCount: 1,
      });
      i++;
    } else {
      const cardRow: TImageSize[] = [];
      let cardsInRow = 0;

      while (
        i < sorted.length &&
        cardsInRow < MAX_COLS &&
        sorted[i].imageType !== "group"
      ) {
        cardRow.push(sorted[i]);
        cardsInRow++;
        i++;
      }

      rows.push({
        images: cardRow,
        colsCount: cardsInRow,
      });
    }
  }

  return rows;
};

const MergedImageGrid = ({
  images = [],
  onCapture,
}: {
  images: ImageType[];
  onCapture: any;
}) => {
  const gridRef = useRef(null);

  const { width: screenWidth } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<TRow[]>([]);

  const visibleImages = useMemo(() => images.slice(0, MAX_IMAGES), [images]);

  const getImageDimensions = useCallback(
    (size: TImageSize, colsInRow: number) => {
      const cellWidth = screenWidth / colsInRow;
      const aspectRatio = size.height / size.width;
      let cellHeight = cellWidth * aspectRatio;

      // For card images, cap the width to max 150px if single card
      // so it doesn't stretch to fill the remaining space
      let finalWidth = cellWidth;
      if (size.imageType === "card" && colsInRow === 1) {
        const maxCardWidth = cellWidth;
        if (cellWidth > maxCardWidth) {
          finalWidth = maxCardWidth;
          cellHeight = maxCardWidth * aspectRatio;
        }
      }

      return { cellWidth: finalWidth, cellHeight };
    },
    [screenWidth],
  );

  const capture = useCallback(async () => {
    try {
      const base64 = await captureRef(gridRef, {
        format: "png",
        result: "base64",
        quality: 1,
      });
      return base64;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (visibleImages.length === 0) return;

    const fetchSize = async () => {
      try {
        const sizes = await Promise.all(visibleImages.map(fetchImageSize));
        const smartRows = buildSmartRows(sizes);
        setRows(smartRows);
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

  return (
    <ViewShot ref={gridRef} style={{ backgroundColor: "#ffffff" }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.images.map((item, colIndex) => {
            const { cellWidth, cellHeight } = getImageDimensions(
              item,
              row.colsCount,
            );
            return (
              <Image
                key={colIndex}
                source={{ uri: item.uri }}
                style={{
                  width: cellWidth,
                  height: cellHeight,
                  backgroundColor: "#ffffff",
                }}
                resizeMode="contain"
              />
            );
          })}
        </View>
      ))}
    </ViewShot>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});

export default MergedImageGrid;
