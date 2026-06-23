import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { useQueries } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router/build/hooks";

import Form from "./_components/Form";
import FormSkeleton from "./_components/FormSkeleton";
import { supabase } from "@/api/clients/supabase";
import toast from "@/utils/toast";

export interface ProductImage {
  id: string;
  imageType: "Card" | "Full";
  imageStatus: "Completed" | "Pending";
  imageUrl: string;
}

export interface AffiliateUrl {
  id: string;
  url: string;
  isDefault: boolean;
}

export interface ProductData {
  productId: string;
  id: string;
  name: string;
  url: string;
  price: number;
  discountPrice: number;
  productBrand: string;
  isPosted: boolean;
  productImages: ProductImage[];
  affiliateUrl?: AffiliateUrl;
}

const NotFound = () => {
  return (
    <View>
      <Text>Not found</Text>
    </View>
  );
};

export default function CaptionEditor() {
  const { ids: rawIds = "" } = useLocalSearchParams();
  const ids = rawIds.toString().split(",");

  const { data, isPending, isError, error } = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["product", id],
      queryFn: async (): Promise<ProductData> => {
        const { data } = await supabase.rpc("fetch_product", {
          pid: id,
          appid: "8495f60a-a51f-4a77-a64d-d462056b5690",
        });
        return data;
      },
    })),
    combine: (results) => ({
      data: results.map((result) => result.data).filter((p) => p !== undefined),
      isError: results.some((result) => result.isError),
      error: results
        .map((result) => result.error?.message ?? `An unknown error occurred`)
        .join(", "),
      isPending: results.some((result) => result.isPending),
    }),
  });

  useEffect(() => {
    let mount = true;

    if (isError && mount) {
      toast(error);
    }

    return () => {
      mount = false;
    };
  }, [isError, error]);

  return (
    <React.Fragment>
      {!Array.isArray(ids) || ids.length === 0 ? (
        <NotFound />
      ) : isPending ? (
        <FormSkeleton />
      ) : (
        <Form products={data} />
      )}
    </React.Fragment>
  );
}
