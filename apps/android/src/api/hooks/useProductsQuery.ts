import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/services/product";

interface UseProductsQueryParams {
  appId?: string;
  category?: string | null;
  query?: string | null;
}

export const useProductsQuery = ({ appId, category, query }: UseProductsQueryParams) => {
  return useInfiniteQuery({
    queryKey: ["products", appId, category, query],
    queryFn: ({ pageParam = 0 }) => {
      if (!appId) return [];
      
      const start = pageParam * 10;
      const end = start + 9;
      
      return getProducts({
        appId,
        start,
        end,
        categoryValue: category === "All" ? null : category,
        query,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer than 10 items, we've reached the end
      return lastPage.length < 10 ? undefined : allPages.length;
    },
    initialPageParam: 0,
    enabled: !!appId,
  });
};
