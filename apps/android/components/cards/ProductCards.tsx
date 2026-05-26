import { Colors, LIGHT_GRADIENT_BUTTON } from '@/constants/Colors';
import { SUPABASE_BUCKET_URL } from '@/constants/const';
import useAppContext from '@/context/AppContext';
import { convertNumberToString } from '@/lib/utils';
import { GroupProductDetails, Product, SingleProductDetails } from '@/types/product';
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ImageSource, Linking, Pressable, StyleSheet, Text, ToastAndroid, TouchableOpacity, useWindowDimensions, Vibration, View } from 'react-native';
import Swipeable from "react-native-gesture-handler/Swipeable";
import ImageView from "react-native-image-viewing";
import DeleteProduct from '../buttons/DeleteProduct';
import AddAffiliate from '../dialog/AddAffiliate';
import { IconSymbol } from '../ui/IconSymbol';
import ReviewStar from '../ui/ReviewStar';

interface ProductCardsProps {
    product: Product;
    hasSelecting: boolean;
    hasSelected: boolean;
    onSelect: (productId: string) => void;
}

const Badge = ({ text, color = ["#ff5f6d", "#d7263d"], textColor = "white" }: { text?: string | null, color?: LinearGradientProps["colors"], textColor?: string }) => {
    if (!text) return null;

    return (
        <LinearGradient
            colors={color}
            style={badgeStyle.badgeContainer}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
        >
            <Text style={[badgeStyle.badgeText, {
                color: textColor
            }]}>{text}</Text>
        </LinearGradient>
    );
};

