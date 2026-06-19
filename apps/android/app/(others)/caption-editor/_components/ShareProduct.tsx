import React, { useState } from "react";
import { Control } from "react-hook-form";

import { shareProduct } from "../../../../src/api/services/share-product";
import { LinearGradient, LinearGradientProps } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  StyleProp,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { IconSymbol } from "../../../../src/components/ui/IconSymbol";
import ButtonWithDialog from "../../../../src/components/buttons/ButtonWithDialog";
import {
  deleteProductImage,
  updateProduct,
  uploadProductImage,
} from "../../../../src/api/services/product";
import { CaptionDetails } from "../../../../src/types";

interface ShareProductProps {
  btnTitle?: string;
  disabled: boolean;
  control: Control<any>;
  btnStyle: StyleProp<ViewStyle>;
  gradientColor: LinearGradientProps["colors"];
  handleSubmit: any;
}
const ShareProduct = ({
  control,
  btnTitle,
  btnStyle,
  disabled,
  handleSubmit,
  gradientColor,
}: ShareProductProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Share product functionality
  const handleProductShare = async (data: CaptionDetails) => {
    let productImageUrl: Awaited<ReturnType<typeof uploadProductImage>> = {
      imagePath: "",
      imageUrl: "",
    };

    // Update loading state to true
    setLoading(true);

    try {
      productImageUrl = await uploadProductImage(
        data.productImage as Uint8Array,
      );
      data.productImage = productImageUrl.imageUrl;

      const shareResponse = await shareProduct(data);

      if (shareResponse.data?.success) {
        ToastAndroid.show(
          shareResponse.data?.message ?? "Successfully posted",
          ToastAndroid.SHORT,
        );

        // Update the product as shared
        await updateProduct(data.ids, { is_posted: true });
      }

      // Re-direct to home page.
      if (router.canGoBack()) {
        router.back();
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "An error occurred while sharing the product.";
      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      return;
    } finally {
      setVisible(false);
      setLoading(false); // Stop loading

      // Delete the uploaded image after sharing
      if (productImageUrl?.imagePath) {
        await deleteProductImage(productImageUrl.imagePath);
      }
    }
  };

  // Make visible true to show the dialog to share product
  const handleButtonPress = () => {
    if (!control) {
      ToastAndroid.show("Form controller not initialized.", ToastAndroid.SHORT);
      return;
    }
    const errors = control._formState.errors;
    if (Object.keys(errors).length > 0) {
      const message =
        errors["platforms"]?.message ||
        errors["caption"]?.message ||
        errors["productUrls"]?.message ||
        errors["ids"]?.message ||
        errors["productImage"]?.message ||
        "Please fill all required fields correctly.";

      ToastAndroid.show(message as string, ToastAndroid.SHORT);
      return;
    }

    // Show the dialog to share product
    setVisible(true);
  };

  const onDialogConfirm = () => {
    if (typeof handleSubmit === "function") {
      handleSubmit(handleProductShare)();
    } else {
      console.error("handleSubmit is not a function:", handleSubmit);
      ToastAndroid.show(
        "Internal error: Share function failed.",
        ToastAndroid.SHORT,
      );
    }
  };

  return (
    <React.Fragment>
      {/* Dialog to show to share product*/}
      <ButtonWithDialog
        visible={visible}
        setVisible={setVisible}
        isLoading={loading}
        dialogTitle="Do you really want to share this product?"
        dialogButtonAction={onDialogConfirm}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          delayLongPress={100}
          disabled={disabled}
          onPress={handleButtonPress}
        >
          <LinearGradient
            colors={
              gradientColor && gradientColor.length > 0
                ? gradientColor
                : ["#1d4b88", "#2b6da0"]
            }
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={btnStyle}
          >
            {/* Button title container */}
            {
              <View style={shareProductStyle.btnContent}>
                <IconSymbol
                  name="share-social-outline"
                  color={"white"}
                  size={18}
                />
                {btnTitle && (
                  <Text style={shareProductStyle.btnTitle}>{btnTitle}</Text>
                )}
              </View>
            }
          </LinearGradient>
        </TouchableOpacity>
      </ButtonWithDialog>
    </React.Fragment>
  );
};

const shareProductStyle = StyleSheet.create({
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

export default ShareProduct;
