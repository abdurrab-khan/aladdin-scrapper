import { SkFont } from "@shopify/react-native-skia";

export interface Caption {
  text: string;
  x: number;
  y: number;
  height: number;
  width: number;
  backgroundColor: string;
  textStyle: {
    color: string;
    font: SkFont;
    padding?: number;
    paddingHorizontal?: number;
    paddingVertical?: number;
  };
}
