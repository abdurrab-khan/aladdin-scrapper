import * as z from "zod";
import { useForm } from "react-hook-form";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import SubmitBtn from "./SubmitBtn";
import CaptionEditorForm from "./CaptionEditor";

import { Colors } from "@/constants/Colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaptionDetailsSchema } from "@/api/schemas/caption.schema";
import { generateCaption, getRandomTags } from "@/utils";

import { type ProductData } from "..";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

function Form({ products }: { products: ProductData[] }) {
  const captureRef = useRef<() => Promise<string>>(null);

  const { control, setValue, handleSubmit } = useForm<
    z.infer<typeof CaptionDetailsSchema>
  >({
    resolver: zodResolver(CaptionDetailsSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      ids: products.map((pod) => pod.id),
      tags: getRandomTags(),
      platforms: ["telegram"],
      productUrls: products.map((pod) => pod.url),
    },
  });

  const productImages = useMemo(() => {
    return products
      .reduce(
        (acc, curr) => {
          // Get the card image if available, otherwise null
          const cardImage = curr?.productImages?.find(
            (c) => c.imageType === "Card" && c.imageStatus === "Completed",
          )?.imageUrl;

          // Get the grouped image if the product is grouped, otherwise null
          const groupedImage =
            (curr.isGrouped
              ? curr?.productImages?.find(
                  (c) =>
                    c.imageType === "Group" && c.imageStatus === "Completed",
                )?.imageUrl
              : null) ?? null;

          if (products.length === 1) {
            const fullImage = curr?.productImages?.find(
              (c) => c.imageType === "Full" && c.imageStatus === "Completed",
            )?.imageUrl;
            acc.push({
              url: fullImage ?? groupedImage ?? cardImage ?? null,
              imageType: fullImage ? "full" : groupedImage ? "group" : "card",
            });
          } else {
            acc.push({
              url: groupedImage ?? cardImage ?? null,
              imageType: groupedImage ? "group" : "card",
            });
          }

          return acc;
        },
        [] as { url: string | null; imageType: "full" | "group" | "card" }[],
      )
      .filter((item) => item.url !== null) as {
      url: string;
      imageType: "full" | "group" | "card";
    }[];
  }, [products]);

  useEffect(() => {
    (async () => {
      const caption = await generateCaption(products);
      setValue("caption", caption);
    })();
  }, [products, setValue]);

  return (
    <View style={styles.formView}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1, position: "relative" }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            <CaptionEditorForm
              control={control}
              images={productImages}
              captureRef={captureRef}
            />
          </ScrollView>
          <SubmitBtn
            control={control}
            captureRef={captureRef}
            handleSubmit={handleSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  formView: {
    flex: 1,
    height: WINDOW_HEIGHT,
    backgroundColor: Colors.dark.background,
  },
  scrollViewContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 150,
  },
});

export default Form;
