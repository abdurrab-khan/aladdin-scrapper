import React from "react";
import { View, Text, StyleSheet } from "react-native";
import RNSlider, {
  SliderProps as RNSliderProps,
} from "@react-native-community/slider";

interface SliderProps extends RNSliderProps {
  label: string;
}

function Slider({ label, ...props }: SliderProps) {
  return (
    <View>
      <Text style={[styles.label]}>{label}</Text>
      <RNSlider
        step={5}
        minimumValue={0}
        maximumValue={100}
        minimumTrackTintColor={"white"}
        maximumTrackTintColor="#1a3a4a"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: "#a79b9b",
  },
});

export default Slider;
