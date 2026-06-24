import React, { useState } from 'react'
import { View } from 'react-native'

function ProductDetails() {
  const [visible, setVisible] = useState<boolean>(false);
  const [isImageViewOpen, setIsImageViewOpen] = useState<boolean>(false);

  const productImages = React.useMemo(() => {
    return images.map(
      (img) =>
        ({
          uri: img.imageUrl,
          cache: "force-cache",
        }) as ImageSource,
    );
  }, [images]);

  console.log("Images are: ", images);

  const cardImage = React.useMemo(() => {
    const cardImg = images.find((img) => img.imageType === "Card") || images[0];
    return cardImg?.imageUrl;
  }, [images]);



  // Handle -- Product Selection
  const handleSelectProduct = useCallback(() => {
    if (hasSelecting) return;

    Vibration.vibrate(50);
    onSelect(product.product_id);
  }, [product.product_id, hasSelecting, onSelect]);

  // Handle -- Visit to follow up product app
  const handleVisitToProduct = useCallback(() => {
    try {
      Linking.openURL(product.url);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "An error occurred while opening the link.";
      ToastAndroid.show(msg, 0.4);
    }
  }, [product.url]);



    return (
    <View>
            {showAffiliateDialog && (
        <AddAffiliate
          productURL={product.url}
          productId={product.product_id}
          isGrouped={product.is_grouped}
          platformId={website.id}
          setVisible={setShowAffiliateDialog}
          visible={showAffiliateDialog}
        />
      )}
      
      
      <ImageView
        imageIndex={0}
        images={productImages}
        animationType="slide"
        visible={isImageViewOpen}
        presentationStyle="formSheet"
        keyExtractor={(_, index) =>
          `product-image-${product.product_id}-${index}`
        }
        onRequestClose={() => setIsImageViewOpen(false)}
      />

      {/* Product Image  */}
      <Pressable
        style={cardStyles.imageContainer}
        onPress={() => setIsImageViewOpen(true)}
        onLongPress={handleSelectProduct}
      >
        <Image
          source={{
            uri: cardImage,
            cache: "force-cache",
          }}
          style={cardStyles.productImage}
          resizeMode="cover"
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
            <Badge text={website.name} color={["#ffb347", "#ff6b00"]} />

            {/* Grouped Badge */}
            <Badge
              text={product.is_grouped ? "Grouped" : null}
              color={["#a8d8ff", "#3da3ff"]}
            />
          </View>

          {/* Brand Name */}
          <View style={{ marginTop: 4 }}>
            <Text
              style={[commonStyles.text, { fontSize: 12, fontWeight: "500" }]}
            >
              {product.brand}
            </Text>
          </View>

          {/* Product name */}
          <Text style={cardStyles.productTitle}>
            {product.name.length > 54
              ? `${product.name.slice(0, 54)}...`
              : product.name}
          </Text>

          {/* Product rating */}
          <View style={[commonStyles.spaceBetween]}>
            <ReviewStar rating={product.rating ?? 0} size={16} />

            <Text style={[commonStyles.text]}>
              {convertNumberToString(product.reviews ?? 0)} reviews
            </Text>
          </View>

          {/* Product prices */}
          <View style={[commonStyles.spaceBetween]}>
            <Text style={[commonStyles.text, { fontSize: 18 }]}>
              ₹ {product.discount_price}
            </Text>

            <Text
              style={[commonStyles.text, commonStyles.price, { fontSize: 18 }]}
            >
              ₹ {product.price}
            </Text>
          </View>
        </View>

    </View>
  )
}

export default ProductDetails
