import { StyleSheet, Text, TextInput, View } from "react-native";

import { Colors } from "@/constants/Colors";

interface InputProps {
  value: string;
  placeHolder?: string;
  [key: string]: any;
}

const Input: React.FC<InputProps> = ({ placeHolder, value, ...props }) => {
  return (
    <View style={styles.container}>
      {placeHolder && (
        <View>
          <Text style={styles.placeholderTitle}>{placeHolder}</Text>
        </View>
      )}
      <TextInput
        value={value}
        style={styles.text}
        placeholder={placeHolder}
        autoCorrect={false}
        autoCapitalize="none"
        keyboardType="default"
        enablesReturnKeyAutomatically
        placeholderTextColor={Colors.dark.text}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  placeholderTitle: {
    fontSize: 13,
    color: Colors.dark.titleText,
    fontWeight: "500",
  },
  text: {
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: Colors.dark.text,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});

export default Input;
