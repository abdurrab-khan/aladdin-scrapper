import { useForm } from "react-hook-form";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useImageCompositor } from "../../../src/hooks/useImageCompositor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  StyleSheet,
  ScrollView,
  View,
  ToastAndroid,
  Text,
  Dimensions,
} from "react-native";
import * as z from "zod";

import CaptionEditorForm from "./_components/CaptionEditor";
import ShareProduct from "./_components/ShareProduct";

import { type LinearGradientProps } from "expo-linear-gradient";

import { Colors, LIGHT_GRADIENT_BUTTON } from "../../../src/constants/Colors";
import { CaptionDetailsSchema } from "../../../src/api/schemas/caption.schema";
import { getProductsByIds } from "../../../src/api/services/product";
import { getDefaultAffiliateLinks } from "../../../src/api/services/affiliate";
import {
  extractProductCaptionDetails,
  generateCaption,
  getRandomTags,
} from "../../../src/utils/caption-helper";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

export default function CaptionEditor() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { mergeImages, imageLoading, CompositorCanvas } = useImageCompositor();

  const { control, reset, setValue, handleSubmit, watch } = useForm<
    z.infer<typeof CaptionDetailsSchema>
  >({
    resolver: zodResolver(CaptionDetailsSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      ids: [],
      caption: "",
      tags: "",
      productUrls: [],
      productImage: new Uint8Array(),
      platforms: ["telegram"],
    },
  });

  const productImage = watch("productImage");

  const mergedProductImage = useMemo(() => {
    if (
      !productImage ||
      (productImage instanceof Uint8Array && productImage.length === 0)
    )
      return "";
    if (typeof productImage === "string") return productImage;

    try {
      const bytes = productImage as Uint8Array;
      let binary = "";
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      // Using Buffer if available (Node/some RN polyfills) or btoa
      const base64 =
        typeof Buffer !== "undefined"
          ? Buffer.from(bytes).toString("base64")
          : typeof btoa !== "undefined"
            ? btoa(binary)
            : "";

      if (!base64 && typeof btoa === "undefined") {
        console.error(
          "Neither Buffer nor btoa is available for base64 encoding",
        );
        return "";
      }

      return `data:image/png;base64,${base64}`;
    } catch (e) {
      console.error("Base64 encoding failed:", e);
      return "";
    }
  }, [productImage]);

  const animateLayout = () => {
    try {
      LayoutAnimation.configureNext({
        duration: 180,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: { type: LayoutAnimation.Types.easeInEaseOut },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
    } catch (e) {
      // LayoutAnimation might fail on some Android versions/configurations
    }
  };

  useEffect(() => {
    const loadCaptionDetails = async () => {
      if (!id) {
        console.log("No ID provided to CaptionEditor");
        return;
      }
      const queryIds = id
        .toString()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (queryIds.length === 0) {
        console.log("No valid IDs provided to CaptionEditor");
        return;
      }

      try {
        const products = await getProductsByIds(queryIds);
        console.log("Found products:", products.length);

        if (products.length === 0) {
          ToastAndroid.show("No products found.", ToastAndroid.SHORT);
          return;
        }

        const affiliates = await getDefaultAffiliateLinks(queryIds);
        console.log("Found affiliates:", affiliates.length);

        const { ids, productAffiliateUrls, productImages, productUrls } =
          extractProductCaptionDetails(products, affiliates);

        console.log("Merging images:", productImages);
        const mergedImage = await mergeImages(productImages, {
          result: "base64",
        });

        // Convert base64 to Uint8Array for the form
        let uint8Array = new Uint8Array();
        try {
          if (typeof Buffer !== "undefined") {
            uint8Array = Uint8Array.from(
              Buffer.from(mergedImage.uri, "base64"),
            );
          } else if (typeof atob !== "undefined") {
            const binaryString = atob(mergedImage.uri);
            uint8Array = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              uint8Array[i] = binaryString.charCodeAt(i);
            }
          }
        } catch (e) {
          console.error("Failed to convert base64 to Uint8Array:", e);
        }

        const captionMsg = generateCaption(productAffiliateUrls);

        setValue("ids", ids);
        setValue("productUrls", productUrls);
        setValue("productImage", uint8Array);
        setValue("caption", captionMsg);
        setValue("tags", getRandomTags());
      } catch (error) {
        console.error("Error loading caption details:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred while fetching product details.";
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        reset();
      }
    };

    loadCaptionDetails();
  }, [id, mergeImages, reset, setValue]);

  useEffect(() => {
    const handleShow = (e: any) => {
      animateLayout();
      const height =
        Platform.OS === "android"
          ? e.endCoordinates.height
          : e.endCoordinates.height - insets.bottom;
      setKeyboardHeight(Math.max(0, height));
    };
    const handleHide = () => {
      animateLayout();
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow",
      handleShow as any,
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
      handleHide,
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  return (
    <View
      style={{
        flex: 1,
        height: WINDOW_HEIGHT,
        backgroundColor: Colors.dark.background,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1, position: "relative" }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 150,
            }}
          >
            <CaptionEditorForm
              control={control}
              imageLoading={imageLoading}
              CompositorCanvas={CompositorCanvas}
              mergedImage={mergedProductImage}
            />

            {!id && (
              <Text
                style={{ color: "white", textAlign: "center", marginTop: 40 }}
              >
                No product selected.
              </Text>
            )}
          </ScrollView>

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
            <ShareProduct
              control={control as any}
              btnTitle="Share Product"
              btnStyle={editorStyles.btnStyle}
              disabled={imageLoading}
              handleSubmit={handleSubmit}
              gradientColor={
                (LIGHT_GRADIENT_BUTTON && LIGHT_GRADIENT_BUTTON.length > 0
                  ? LIGHT_GRADIENT_BUTTON
                  : [
                      "#1d4b88",
                      "#2b6da0",
                    ]) as unknown as LinearGradientProps["colors"]
              }
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const editorStyles = StyleSheet.create({
  btnStyle: {
    borderRadius: 12,
    paddingVertical: 14,
  },
});
