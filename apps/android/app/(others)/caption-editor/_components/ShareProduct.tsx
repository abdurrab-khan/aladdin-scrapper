import React, { useState } from 'react'

import useAppContext from '@/context/AppContext'
import { deleteProductImage, updateProduct, uploadProductImage } from '@/api/services/product'
import { shareProduct } from '@/api/services/share-product'
import { CaptionDetails } from '@/types/caption'
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Control, UseFormHandleSubmit } from 'react-hook-form'
import { StyleProp, StyleSheet, Text, ToastAndroid, TouchableOpacity, View, ViewStyle } from 'react-native'
import { IconSymbol } from '@/components/ui/IconSymbol'
import ButtonWithDialog from '@/components/buttons/ButtonWithDialog'

interface ShareProductProps {
    btnTitle?: string,
    disabled: boolean,
    control: Control<CaptionDetails>;
    btnStyle: StyleProp<ViewStyle>,
    gradientColor: LinearGradientProps["colors"],
    handleSubmit: UseFormHandleSubmit<CaptionDetails>;
}
const ShareProduct = ({
    control,
    btnTitle,
    btnStyle,
    disabled,
    handleSubmit,
    gradientColor,
}: ShareProductProps
) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { updateProduct: updateProductState } = useAppContext();

    // Share product functionality
    const handleProductShare = async (data: CaptionDetails) => {
        let productImageUrl: Awaited<ReturnType<typeof uploadProductImage>> = { imagePath: "", imageUrl: "" };

        setLoading(true); // Start loading
        try {
            productImageUrl = await uploadProductImage(data.productImage as Uint8Array);
            data.productImage = productImageUrl.imageUrl;

            // Sharing the product into social media platforms
            const shareResponse = await shareProduct(data);

            if (shareResponse.data?.success) {
                ToastAndroid.show(shareResponse.data?.message ?? "Successfully posted", ToastAndroid.SHORT);

                // Update the product as shared
                await updateProduct(data.ids, { isPosted: true })

                // Change the state as shared
                updateProductState(data.ids, { isPosted: true });

                // Re-direct to home page.
                if (router.canGoBack()) {
                    router.back();
                }
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An error occurred while sharing the product.";
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            return;
        } finally {
            setVisible(false);
            setLoading(false); // Stop loading

            // Delete the uploaded image after sharing
            if (productImageUrl?.imagePath) {
                await deleteProductImage(productImageUrl.imagePath);
            }
        }
    }

    // Make visible true to show the dialog to share product
    const handleButtonPress = () => {
        const error = control._formState.errors;

        if (Object.keys(error).length > 0) {
            const message = error['platforms']?.message || error['caption']?.message || error['productUrls']?.message || error['ids']?.message || "Please fill all required fields correctly.";

            ToastAndroid.show(message, ToastAndroid.SHORT);
            return;
        }

        // Show the dialog to share product
        setVisible(true);
    }

    return (
        <React.Fragment>
            {/* Dialog to show to share product*/}
            <ButtonWithDialog
                visible={visible}
                setVisible={setVisible}
                isLoading={loading}
                dialogTitle='Do you really want to share this product?'
                dialogButtonAction={handleSubmit(handleProductShare)}
            >
                <TouchableOpacity
                    activeOpacity={0.7}
                    delayLongPress={100}
                    disabled={disabled}
                    onPress={handleButtonPress}
                >
                    <LinearGradient
                        colors={gradientColor}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={btnStyle}
                    >
                        {/* Button title container */}
                        {
                            <View style={shareProductStyle.btnContent}>
                                <IconSymbol name="share-social-outline" color={"white"} size={18} />
                                {
                                    btnTitle && (
                                        <Text style={shareProductStyle.btnTitle}>
                                            {btnTitle}
                                        </Text>
                                    )
                                }
                            </View>
                        }
                    </LinearGradient>
                </TouchableOpacity>
            </ButtonWithDialog>
        </React.Fragment>
    )
}

const shareProductStyle = StyleSheet.create({
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



export default ShareProduct