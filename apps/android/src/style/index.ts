import { StyleSheet } from "react-native";
import { DARK_THEME, LIGHT_THEME } from "./theme.ts";

export const app = StyleSheet.create({
  border: {},
  darkContainer: {
    color: DARK_THEME.textColor,
    backgroundColor: DARK_THEME.backgroundColor,
  },
  lightContainer: {
    color: LIGHT_THEME.textColor,
    backgroundColor: LIGHT_THEME.backgroundColor,
  },
  darkBorder: {
    borderWidth: 1,
    borderColor: DARK_THEME.borderColor,
  },
});
