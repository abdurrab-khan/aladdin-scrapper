import { useRef } from "react";
import { captureRef } from "react-native-view-shot";

const useMergedImage = () => {
  const gridRef = useRef(null);

  const capture = async () => {
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
  };

  return { gridRef, capture };
};

export default useMergedImage;
