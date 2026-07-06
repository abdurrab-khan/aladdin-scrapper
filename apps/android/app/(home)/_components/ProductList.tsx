import React, { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
} from "react-native";

import ProductCards from "./ProductCard/ProductCards";
import HomeHeader from "@/app/(home)/_components/HomeHeader";
import NotProductFound from "@/components/ui/NotProductFound";
import SelectAction from "@/app/(home)/_components/SelectAction";

import { Product } from "@/types/index";

import { useProductStore } from "@/store/useProductStore";
import { useProductsQuery } from "@/api/hooks/useProductsQuery";
import queryClient from "@/api/clients/queryClient";

export default function ProductList() {
  const { searchQuery, clearSelection, currentCategory, selectedProducts } =
    useProductStore();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useProductsQuery({
    query: searchQuery,
    category: currentCategory,
  });

  const products = data?.pages.flat() || [];

  const keyExtractor = useCallback((item: Product) => item.product_id, []);

  const handleRefetch = useCallback(async () => {
    await refetch();

    // Invalidate product categories as well
    queryClient.invalidateQueries({ queryKey: ["categories"] });

    // clear the selected products
    clearSelection();
  }, [refetch, clearSelection]);

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

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductCards product={item} />,
    [],
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (selectedProducts.size > 0) {
          clearSelection();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => {
        subscription.remove();
      };
    }, [selectedProducts.size, clearSelection]),
  );

  return (
    <React.Fragment>
      <FlatList
        data={products}
        renderItem={renderItem}
        onEndReachedThreshold={0.5}
        keyExtractor={keyExtractor}
        onEndReached={handlePagination}
        showsVerticalScrollIndicator={false}
        style={productListStyle.listContainer}
        contentContainerStyle={[
          productListStyle.productContainer,
          products.length === 0 &&
            !isLoading && {
              height: "100%",
              justifyContent: "center",
            },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefetch} />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" style={{ marginTop: 50 }} />
          ) : (
            <NotProductFound />
          )
        }
        ListHeaderComponent={<HomeHeader />}
        stickyHeaderIndices={[0]}
        stickyHeaderHiddenOnScroll={true}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" style={{ marginVertical: 20 }} />
          ) : null
        }
        onScrollBeginDrag={handleScrollBegin}
      />
      {selectedProducts.size > 0 && <SelectAction />}
    </React.Fragment>
  );
}

const productListStyle = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  productContainer: {
    gap: 8,
    paddingVertical: 8,
  },
});
