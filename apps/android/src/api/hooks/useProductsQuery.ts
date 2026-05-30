import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/services/product";
import useAppContext from "@/context/AppContext";

interface UseProductsQueryParams {
  category?: string | null;
  query?: string | null;
}

export const useProductsQuery = ({
  category: category = "All",
  query: query = "",
}: UseProductsQueryParams) => {
  const { app } = useAppContext();

  return useInfiniteQuery({
    queryKey: ["products", category, query],
    queryFn: ({ pageParam = 0 }) => {
      const start = pageParam * 10;
      const end = start + 9;

      return getProducts({
        appId: app?.id!,
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
    enabled: !!app?.id,
  });
};
