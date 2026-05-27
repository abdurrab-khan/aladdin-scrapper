import { create } from 'zustand';
import { ProductSelectionData } from '@/types';
import { Product, ProductImage } from '@/types/product';

export interface SelectionValue {
    images: string[];
    hasAffiliateLink: boolean;
    isGrouped: boolean;
}

interface ProductState {
    // Search and Category
    searchQuery: string;
    currentCategory: string;
    
    // Product Selection
    productSelectionData: ProductSelectionData;
    
    // Actions
    setSearchQuery: (query: string) => void;
    setCategory: (category: string) => void;
    
    toggleProductSelection: (product: Product) => void;
    setProductSelectionData: (data: ProductSelectionData | ((prev: ProductSelectionData) => ProductSelectionData)) => void;
    clearSelection: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
    searchQuery: '',
    currentCategory: 'All',
    productSelectionData: new Map(),

    setSearchQuery: (query) => set({ searchQuery: query }),
    setCategory: (category) => set({ currentCategory: category }),

    toggleProductSelection: (product) => set((state) => {
        const next = new Map(state.productSelectionData);
        const productId = product.product_id;

        if (next.has(productId)) {
            next.delete(productId);
        } else {
            const images = (product.images as ProductImage[]).map(
                (img) => img.image_url
            );

            next.set(productId, {
                images,
                isGrouped: product.is_grouped,
                hasAffiliateLink: product.has_affiliate,
            });
        }
        return { productSelectionData: next };
    }),

    setProductSelectionData: (data) => set((state) => ({
        productSelectionData: typeof data === 'function' ? data(state.productSelectionData) : data
    })),

    clearSelection: () => set({ productSelectionData: new Map() }),
}));
