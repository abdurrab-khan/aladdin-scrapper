import { useCallback, useRef, useState } from "react";
import { Image, View, type ImageStyle } from "react-native";
import { captureRef } from "react-native-view-shot";

type ImageSize = { width: number; height: number };

type MergeOptions = {
  direction?: "row" | "column";
  gap?: number;
  format?: "png" | "jpg";
  result?: "tmpfile" | "base64" | "data-uri";
};

type MergeResult = {
  uri: string;
  width: number;
  height: number;
};

type Position = { left: number; top: number; width: number; height: number };

const getImageSize = (url: string): Promise<ImageSize | null> =>
  new Promise((resolve) => {
    Image.getSize(
      url,
      (width, height) => resolve({ width, height }),
      () => resolve(null),
    );
  });

export const useImageCompositor = () => {
  const [imageLoading, setImageLoading] = useState(false);

  const containerRef = useRef<View>(null);
  const loadedRef = useRef(0);
  const busyRef = useRef(false);

  const [canvas, setCanvas] = useState<{
    urls: string[];
    positions: Position[];
    width: number;
    height: number;
  } | null>(null);

  const jobRef = useRef<{
    resolve: (r: MergeResult) => void;
    reject: (e: Error) => void;
    options: MergeOptions;
  } | null>(null);

  const finish = useCallback(async () => {
    const job = jobRef.current;
    if (!containerRef.current || !job || !canvas) return;

    try {
      const uri = await captureRef(containerRef.current, {
        format: job.options.format ?? "png",
        quality: 1,
        result: job.options.result ?? "tmpfile",
      });
      job.resolve({ uri, width: canvas.width, height: canvas.height });
    } catch (error) {
      job.reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setCanvas(null);
      jobRef.current = null;
      busyRef.current = false;
      setImageLoading(false);
    }
  }, [canvas]);

  const onImageSettled = useCallback(() => {
    if (!canvas) return;
    loadedRef.current += 1;
    if (loadedRef.current >= canvas.urls.length) {
      // give RN a few frames to finish painting before snapshotting
      setTimeout(finish, 100);
    }
  }, [canvas, finish]);

  const mergeImages = useCallback(
    (images: string[], options: MergeOptions = {}): Promise<MergeResult> => {
      return new Promise((resolve, reject) => {
        if (busyRef.current) {
          reject(
            new Error(
              "A merge is already in progress. This hook can only run one merge at a time " +
                "(it shares a single hidden view) — queue calls or use a native headless " +
                "compositor if you need concurrent merges.",
            ),
          );
          return;
        }

        busyRef.current = true;
        setImageLoading(true);

        (async () => {
          try {
            const sizesWithNulls = await Promise.all(images.map(getImageSize));
            const validUrls: string[] = [];
            const sizes: ImageSize[] = [];
            sizesWithNulls.forEach((size, i) => {
              if (size) {
                validUrls.push(images[i]);
                sizes.push(size);
              }
            });

            if (validUrls.length === 0) {
              throw new Error("No valid images could be loaded.");
            }

            const gap = options.gap ?? 5;
            const maxHeight = Math.max(...sizes.map((s) => s.height));
            const maxWidth = Math.max(...sizes.map((s) => s.width));
            const direction =
              options.direction ?? (maxHeight > maxWidth ? "row" : "column");

            let offset = 0;
            const positions: Position[] = sizes.map((s) => {
              const pos: Position =
                direction === "row"
                  ? { left: offset, top: 0, width: s.width, height: s.height }
                  : { left: 0, top: offset, width: s.width, height: s.height };
              offset += (direction === "row" ? s.width : s.height) + gap;
              return pos;
            });

            // Sized to the chosen direction (the original always used totalWidth x
            // maxHeight, which clipped the column case — fixed here).
            const width = direction === "row" ? offset - gap : maxWidth;
            const height = direction === "row" ? maxHeight : offset - gap;

            loadedRef.current = 0;
            jobRef.current = { resolve, reject, options };
            setCanvas({ urls: validUrls, positions, width, height });
          } catch (error) {
            busyRef.current = false;
            setImageLoading(false);
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        })();
      });
    },
    [],
  );

  const CompositorCanvas = canvas ? (
    <View
      ref={containerRef}
      collapsable={false}
      style={{
        position: "absolute",
        left: -9999,
        top: -9999,
        width: canvas.width,
        height: canvas.height,
        backgroundColor: "#FFFFFF",
      }}
    >
      {canvas.urls.map((url, i) => (
        <Image
          key={`${url}-${i}`}
          source={{ uri: url }}
          onLoad={onImageSettled}
          onError={onImageSettled}
          style={
            {
              position: "absolute",
              left: canvas.positions[i].left,
              top: canvas.positions[i].top,
              width: canvas.positions[i].width,
              height: canvas.positions[i].height,
            } as ImageStyle
          }
        />
      ))}
    </View>
  ) : null;

  return { mergeImages, imageLoading, CompositorCanvas };
};
