import { IconSymbol } from "@/components/ui/IconSymbol";
import toast from "@/utils";
import { LinearGradient, LinearGradientProps } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, Vibration, View } from "react-native";

interface ShareBtnProps {
  productId: string;
  isPosted: boolean;
  hasAffiliate: boolean;
  onToggleDialog: (visible: boolean) => void;
}

function ShareBtn({
  productId,
  isPosted,
  hasAffiliate,
  onToggleDialog,
}: ShareBtnProps) {
  const handleBtnLongPress = () => {
    Vibration.vibrate(50);
    onToggleDialog(true);
  };

  const handlePageRedirect = () => {
    if (!hasAffiliate) {
      toast("Please add affiliate link first");
    }

    // Redirect to caption editor page
    router.push({
      pathname: `/(others)/share-product`,
      params: { ids: [productId] },
    });
  };

  const btnGradient: LinearGradientProps["colors"] = isPosted
    ? ["#b20000a9", "#f74141ff"]
    : ["#1d4b88", "#2b6da0"];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      delayLongPress={100}
      onPress={handlePageRedirect}
      onLongPress={handleBtnLongPress}
      style={{
        width: "100%",
      }}
    >
      <LinearGradient
        colors={btnGradient}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={styles.btnStyle}
      >
        <View style={styles.btnContent}>
          <IconSymbol name="share-social-outline" color={"white"} size={18} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnStyle: {
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99999,
  },
  btnContent: {
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});

export default ShareBtn;