function ProductCards({ product, hasSelecting, hasSelected, onSelect }: ProductCardsProps) {
    const [showAffiliateDialog, setShowAffiliateDialog] = useState<boolean>(false);
    const [isImageViewOpen, setIsImageViewOpen] = useState<boolean>(false);

    const swipeableRef = React.useRef<Swipeable>(null);

    const { width } = useWindowDimensions();
    const { getProductById } = useAppContext();

    const singleProductDetails = product.details as SingleProductDetails;
    const groupedProductDetails = product.details as GroupProductDetails;

    const shareGradientColors = React.useMemo<LinearGradientProps["colors"]>(() => {
        return product.isPosted ? (
            ["#b20000a9", "#f74141ff"]
        ) : (
            product.affiliateInfo || (product.isGrouped && product.groupAffiliateUrl) ? (
                ["#00d2ff", "#3a47d5"]
            ) :
                LIGHT_GRADIENT_BUTTON as unknown as LinearGradientProps["colors"]
        )
    }, [product.isPosted, product.affiliateInfo, product.isGrouped, product.groupAffiliateUrl]);

    const productImages = React.useMemo(() => {
        const makeImagesArray = (url: string): ImageSource => ({
            uri: url,
            cache: "force-cache",
        })

        const originalImages = (Array.isArray(product.images.image) ? product.images.image : [product.images.image]).map(makeImagesArray);
        const otherImages = [makeImagesArray(SUPABASE_BUCKET_URL + product.images.card)];

        if (product.images.fullPage) {
            otherImages.push(makeImagesArray(SUPABASE_BUCKET_URL + product.images.fullPage));
        }

        return [...otherImages, ...originalImages];
    }, [product.images]);

    // Handle -- Product Selection
    const handleSelectProduct = useCallback(() => {
        if (hasSelecting) return;

        Vibration.vibrate(50);
        onSelect(product.id);
    }, [product.id, hasSelecting, onSelect]);

    // Handle -- Long Press to add affiliate link
    const handleBtnLongPress = useCallback(() => {
        // Vibration feedback
        Vibration.vibrate(50);

        // Show dialog to add affiliate link
        if (product.affiliateInfo) {
            ToastAndroid.show("Affiliate link already added", ToastAndroid.SHORT);
        } else {
            // Show dialog to add affiliate link
            setShowAffiliateDialog(true);
        }
    }, [product.affiliateInfo]);

    // Handle -- Press to re-direct to caption editor page
    const handlePageRedirect = useCallback(() => {
        const productData = getProductById(product.id);

        if (!productData || (!product.affiliateInfo && !(product.isGrouped && product.groupAffiliateUrl))) {
            ToastAndroid.show("Please add affiliate link first", ToastAndroid.SHORT);
            setShowAffiliateDialog(true); // Show dialog to add affiliate link
            return;
        }

        // Redirect to caption editor page
        router.push({
            pathname: `/(others)/caption-editor`,
            params: { id: product.id }
        });
    }, [getProductById, product.affiliateInfo, product.groupAffiliateUrl, product.id, product.isGrouped]);

    // Handle -- Visit to follow up product app
    const handleVisitToProduct = useCallback(() => {
        try {
            Linking.openURL(product.url);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "An error occurred while opening the link.";
            ToastAndroid.show(msg, 0.4)
        }
    }, [product.url])

    // Handle -- Render right actions for swipeable
    const renderActions = useCallback(() => {
        if (hasSelecting) return null;

        // Prepare images array
        let images = [product.images.card];
        if (product.images.fullPage) {
            images.push(product.images.fullPage)
        }

        return (
            <DeleteProduct
                id={product.id}
                imageId={images}
                btnStyle={{ flex: 1, justifyContent: "center", width: 120, borderRadius: 8 }}
                iconSize={24}
                gradientColor={["#ff5f6d", "#d7263d"]}
            />
        )
    }, [product.id, product.images, hasSelecting])

    useEffect(() => {
        if (hasSelecting && swipeableRef.current) {
            swipeableRef.current.close();
        }
    }, [hasSelecting]);

    return (
        <Swipeable
            ref={swipeableRef}
            friction={2}
            rightThreshold={50}
            leftThreshold={50}
            renderLeftActions={renderActions}
            renderRightActions={renderActions}
        >
            <TouchableOpacity
                style={[cardStyles.cardContainer, { width: width - 24, }]}
                activeOpacity={0.8}
            >
                {/* Image View */}
                <ImageView
                    imageIndex={0}
                    images={productImages}
                    animationType='slide'
                    visible={isImageViewOpen}
                    presentationStyle='formSheet'
                    keyExtractor={(_, index) => `product-image-${product.id}-${index}`}
                    onRequestClose={() => setIsImageViewOpen(false)}
                />

                {/* Show overlay if selected or selecting happened */}
                {
                    (hasSelecting) && (
                        <Pressable
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: hasSelected ? "rgba(0, 128, 0, 0.3)" : "rgba(0, 0, 0, 0.6)",
                                zIndex: 1,
                                borderRadius: 8,
                            }}
                            onPress={() => onSelect(product.id)}
                        />
                    )
                }

                {/* Dialog to add affiliate link */}
                {
                    showAffiliateDialog && (
                        <AddAffiliate
                            productId={product.id}
                            visible={showAffiliateDialog}
                            setVisible={setShowAffiliateDialog}
                        />
                    )
                }

                {/* Product Image  */}
                <Pressable
                    style={cardStyles.imageContainer}
                    onPress={() => setIsImageViewOpen(true)}
                    onLongPress={handleSelectProduct}
                >
                    <Image
                        source={{
                            uri: !Array.isArray(product.images.image) ? product.images.image : product.images.image[0],
                            cache: "force-cache",
                        }}
                        style={cardStyles.productImage}
                        resizeMode='cover'
                        progressiveRenderingEnabled
                    />
                </Pressable>

                {/* Product Info */}
                <Pressable
                    style={cardStyles.descriptionContainerMain}
                    onPress={handleVisitToProduct}
                    onLongPress={handleSelectProduct}
                >
                    {/* Product description */}
                    <View>
                        {/* Upper Info */}
                        <View style={cardStyles.upperInfo}>
                            {/* Platform Badge */}
                            <Badge text={product.platformInfo.name} color={["#ffb347", "#ff6b00"]} />

                            {/* Grouped Badge */}
                            <Badge text={product.isGrouped ? "Grouped" : null} color={["#a8d8ff", "#3da3ff"]} />

                            {/* Discount Type Badge */}
                            <Badge text={singleProductDetails?.discountType} />

                            {/* Discount Percentage Badge */}
                            <Badge
                                text={
                                    singleProductDetails?.discountPercent ? `${singleProductDetails.discountPercent}% OFF` : null
                                }
                                color={["#cbb2ff", "#7b61ff"]}
                            />

                            <Badge
                                text={
                                    product.images.fullPage ? "Full Page" : null}
                                color={["#a1ffce", "#64e6b5"]}
                                textColor='#004b3d'
                            />
                        </View>

                        {/* Brand Name */}
                        <View style={{ marginTop: 4 }}>
                            <Text style={[commonStyles.text, { fontSize: 12, fontWeight: "500" }]}>
                                {product.details.brand}
                            </Text>
                        </View>

                        {/* Product name */}
                        <Text style={cardStyles.productTitle}>
                            {
                                product.name.length > 54
                                    ? `${product.name.slice(0, 54)}...`
                                    : product.name
                            }
                        </Text>

                        {/* Product rating */}
                        <View style={[commonStyles.spaceBetween]}>
                            <ReviewStar rating={singleProductDetails?.rating ?? groupedProductDetails.avgRating ?? 0} size={16} />

                            <Text style={[commonStyles.text]}>
                                {convertNumberToString(singleProductDetails?.reviews ?? groupedProductDetails.totalReviews ?? 0)}
                                {" "}
                                reviews
                            </Text>
                        </View>

                        {/* Product prices */}
                        <View style={[commonStyles.spaceBetween]}>
                            <Text style={[commonStyles.text, { fontSize: 18 }]}>
                                ₹ {singleProductDetails?.discountPrice ?? groupedProductDetails.discountStartPrice}
                            </Text>

                            <Text style={[commonStyles.text, commonStyles.price, { fontSize: 18 }]}>
                                ₹ {singleProductDetails?.price ?? groupedProductDetails?.startPrice}
                            </Text>
                        </View>
                    </View>

                    {/* Share Button */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        delayLongPress={100}
                        onLongPress={handleBtnLongPress}
                        onPress={handlePageRedirect}
                    >
                        <LinearGradient
                            colors={shareGradientColors}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={commonStyles.btnStyle}
                        >
                            {/* Button title container */}
                            {
                                <View style={commonStyles.btnContent}>
                                    <IconSymbol name="share-social-outline" color={"white"} size={18} />
                                </View>
                            }
                        </LinearGradient>
                    </TouchableOpacity>
                </Pressable>
            </TouchableOpacity >
        </Swipeable>

    )
}

