import useAppContext from '@/context/AppContext';
import useFetchProducts from '@/hooks/useFetchProducts';
import { ProductSelectionData } from '@/types';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import SelectAction from './dialog/SelectAction';
import ProductList from './list/ProductList';
import PageLoader from './ui/PageLoader';

export default function ListProducts() {
    const [productSelectionData, setProductSelectionData] = useState<ProductSelectionData>(new Map());

    const { insertProducts } = useAppContext();
    const { isLoading, fetchProduct } = useFetchProducts();

    useEffect(() => {
        (async () => {
            const products = await fetchProduct();
            insertProducts(products);
        })()
    }, [fetchProduct, insertProducts])

    useFocusEffect(useCallback(() => {
        const onBackPress = () => {
            // Deselect all selected products or products with no affiliate data 
            if (productSelectionData.size > 0) {
                setProductSelectionData(new Map());
                return true;
            }
            return false;
        };

        // Add back handler
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => {
            subscription.remove();
        }
    }, [productSelectionData.size]));

    // Show loader while fetching products
    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <React.Fragment>
            {/* Product List */}
            <ProductList
                productSelectionData={productSelectionData}
                setProductSelectionData={setProductSelectionData}
            />

            {/* Dialog to show share and dialog button */}
            {
                productSelectionData.size > 0 && (
                    <SelectAction
                        productSelectionData={productSelectionData}
                        setProductSelectionData={setProductSelectionData}
                    />
                )
            }
        </React.Fragment>
    )
}