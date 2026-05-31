import { Skia, SkImage } from "@shopify/react-native-skia";
import { useCallback, useState } from "react";

export const useImageCompositor = () => {
  const [imageLoading, setImageLoading] = useState<boolean>(false);

  // Load image from url
  const loadImageFromUrl = async (url: string): Promise<SkImage | null> => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const data = Skia.Data.fromBytes(uint8Array);
      return Skia.Image.MakeImageFromEncoded(data);
    } catch (error) {
      console.error("Failed to load image from URL:", error);
      return null;
    }
  };

  const mergeImages = useCallback(
    async (images: string[]): Promise<Uint8Array<ArrayBufferLike>> => {
      setImageLoading(true); // Set loading state to true
      try {
        const loadedImages = await Promise.all(
          images.map((img) => loadImageFromUrl(img))
        );

        // Filter out null images
        const validImages = loadedImages.filter((img): img is SkImage => img !== null);

        if (validImages.length === 0) {
          throw new Error("No valid images could be loaded.");
        }

        // Calculate total width and max height
        const totalWidth = validImages.reduce(
          (sum, img) => sum + img.width() + 5,
          0
        );

        const maxHeight = Math.max(
          ...validImages.map((img) => img.height())
        );
        const maxWidth = Math.max(
          ...validImages.map((img) => img.width())
        );

        // Create an offscreen surface
        const surface = Skia.Surface.MakeOffscreen(totalWidth || 100, maxHeight || 100);
        if (!surface) {
          throw new Error("Failed to create offscreen surface.");
        }

        const canvas = surface.getCanvas();
        if (!canvas) {
          throw new Error("Failed to get canvas from surface.");
        }

        // Fill background with white color
        canvas.drawColor(Skia.Color("#FFFFFF"));

        if (maxHeight > maxWidth) {
          // Drawing image side by side
          let xOffset = 0;
          validImages.forEach((img) => {
            canvas.drawImage(img, xOffset, 0);
            xOffset += img.width() + 5;
          });
        } else {
          // Drawing image in a column
          let yOffset = 0;
          validImages.forEach((img) => {
            canvas.drawImage(img, 0, yOffset);
            yOffset += img.height() + 5;
          });
        }

        const mergedImage = surface.makeImageSnapshot();
        const pngBytes = mergedImage.encodeToBytes();

        if (!pngBytes) {
          throw new Error("Failed to encode merged image to PNG.");
        }

        return pngBytes;
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Image merging failed: ${errMsg}`);
      } finally {
        setImageLoading(false);
      }
    },
    []
  );

  return {
    mergeImages,
    imageLoading,
  };
}
