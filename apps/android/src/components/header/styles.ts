import { StyleSheet } from "react-native";

export const HeaderStyle = StyleSheet.create({
  headerContainer: {
    height: 44,
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    height: 48,
    width: 48,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
});
