import useAppContext from "@/context/AppContext";
import { getProducts } from "@/lib/actions/product";
import { Product } from "@/types/product";
import { useCallback, useState } from "react";
import { ToastAndroid } from "react-native";

const useFetchProducts = () => {
  const [isLoading, setLoading] = useState<boolean>(false);

  const { app } = useAppContext();

  const fetchProduct = useCallback(
    async (
      start = 0,
      end = 9,
      showLoading = true,
      query: string | null = null,
      categoryValue: string | null = null
    ): Promise<Product[]> => {
      if (!app?.id) return [];

      try {
        if (showLoading) setLoading(true);

        return await getProducts({
          start,
          end,
          appId: app?.id,
          query,
          categoryValue,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while fetching data.";
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);

        return [];
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [app?.id]
  );

  return {
    isLoading,
    fetchProduct,
  };
};

export default useFetchProducts;
