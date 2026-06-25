import { Colors } from "../constants/Colors";
import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ContainerBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function SafeContainer({
  children,
  style = {},
}: ContainerBackgroundProps) {
  return (
    <SafeAreaView style={[styles.safeAreaView, style]}>{children}</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  safeAreaView: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: Colors.dark.background,
  },
});
