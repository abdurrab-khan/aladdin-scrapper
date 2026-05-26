import ShareProduct from '@/components/buttons/ShareProduct';
import CaptionEditorForm from '@/components/form/CaptionEditor';
import SafeContainer from '@/components/layout/SafeContainer';
import { LIGHT_GRADIENT_BUTTON } from '@/constants/Colors';
import useAppContext from '@/context/AppContext';
import useImageCompositor from '@/hooks/useImageCompositor';
import { extractProductCaptionDetails, generateCaption, getRandomTags } from '@/lib/caption-helper';
import { CaptionDetailsSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradientProps } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from "react-hook-form";
import { Keyboard, KeyboardAvoidingView, KeyboardEvent, LayoutAnimation, Platform, ScrollView, StyleSheet, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as z from 'zod';

export default function CaptionEditor() {
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { getProductById } = useAppContext();
    const { mergeImages, imageLoading } = useImageCompositor();

    const {
        control,
        reset,
        setValue,
        getValues,
        handleSubmit,
    } = useForm<z.infer<typeof CaptionDetailsSchema>>({
        resolver: zodResolver(CaptionDetailsSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            ids: [],
            caption: '',
            tags: '',
            productUrls: [],
            productImage: new Uint8Array(),
            platforms: ["telegram"],
        }
    });
    const productImage = getValues("productImage");

    const bottomSpacing = (keyboardHeight > 0 ? keyboardHeight : insets.bottom) + 8; // 8px extra spacing

    const mergedProductImage = useMemo(() => {
        if (!productImage || (productImage as Uint8Array).length === 0) return '';

        const bytes = productImage as Uint8Array;

        // Chunked build to avoid huge argument lists
        let binary = '';
        const chunkSize = 0x8000; // 32K
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const sub = bytes.subarray(i, i + chunkSize);
            // Safe: sub is at most chunkSize long
            binary += String.fromCharCode.apply(null, Array.from(sub));
        }
        const base64 = btoa(binary);
        return `data:image/png;base64,${base64}`;
    }, [productImage]);

    // Function to animate layout changes
    const animateLayout = () => {
        LayoutAnimation.configureNext({
            duration: 180,
            create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
            update: { type: LayoutAnimation.Types.easeInEaseOut },
            delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity }
        });
    };

    useEffect(() => {
        const loadCaptionDetails = async () => {
            const queryIds = id.toString().split(',');

            if (queryIds.length > 0) {
                try {
                    const {
                        ids,
                        productAffiliateUrls,
                        productImages,
                        productUrls
                    } = extractProductCaptionDetails(getProductById(queryIds));

                    const mergedImage = await mergeImages(productImages); // Merging product image
                    const captionMsg = generateCaption(productAffiliateUrls); // Generate caption message

                    // Set form values
                    setValue('ids', ids);
                    setValue('productUrls', productUrls);
                    setValue('productImage', mergedImage);
                    setValue('caption', captionMsg);
                    setValue('tags', getRandomTags());
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "An error occurred while fetching product details.";
                    ToastAndroid.show(errorMessage, ToastAndroid.SHORT);

                    // Reset form fields in case of error
                    reset();
                }
            }
        };

        loadCaptionDetails();
    }, [getProductById, id, mergeImages, reset, setValue]);

    useEffect(() => {
        const handleShow = (e: KeyboardEvent) => {
            animateLayout();
            // On Android use endCoordinates height; on iOS include safe area already
            const height = Platform.OS === 'android' ? e.endCoordinates.height : e.endCoordinates.height - insets.bottom;
            setKeyboardHeight(Math.max(0, height));
        };
        const handleHide = () => {
            animateLayout();
            setKeyboardHeight(0);
        };

        const showSub = Keyboard.addListener(Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow', handleShow as any);
        const hideSub = Keyboard.addListener(Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide', handleHide);
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [insets.bottom]);

    return (
        <SafeContainer>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: bottomSpacing + 64 }}
                >
                    <CaptionEditorForm
                        control={control}
                        mergedImage={mergedProductImage}
                        imageLoading={imageLoading}
                    />
                </ScrollView>

                {/* Share Button */}
                <View>
                    <ShareProduct
                        control={control}
                        btnTitle='Share Product'
                        btnStyle={styles.btnStyle}
                        disabled={imageLoading}
                        handleSubmit={handleSubmit}
                        gradientColor={LIGHT_GRADIENT_BUTTON as unknown as LinearGradientProps["colors"]}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeContainer>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    btnStyle: {
        borderRadius: 10,
        paddingVertical: 12,
    }
});
