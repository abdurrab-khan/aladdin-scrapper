/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

// Gradient background
export const DARK_GRADIENT_BACKGROUND = ["#011325", "#021425"];

// Gradient card colors
export const GRADIENT_CARD_COLOR = ["#002a39", "#002a3a"];

// Gradient button colors
export const LIGHT_GRADIENT_BUTTON = ["#1d4b88", "#2b6da0"];
export const DARK_GRADIENT_BUTTON = ["#1f2934", "#242e39"];

// Solid button colors
export const DARK_BUTTON_COLOR = "#00364a";
export const LIGHT_BUTTON_COLOR = "#07a3b9";

// Colors object with light and dark colors
export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#95b9c8",
    titleText: "#e3f5f8",
    background: "#011325",
    header: "#1c2e4a",
    tint: tintColorDark,
    icon: "#9BA1A6",
    borderColor: "#174153",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
