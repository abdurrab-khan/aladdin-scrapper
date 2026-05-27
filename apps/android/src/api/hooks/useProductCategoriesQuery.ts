import { useQuery } from "@tanstack/react-query";
import { getProductCategories } from "@/api/services/product";

export const useProductCategoriesQuery = (appId?: string) => {
  return useQuery({
    queryKey: ["categories", appId],
    queryFn: () => {
      if (!appId) return [];
      return getProductCategories(appId);
    },
    enabled: !!appId,
  });
};
