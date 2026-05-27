import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProducts as deleteProductsService } from "@/api/services/product";

export const useDeleteProductsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, imageIds }: { ids: string[]; imageIds: string[] }) =>
      deleteProductsService(ids, imageIds),
    onSuccess: () => {
      // Invalidate products query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
