import { useDeleteProductsMutation } from "@/api/hooks/useDeleteProductsMutation";
import { useProductStore } from "@/store/useProductStore";
import { LinearGradient, LinearGradientProps } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { IconSymbol } from "../ui/IconSymbol";
import ButtonWithDialog from "./ButtonWithDialog";

interface DeleteProductProps {
  ids: string[];
  btnTitle?: string;
  iconSize?: number;
  btnStyle: StyleProp<ViewStyle>;
  gradientColor: LinearGradientProps["colors"];
}

const DeleteProduct = ({
  ids,
  btnTitle,
  btnStyle,
  iconSize = 18,
  gradientColor,
}: DeleteProductProps) => {
  const { clearSelection } = useProductStore();
  const [visible, setVisible] = useState<boolean>(false);
  const deleteMutation = useDeleteProductsMutation();

  const handleProductDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ ids });

      ToastAndroid.show("Product deleted successfully", ToastAndroid.SHORT);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the product.";
      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
    } finally {
      clearSelection();
      setVisible(false);
    }
  };

  return (
    <ButtonWithDialog
      visible={visible}
      isLoading={deleteMutation.isPending}
      setVisible={setVisible}
      dialogTitle="Do you really want to delete this product?"
      dialogButtonAction={handleProductDelete}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        delayLongPress={100}
        onLongPress={() => {}}
        onPress={() => setVisible(true)}
      >
        <LinearGradient
          colors={
            gradientColor && gradientColor.length > 0
              ? gradientColor
              : ["#ff5f6d", "#d7263d"]
          }
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={btnStyle}
        >
          <View style={deleteProductStyle.btnContent}>
            <IconSymbol name="trash-outline" color={"white"} size={iconSize} />
            {btnTitle && (
              <Text style={deleteProductStyle.btnTitle}>{btnTitle}</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </ButtonWithDialog>
  );
};

const deleteProductStyle = StyleSheet.create({
  btnContent: {
    gap: 6,
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

export default DeleteProduct;
