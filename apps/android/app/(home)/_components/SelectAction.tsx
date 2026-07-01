import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import toast from "@/utils";

import { Colors } from "@/constants/Colors";

import { useProductStore } from "@/store/useProductStore";

import { IconSymbol } from "../../../src/components/ui/IconSymbol";
import DeleteProduct from "../../../src/components/buttons/DeleteProduct";

const SelectAction: React.FC = () => {
  const { selectedProducts, clearSelection } = useProductStore();
  const slideAnim = useRef(new Animated.Value(300)).current;

  const handlePageRedirect = () => {
    if (selectedProducts.size > 16) {
      toast("You can't share more than 16 products at once");
      return;
    }

    clearSelection();

    router.push({
      pathname: "/(others)/share-product",
      params: { ids: Array.from(selectedProducts).join(",") },
    });
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectedProducts.size > 0 ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedProducts.size, slideAnim]);

  return (
    <Animated.View
      style={[
        selectActionStyle.actionContainer,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={selectActionStyle.selectionActions}>
        <Text style={selectActionStyle.selectionText}>
          {selectedProducts.size} items selected
        </Text>

        {/* Share & Delete Buttons */}
        <View style={selectActionStyle.buttonContainer}>
          <DeleteProduct
            btnTitle="Delete"
            btnStyle={actionBtnStyle.btn}
            ids={Array.from(selectedProducts)}
            gradientColor={["#e8896d", "#da5063"]}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            delayLongPress={100}
            onPress={handlePageRedirect}
          >
            <LinearGradient
              colors={["#b14793ff", "#c44ba1"]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={actionBtnStyle.btn}
            >
              <View style={actionBtnStyle.btnContent}>
                <IconSymbol
                  name="share-social-outline"
                  color={"white"}
                  size={18}
                />
                <Text style={actionBtnStyle.btnTitle}>Share</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const selectActionStyle = StyleSheet.create({
  actionContainer: {
    right: 0,
    bottom: 16,
    width: "100%",
    zIndex: 1000,
    borderWidth: 1,
    borderRadius: 8,
    marginInline: 12,
    position: "absolute",
    alignItems: "center",
    elevation: 4,
    shadowRadius: 4,
    shadowOpacity: 0.3,
    shadowColor: Colors.dark.borderColor,
    shadowOffset: { width: 0, height: 2 },
    borderColor: Colors.dark.borderColor,
    backgroundColor: Colors.dark.background,
  },
  selectionActions: {
    rowGap: 6,
    paddingVertical: 8,
    alignItems: "center",
    flexDirection: "column",
  },
  groupProducts: {
    gap: 8,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
  },
  groupTitle: {
    fontSize: 14,
    color: "white",
    fontWeight: "700",
  },
  selectionText: {
    fontSize: 16,
    color: "#fefc",
    fontWeight: 600,
  },
  buttonContainer: {
    gap: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
});

const actionBtnStyle = StyleSheet.create({
  btn: {
    gap: 4,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: 500,
    color: "white",
    textAlign: "center",
  },
  btnStyle: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  btnContent: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnTitle: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
});

export default SelectAction;
