import React from "react";
import { Text, View } from "react-native";

function FormSkeleton() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 18, fontWeight: 500, color: "white" }}>
        Loading....
      </Text>
    </View>
  );
}

export default FormSkeleton;
