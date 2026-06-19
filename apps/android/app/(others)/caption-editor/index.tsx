import { useForm } from "react-hook-form";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useImageCompositor } from "../../../src/hooks/useImageCompositor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
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
  generateCaption,
  getRandomTags,
} from "../../../src/utils/caption-helper";
import { Product } from "@/types/product";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

export default function CaptionEditor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productImage, setProductImage] = useState("");

  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { mergeImages, imageLoading, CompositorCanvas } = useImageCompositor();

  const { control, reset, setValue, handleSubmit } = useForm<
    z.infer<typeof CaptionDetailsSchema>
  >({
    resolver: zodResolver(CaptionDetailsSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      caption: "",
      tags: "",
      platforms: ["telegram"],
    },
  });

  const mergeProductImages = useCallback(
    async (productImages: string | string[] | null | undefined) => {
      const mergedImage = await mergeImages(productImages, {
        result: "base64",
      });

      if (!mergedImage) return null;

      // Convert base64 to Uint8Array for the form
      let uint8Array = new Uint8Array();
      try {
        if (typeof Buffer !== "undefined") {
          uint8Array = Uint8Array.from(Buffer.from(mergedImage.uri, "base64"));
        } else if (typeof atob !== "undefined") {
          const binaryString = atob(mergedImage.uri);
          uint8Array = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
          }
        }

        return uint8Array;
      } catch (e) {
        console.error("Failed to convert base64 to Uint8Array:", e);
      }
    },
    [mergeImages],
  );

  const productImageBase64 = useCallback(async () => {
    const productImages =
      products?.length > 0
        ? products.length === 1
          ? (products[0].images.find((p) => p.image_type === "Full")
              ?.image_url ??
            products[0].images.find((p) => p.image_url)?.image_url)
          : products
              .map(
                (prod) =>
                  prod.images.find((img) => img.image_type === "Card")
                    ?.image_url!,
              )
              .filter(Boolean)
        : null;

    const mProductImage = await mergeProductImages(productImages);

    if (mProductImage) {
      setValue("productImage", mProductImage);
      try {
        const bytes = mProductImage as Uint8Array;
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

        setProductImage(`data:image/png;base64,${base64}`);
      } catch (e) {
        console.error("Base64 encoding failed:", e);
      }
    }
  }, [mergeProductImages, products, setValue]);

  useEffect(() => {
    const loadCaptionDetails = async () => {
      if (!id) {
        return;
      }
      const queryIds = id
        .toString()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (queryIds.length === 0) {
        return;
      }

      try {
        const productsRes = await getProductsByIds(queryIds);

        if (!productsRes || productsRes.length <= 0) {
          ToastAndroid.show("No products found.", ToastAndroid.SHORT);
          return;
        }

        setProducts(productsRes);

        const affiliates = await getDefaultAffiliateLinks(queryIds);
        const captionMsg = generateCaption(productsRes, affiliates);

        setValue("ids", queryIds);
        setValue(
          "productUrls",
          productsRes.map((p) => p.url),
        );
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
  }, [id, reset, setValue]);

  useEffect(() => {
    productImageBase64();
  }, [productImageBase64]);

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
              mergedImage={productImage}
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
