import useAppContext from '@/context/AppContext'
import { deleteProducts } from '@/lib/actions/product'
import { ProductSelectionData } from '@/types'
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { StyleProp, StyleSheet, Text, ToastAndroid, TouchableOpacity, View, ViewStyle } from 'react-native'
import { IconSymbol } from '../ui/IconSymbol'
import ButtonWithDialog from './ButtonWithDialog'


interface DeleteProductProps {
    id: string[] | string,
    imageId: string[] | string,
    btnTitle?: string,
    btnStyle: StyleProp<ViewStyle>,
    iconSize?: number,
    gradientColor: LinearGradientProps["colors"],
    setProductSelectionData?: React.Dispatch<React.SetStateAction<ProductSelectionData>>
}


const DeleteProduct = ({ id, imageId, btnTitle, gradientColor, iconSize = 18, btnStyle, setProductSelectionData }: DeleteProductProps) => {
    const { deleteProduct } = useAppContext();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);

    const handleProductDelete = async () => {
        try {
            setIsLoading(true);

            // Delete product from supabase.
            await deleteProducts(id, imageId);

            // Delete product from context state.
            deleteProduct(id);

            ToastAndroid.show("Product delete successfully", ToastAndroid.SHORT); // Showing success toast.
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An error occurred while deleting the product.";
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            // If multiple products are selected than de-selected after deletion.
            if (typeof setProductSelectionData === "function") {
                setProductSelectionData(new Map());
            }

            setIsLoading(false);
            setVisible(false);
        }
    }

    return (
        <ButtonWithDialog
            visible={visible}
            isLoading={isLoading}
            setVisible={setVisible}
            dialogTitle='Do you really want to share this product?'
            dialogButtonAction={handleProductDelete}
        >
            <TouchableOpacity
                activeOpacity={0.7}
                delayLongPress={100}
                onLongPress={() => { }}
                onPress={() => setVisible(true)}
            >
                <LinearGradient
                    colors={gradientColor}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={btnStyle}
                >
                    {/* Button title container */}
                    {
                        <View style={deleteProductStyle.btnContent}>
                            <IconSymbol name="trash-outline" color={"white"} size={iconSize} />
                            {
                                btnTitle && (
                                    <Text style={deleteProductStyle.btnTitle}>
                                        {btnTitle}
                                    </Text>
                                )
                            }
                        </View>
                    }
                </LinearGradient>
            </TouchableOpacity>
        </ButtonWithDialog>
    )
}

const deleteProductStyle = StyleSheet.create({
    btnContent: {
        gap: 8,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    btnTitle: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    }
});

export default DeleteProduct