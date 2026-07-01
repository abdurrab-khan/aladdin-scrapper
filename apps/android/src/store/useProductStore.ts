import { create } from "zustand";

export interface SelectionValue {
  images: string[];
  hasAffiliateLink: boolean;
  isGrouped: boolean;
}

interface ProductState {
  searchQuery: string;
  currentCategory: string;
  selectedProducts: Set<string>;

  // Actions
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setCategory: (category: string) => void;
  toggleSelectedProducts: (product: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  searchQuery: "",
  currentCategory: "All",
  selectedProducts: new Set(),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategory: (category) => set({ currentCategory: category }),

  toggleSelectedProducts: (productId) => {
    set((state) => {
      const newSelection = new Set(state.selectedProducts);
      if (newSelection.has(productId)) {
        newSelection.delete(productId);
      } else {
        newSelection.add(productId);
      }
      return { selectedProducts: newSelection };
    });
  },
  clearSelection: () => set({ selectedProducts: new Set() }),
}));
