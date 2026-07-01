import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct as updateProductService } from "@/api/services/product";
import { Product } from "@/types/product";

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updatedProps }: { id: string | string[]; updatedProps: Partial<Product> }) =>
      updateProductService(id, updatedProps),
    onSuccess: () => {
      // Invalidate products query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
