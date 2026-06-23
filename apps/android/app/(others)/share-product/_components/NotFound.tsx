import React from "react";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";

function NotFound() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconSymbol
          name="alert-circle-outline"
          size={64}
          color={Colors.dark.text}
        />
      </View>
      <Text style={styles.title}>Products Not Found</Text>
      <Text style={styles.description}>
        We couldn&apos;t find the products you&apos;re looking for. They might
        have been deleted or the link is invalid.
      </Text>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() => router.replace("/(home)")}
      >
        <Text style={styles.buttonText}>Go Back Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: Colors.dark.background,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.dark.header,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.titleText,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: Colors.dark.text,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
  },
  button: {
    backgroundColor: Colors.dark.header,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.borderColor,
  },
  buttonText: {
    color: Colors.dark.titleText,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NotFound;
