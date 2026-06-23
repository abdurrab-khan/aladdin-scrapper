import * as z from "zod";
import React, { useState } from "react";
import { router } from "expo-router";
import { Control } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CaptionDetails } from "@/types";
import toast from "@/utils/toast";
import ButtonWithDialog from "@/components/buttons/ButtonWithDialog";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { uploadProductImage } from "@/api/services/product";
import { shareProduct } from "@/api/services/share-product";
import { CaptionDetailsSchema } from "@/api/schemas/caption.schema";

interface SubmitBtnProps {
  isLoading: boolean;
  productImage: string[];
  handleSubmit: any;
  control: Control<z.infer<typeof CaptionDetailsSchema>>;
}

function SubmitBtn({
  isLoading,
  control,
  productImages,
  handleSubmit,
}: SubmitBtnProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const loading = isLoading || isSubmitting;

  const handleProductShare = async (data: CaptionDetails) => {
    let productImageUrl: Awaited<ReturnType<typeof uploadProductImage>> = {
      imagePath: "",
      imageUrl: "",
    };

    setIsSubmitting(true);

    try {
      productImageUrl = await uploadProductImage(
        data.productImage as Uint8Array,
      );
      data.productImage = productImageUrl.imageUrl;

      // Share the product
      const shareResponse = await shareProduct(data);

      toast(shareResponse.data?.message ?? "Successfully posted");

      // Re-direct to home page.
      if (router.canGoBack()) {
        router.back();
      }
    } catch (e) {
      toast(
        e instanceof Error
          ? e.message
          : "An error occurred while sharing the product.",
      );
      return;
    } finally {
      setVisible(false);
      setIsSubmitting(false);
    }
  };

  const handleButtonPress = () => {
    const errors = control._formState.errors;

    // Show the dialog to share product
    if (Object.keys(errors).length === 0) {
      setVisible(true);
      return;
    }

    const message =
      errors["platforms"]?.message ||
      errors["caption"]?.message ||
      errors["productUrls"]?.message ||
      errors["ids"]?.message ||
      errors["productImage"]?.message ||
      "Please fill all required fields correctly.";

    toast(message as string);
  };

  const onDialogConfirm = () => {
    if (typeof handleSubmit === "function") {
      handleSubmit(handleProductShare)();
    } else {
      console.error("handleSubmit is not a function:", handleSubmit);
      toast("Internal error: Share function failed.");
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: Math.max(insets.bottom, 20),
        zIndex: 999,
        elevation: 5,
      }}
    >
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
          disabled={loading}
          onPress={handleButtonPress}
        >
          <LinearGradient
            colors={["#1d4b88", "#2b6da0"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={styles.btnStyle}
          >
            <View style={styles.btnContent}>
              <IconSymbol
                name="share-social-outline"
                color={"white"}
                size={18}
              />
              <Text style={styles.btnTitle}>Share Product</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ButtonWithDialog>
    </View>
  );
}

const styles = StyleSheet.create({
  btnStyle: {
    borderRadius: 12,
    paddingVertical: 14,
  },
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

export default SubmitBtn;
