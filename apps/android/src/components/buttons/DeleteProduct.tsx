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
  id: string[] | string;
  imageId: string[] | string;
  btnTitle?: string;
  btnStyle: StyleProp<ViewStyle>;
  iconSize?: number;
  gradientColor: LinearGradientProps["colors"];
}

const DeleteProduct = ({
  id,
  imageId,
  btnTitle,
  gradientColor,
  iconSize = 18,
  btnStyle,
}: DeleteProductProps) => {
  const { clearSelection } = useProductStore();
  const [visible, setVisible] = useState<boolean>(false);
  const deleteMutation = useDeleteProductsMutation();

  const handleProductDelete = async () => {
    try {
      const ids = Array.isArray(id) ? id : [id];
      const imageIds = Array.isArray(imageId) ? imageId : [imageId];

      await deleteMutation.mutateAsync({ ids, imageIds });

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
          colors={gradientColor}
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
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  btnTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DeleteProduct;