export default React.memo(ProductCards, (prevProps, nextProps) => {
    // Check if selection states changed
    if (prevProps.hasSelected !== nextProps.hasSelected ||
        prevProps.hasSelecting !== nextProps.hasSelecting) {
        return false;
    }

    // Check if it's the same product by ID (most efficient check)
    if (prevProps.product.id !== nextProps.product.id) {
        return false;
    }

    // For the same product, do a more thorough comparison
    const prevProduct = prevProps.product;
    const nextProduct = nextProps.product;

    return prevProduct.isPosted === nextProduct.isPosted &&
        prevProduct.details === nextProduct.details &&
        prevProduct.affiliateInfo === nextProduct.affiliateInfo &&
        prevProduct.platformInfo === nextProduct.platformInfo &&
        prevProduct.groupAffiliateUrl === nextProduct.groupAffiliateUrl;
});


const cardStyles = StyleSheet.create({
    cardContainer: {
        height: "auto",
        position: "relative",
        flexDirection: "row",
        padding: 8,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: Colors.dark.borderColor,
        shadowColor: 'white',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 4,
        backgroundColor: Colors.dark.header
    },
    imageContainer: {
        height: 200,
        width: 140,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: Colors.dark.borderColor,
        overflow: "hidden",
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    descriptionContainerMain: {
        flex: 1,
        gap: 6,
        paddingLeft: 12,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    productTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 4,
        color: Colors.dark.titleText
    },
    upperInfo: {
        justifyContent: "flex-end",
        alignItems: "center",
        flexDirection: "row",
        columnGap: 6,
        rowGap: 4,
        flexWrap: "wrap"
    }
});

const commonStyles = StyleSheet.create({
    spaceBetween: {
        flexWrap: "wrap",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    text: {
        color: Colors.dark.text
    },
    price: {
        textDecorationLine: "line-through"
    },
    btnStyle: {
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 99999,
    },
    btnContent: {
        gap: 8,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
});

const badgeStyle = StyleSheet.create({
    badgeContainer: {
        marginBottom: 4,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderWidth: 0.3,
        borderColor: "#e63946",
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500'
    }
});