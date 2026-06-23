import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

function FormSkeleton() {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  const SkeletonItem = ({ style }: { style: any }) => (
    <Animated.View
      style={[{ backgroundColor: Colors.dark.header, opacity }, style]}
    />
  );

  return (
    <View style={styles.formView}>
      <View style={{ flex: 1, position: "relative" }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Image Placeholder */}
          <SkeletonItem style={styles.imagePlaceholder} />

          {/* Platform Selector Placeholder */}
          <View style={styles.section}>
            <SkeletonItem style={styles.labelPlaceholder} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.platformRow}
            >
              {[1, 2, 3, 4].map((i) => (
                <SkeletonItem key={i} style={styles.platformIconPlaceholder} />
              ))}
            </ScrollView>
          </View>

          {/* Caption Input Placeholder */}
          <View style={styles.section}>
            <SkeletonItem style={styles.labelPlaceholder} />
            <SkeletonItem style={[styles.inputPlaceholder, { height: 180 }]} />
          </View>

          {/* Tags Input Placeholder */}
          <View style={styles.section}>
            <SkeletonItem style={styles.labelPlaceholder} />
            <SkeletonItem style={[styles.inputPlaceholder, { height: 80 }]} />
          </View>
        </ScrollView>

        <SkeletonItem
          style={[
            styles.buttonPlaceholder,
            { bottom: Math.max(insets.bottom, 20) },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formView: {
    flex: 1,
    height: WINDOW_HEIGHT,
    backgroundColor: Colors.dark.background,
  },
  scrollViewContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 150,
  },
  section: {
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
  },
  labelPlaceholder: {
    width: 100,
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
  platformRow: {
    flexDirection: "row",
    gap: 12,
  },
  platformIconPlaceholder: {
    width: 120,
    height: 46,
    borderRadius: 8,
  },
  inputPlaceholder: {
    width: "100%",
    borderRadius: 8,
  },
  buttonPlaceholder: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 50,
    borderRadius: 12,
  },
});

export default FormSkeleton;
