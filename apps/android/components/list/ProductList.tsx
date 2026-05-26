import useAppContext from '@/context/AppContext';
import useFetchProducts from '@/hooks/useFetchProducts';
import { getPaginationRange } from '@/lib/utils';
import { ProductSelectionData } from '@/types';
import { Product } from '@/types/product';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, RefreshControl, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ProductCards from '../cards/ProductCards';
import Home from '../header/Home';
import NotProductFound from '../ui/NotProductFound';
interface ProductListProps {
    productSelectionData: ProductSelectionData;
    setProductSelectionData: React.Dispatch<React.SetStateAction<ProductSelectionData>>;
}

export default function ProductList({ productSelectionData, setProductSelectionData }: ProductListProps) {
    const [query, setQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [allLoaded, setAllLoaded] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [currentCategory, setCurrentCategory] = useState<string>('All');

    const { isLoading, fetchProduct } = useFetchProducts();
    const { products, pushProducts, insertProducts, getProductById } = useAppContext();

    // Memoize the key extractor
    const keyExtractor = useCallback((item: Product) => item.id.toString(), []);

    // Toggle -- Select Product
    const toggleSelectProduct = useCallback((productId: string) => {
        const product = getProductById(productId);

        if (!product) return;

        setProductSelectionData((prev) => {
            const next = new Map(prev);

            if (next.has(productId)) {
                next.delete(productId);
            } else {
                const images = [product.images.card];

                // If full page image exists, add it to the images array
                if (product.images.fullPage) {
                    images.push(product.images.fullPage)
                }

                next.set(productId, {
                    images,
                    isGrouped: product.isGrouped,
                    hasAffiliateLink: product.affiliateInfo != null || (product.isGrouped && product.groupAffiliateUrl != null)
                });
            }
            return next;
        });
    }, [getProductById, setProductSelectionData])

    const handlePagination = useCallback(async () => {
        if (isLoading || allLoaded) return;

        const { start, end } = getPaginationRange(currentPage);
        const p = await fetchProduct(
            start,
            end,
            true,
            query.length > 0 ? query : null,
            currentCategory === 'All' ? null : currentCategory
        );

        pushProducts(p);

        if (p.length === 0) {
            setAllLoaded(true);
        } else {
            setCurrentPage((prev) => prev + 1);
        }
    }, [allLoaded, currentCategory, currentPage, fetchProduct, isLoading, pushProducts, query]);

    const handleProductRefresh = useCallback(async () => {
        if (isLoading) return;

        setRefreshing(true);
        const products = await fetchProduct(0, 9, false);
        insertProducts(products);
        setRefreshing(false);

        // Resetting the state
        setCurrentPage(0);
        setAllLoaded(false);
        setQuery('');
        setCurrentCategory('All');
        setProductSelectionData(new Map());
    }, [fetchProduct, insertProducts, isLoading, setProductSelectionData]);

    const handleScrollBegin = useCallback(() => {
        if (Keyboard.isVisible()) {
            Keyboard.dismiss();
        }
    }, []);

    const renderItem = useCallback(({ item }: { item: Product }) => (
        <ProductCards
            product={item}
            hasSelected={productSelectionData.has(item.id)}
            hasSelecting={productSelectionData.size > 0}
            onSelect={toggleSelectProduct}
        />
    ), [productSelectionData, toggleSelectProduct]);

    return (
        <GestureHandlerRootView>
            <FlatList
                data={products}
                windowSize={14}
                initialNumToRender={9}
                maxToRenderPerBatch={9}
                renderItem={renderItem}
                onEndReachedThreshold={0.2}
                keyExtractor={keyExtractor}
                updateCellsBatchingPeriod={150}
                onEndReached={handlePagination}
                extraData={productSelectionData}
                scrollEnabled={products.length > 0}
                showsVerticalScrollIndicator={false}
                style={productListStyle.listContainer}
                contentContainerStyle={
                    [
                        productListStyle.productContainer,
                        products.length === 0 && {
                            flex: 1,
                            height: "auto",
                            justifyContent: 'center'
                        }
                    ]
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleProductRefresh}
                    />
                }
                ListEmptyComponent={
                    <NotProductFound />
                }
                ListHeaderComponent={
                    <Home
                        query={query}
                        category={currentCategory}
                        setQuery={setQuery}
                        setCategory={setCurrentCategory}
                    />
                }
                stickyHeaderIndices={[0]}
                stickyHeaderHiddenOnScroll={true}
                ListFooterComponent={isLoading ? <ActivityIndicator size={"large"} /> : null}
                onScrollBeginDrag={handleScrollBegin}
            />
        </GestureHandlerRootView>
    )
}

const productListStyle = StyleSheet.create({
    listContainer: {
        flex: 1,
    },
    productContainer: {
        gap: 8,
        paddingVertical: 8,
    },
})