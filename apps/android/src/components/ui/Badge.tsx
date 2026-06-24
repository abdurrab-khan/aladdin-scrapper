import { LinearGradient, LinearGradientProps } from "expo-linear-gradient";
import { StyleSheet, Text } from "react-native";

function Badge({
  text,
  color = ["#ff5f6d", "#d7263d"],
  textColor = "white",
}: {
  text?: string | null;
  color?: LinearGradientProps["colors"];
  textColor?: string;
}) {
  if (!text) return null;

  return (
    <LinearGradient
      colors={color}
      style={styles.badgeContainer}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 0 }}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: textColor,
          },
        ]}
      >
        {text}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    marginBottom: 4,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 0.3,
    borderColor: "#e63946",
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default Badge;
