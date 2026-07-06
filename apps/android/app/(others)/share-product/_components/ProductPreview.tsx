import { APP_NAME } from "@/constants/const";
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
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";

interface ImageType {
  url: string;
  imageType: "full" | "group" | "card";
}

const MAX_COLS = 4;
const MAX_IMAGES = 16;

type TImageSize = {
  uri: string;
  width: number;
  height: number;
  imageType: "group" | "full" | "card";
};

const SCREEN_WIDTH = Dimensions.get("window").width;

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

const getImageDimensions = (
  size: TImageSize,
  colsInRow: number,
  takeAsMaxCols: boolean = false,
) => {
  const cols = takeAsMaxCols ? MAX_COLS : colsInRow;
  const cellWidth = SCREEN_WIDTH / cols;
  const aspectRatio = size.height / size.width;
  let cellHeight = cellWidth * aspectRatio;

  return { cellWidth, cellHeight };
};

const buildSmartRows = (sizes: TImageSize[]): TImageSize[][] => {
  const cards = sizes.filter(
    (s) => s.imageType === "card" && s.width <= s.height,
  );
  const columnCards = sizes.filter(
    (s) =>
      (s.imageType === "card" && s.width > s.height) || s.imageType !== "card",
  );

  const rows: TImageSize[][] = [];

  // First, push all the column cards
  for (const image of columnCards) {
    const { cellHeight, cellWidth } = getImageDimensions(image, 1);

    image["width"] = cellWidth;
    image["height"] = cellHeight;

    rows.push([image]);
  }

  let i = 0;
  // Now let's push the card images
  while (i < cards.length) {
    const cardRow: TImageSize[] = [];
    const numberOfCols = Math.min(cards.length, MAX_COLS);

    while (cardRow.length < numberOfCols && i < cards.length) {
      const takeAsMaxCols =
        columnCards.length > 0 || cards.length - i >= MAX_COLS;

      const { cellHeight, cellWidth } = getImageDimensions(
        cards[i],
        numberOfCols,
        takeAsMaxCols,
      );

      cards[i]["width"] = cellWidth;
      cards[i]["height"] = cellHeight;

      cardRow.push(cards[i]);
      i++;
    }

    if (cardRow.length > 0) {
      rows.push(cardRow);
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

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<TImageSize[][]>([]);

  const visibleImages = useMemo(() => images.slice(0, MAX_IMAGES), [images]);

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
    <ViewShot
      ref={gridRef}
      style={{ position: "relative", backgroundColor: "#ffffff" }}
    >
      <Text style={styles.overlayText}>{APP_NAME}</Text>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item, colIndex) => (
            <Image
              key={colIndex}
              source={{ uri: item.uri }}
              style={{
                width: item.width,
                height: item.height,
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
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  overlayText: {
    zIndex: 1,
    position: "absolute",
    top: "50%",
    left: "50%",
    fontSize: 24,
    opacity: 0.05,
    color: "black",
    fontWeight: "900",
    transform: [
      { translateX: "-50%" },
      { translateY: "-50%" },
      {
        rotate: "-40deg",
      },
    ],
  },
});

export default MergedImageGrid;
