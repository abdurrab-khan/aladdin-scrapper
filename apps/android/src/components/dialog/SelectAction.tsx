import { Colors } from '@/constants/Colors';
import { useProductStore } from '@/store/useProductStore';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import DeleteProduct from '../buttons/DeleteProduct';
import { IconSymbol } from '../ui/IconSymbol';
import AddAffiliate from './AddAffiliate';

const SelectAction: React.FC = () => {
    const { productSelectionData, setProductSelectionData, clearSelection } = useProductStore();
    const [showAffiliateDialog, setShowAffiliateDialog] = React.useState<boolean>(false);
    const slideAnim = useRef(new Animated.Value(300)).current;

    const getImageIds = () => {
        const imageIds: string[] = [];

        productSelectionData.forEach((value) => {
            if (value.images) {
                if (Array.isArray(value.images)) {
                    imageIds.push(...value.images);
                } else {
                    imageIds.push(value.images);
                }
            }
        });

        return imageIds;
    };

    const productsWithNoAffiliate = useMemo(() => {
        return Array.from(productSelectionData.entries()).filter(([_, value]) => !value.hasAffiliateLink).map(([id]) => id);
    }, [productSelectionData]);

    const isProductsGrouped = useMemo(() => {
        return Array.from(productSelectionData.values()).some(value => value.isGrouped);
    }, [productSelectionData]);

    const handlePageRedirect = () => {
        if (productSelectionData.size === 0) {
            ToastAndroid.show("Please select at least one product", ToastAndroid.SHORT);
            return;
        };

        if (isProductsGrouped && productSelectionData.size > 1) {
            ToastAndroid.show("Grouped products cannot be shared. Please send as single.", ToastAndroid.SHORT);
            return;
        }

        if (productsWithNoAffiliate.length > 0) {
            ToastAndroid.show("Please add affiliate link to all selected products", ToastAndroid.SHORT);
            setShowAffiliateDialog(true);
        } else {
            // Navigate to caption editor with product ids as params
            router.push({
                pathname: '/caption-editor',
                params: { id: Array.from(productSelectionData.keys()).join(',') }
            });

            // Clear selected products
            clearSelection();
        }
    };

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: productSelectionData.size > 0 ? 0 : 300,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [productSelectionData.size, slideAnim]);

    return (
        <Animated.View
            style={[
                selectActionStyle.actionContainer,
                { transform: [{ translateY: slideAnim }] },
            ]}
        >
            {/* Dialog to add affiliate link */}
            {
                showAffiliateDialog && (
                    <AddAffiliate
                        productId={productsWithNoAffiliate}
                        visible={showAffiliateDialog}
                        setVisible={setShowAffiliateDialog}
                    />
                )
            }

            <View style={selectActionStyle.mainContainer}>
                <View style={selectActionStyle.selectionActions}>
                    <Text style={selectActionStyle.selectionText}>
                        ✅ {productSelectionData.size} items selected
                    </Text>

                    <View style={selectActionStyle.buttonContainer}>
                        {/* Delete Btn */}
                        <DeleteProduct
                            btnTitle='Delete'
                            id={Array.from(productSelectionData.keys())}
                            imageId={getImageIds()}
                            btnStyle={actionBtnStyle.btn}
                            gradientColor={["#e8896d", "#da5063"]}
                            setProductSelectionData={setProductSelectionData}
                        />

                        {/* Share Btn */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            delayLongPress={100}
                            onPress={handlePageRedirect}
                        >
                            <LinearGradient
                                colors={["#b14793ff", "#c44ba1"]}
                                start={{ x: 1, y: 0 }}
                                end={{ x: 0, y: 0 }}
                                style={actionBtnStyle.btn}
                            >
                                {/* Button title container */}
                                {
                                    <View style={actionBtnStyle.btnContent}>
                                        <IconSymbol name="share-social-outline" color={"white"} size={18} />
                                        <Text style={actionBtnStyle.btnTitle}>
                                            Share
                                        </Text>
                                    </View>
                                }
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    )
}

const selectActionStyle = StyleSheet.create({
    actionContainer: {
        position: 'absolute',
        right: 0,
        bottom: 6,
        width: "100%",
        marginInline: 12,
        borderRadius: 8,
        backgroundColor: "#0a202a",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.dark.borderColor,
        alignItems: 'center',
        zIndex: 1000,
    },
    mainContainer: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    selectionActions: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    groupProducts: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 14,
        gap: 8,
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "white"
    },
    selectionText: {
        color: "white",
        fontSize: 18,
        fontWeight: 500
    },
    buttonContainer: {
        gap: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    }
});

const actionBtnStyle = StyleSheet.create({
    btn: {
        gap: 4,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 500,
        color: "white",
        textAlign: "center"
    },
    btnStyle: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
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
})

export default SelectAction