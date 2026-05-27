import useAppContext from '@/context/AppContext';
import { useProductsQuery } from '@/api/hooks/useProductsQuery';
import { useProductStore } from '@/store/useProductStore';
import { Product } from '@/types/product';
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Keyboard, RefreshControl, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ProductCards from '../cards/ProductCards';
import HomeHeader from '@/app/(home)/_components/HomeHeader';
import NotProductFound from '../ui/NotProductFound';
import SelectAction from '../dialog/SelectAction';

export default function ProductList() {
    const { app } = useAppContext();
    const {
        searchQuery,
        currentCategory,
        productSelectionData,
        toggleProductSelection,
        clearSelection
    } = useProductStore();

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
        isRefetching
    } = useProductsQuery({
        appId: app?.id,
        category: currentCategory,
        query: searchQuery
    });

    useFocusEffect(useCallback(() => {
        const onBackPress = () => {
            if (productSelectionData.size > 0) {
                clearSelection();
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => {
            subscription.remove();
        }
    }, [productSelectionData.size, clearSelection]));

    const products = data?.pages.flat() || [];

    const keyExtractor = useCallback((item: Product) => item.product_id, []);

    const handlePagination = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleScrollBegin = useCallback(() => {
        if (Keyboard.isVisible()) {
            Keyboard.dismiss();
        }
    }, []);

    const renderItem = useCallback(({ item }: { item: Product }) => (
        <ProductCards
            product={item}
            hasSelected={productSelectionData.has(item.product_id)}
            hasSelecting={productSelectionData.size > 0}
            onSelect={() => toggleProductSelection(item)}
        />
    ), [productSelectionData, toggleProductSelection]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <FlatList
                data={products}
                renderItem={renderItem}
                onEndReachedThreshold={0.5}
                keyExtractor={keyExtractor}
                onEndReached={handlePagination}
                showsVerticalScrollIndicator={false}
                style={productListStyle.listContainer}
                contentContainerStyle={
                    [
                        productListStyle.productContainer,
                        products.length === 0 && !isLoading && {
                            flex: 1,
                            justifyContent: 'center'
                        }
                    ]
                }
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                    />
                }
                ListEmptyComponent={
                    isLoading ? <ActivityIndicator size="large" style={{ marginTop: 50 }} /> : <NotProductFound />
                }
                ListHeaderComponent={
                    <HomeHeader />
                }
                stickyHeaderIndices={[0]}
                stickyHeaderHiddenOnScroll={true}
                ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" style={{ marginVertical: 20 }} /> : null}
                onScrollBeginDrag={handleScrollBegin}
            />

            {productSelectionData.size > 0 && (
                <SelectAction />
            )}
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
