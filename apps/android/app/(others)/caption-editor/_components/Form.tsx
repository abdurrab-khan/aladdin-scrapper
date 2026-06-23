import * as z from "zod";
import { useForm } from "react-hook-form";
import React, { useMemo } from "react";
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
import { generateCaption, getRandomTags } from "@/utils/caption-helper";

import { type ProductData } from "..";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

function Form({ products }: { products: ProductData[] }) {
  const productImages = useMemo(() => {
    return products
      .reduce(
        (acc, curr) => {
          const cardImage = curr.productImages.find(
            (c) => c.imageType === "Card" && c.imageStatus === "Completed",
          )?.imageUrl;

          if (products.length === 1) {
            const fullImage = curr.productImages.find(
              (c) => c.imageType === "Full" && c.imageStatus === "Completed",
            )?.imageUrl;
            acc.push(fullImage ?? cardImage ?? null);
          } else {
            acc.push(cardImage ?? null);
          }

          return acc;
        },
        [] as (string | null)[],
      )
      .filter(Boolean) as string[];
  }, [products]);

  const { control, handleSubmit } = useForm<
    z.infer<typeof CaptionDetailsSchema>
  >({
    resolver: zodResolver(CaptionDetailsSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      ids: products.map((pod) => pod.id),
      tags: getRandomTags(),
      platforms: ["telegram"],
      productImage: productImages,
      caption: generateCaption(products),
      productUrls: products.map((pod) => pod.url),
    },
  });

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
            <CaptionEditorForm control={control} images={productImages} />
          </ScrollView>
          <SubmitBtn
            control={control}
            isLoading={false}
            productImage={productImages}
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
