import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProducts as deleteProductsService } from "@/api/services/product";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useDeleteProductsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids }: { ids: string[] }) => deleteProductsService(ids),
    onSuccess: async (_, { ids }) => {
      // Invalidate products query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["products"] });

      // Invalidate product categories as well
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      // Delete existing grouped affiliate, if it belongs to the deleted products
      const existingGroupedAffiliateUrls = JSON.parse(
        (await AsyncStorage.getItem("grouped_affiliate_urls")) ?? "{}",
      );

      const updatedGroupedAffiliateUrls = Object.fromEntries(
        Object.entries(existingGroupedAffiliateUrls).filter(
          (p) => !ids.includes(p[0]),
        ),
      );

      await AsyncStorage.setItem(
        "grouped_affiliate_urls",
        JSON.stringify(updatedGroupedAffiliateUrls),
      );
    },
  });
};
