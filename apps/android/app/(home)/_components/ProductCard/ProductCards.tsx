import React, { useState } from "react";
import {
  View,
  Image,
  Vibration,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useProductStore } from "@/store/useProductStore";

import ShareBtn from "./ShareBtn";
import ProductDetails from "./ProductDetails";

import { Colors } from "@/constants/Colors";
import { type Product } from "@/types/product";
import AddAffiliate from "../AddAffiliate/AddAffiliate";

function ProductCards({ product }: { product: Product }) {
  const [isAffiliateVisible, setIsAffiliateVisible] = useState<boolean>(false);

  const { selectedProducts, toggleSelectedProducts } = useProductStore();

  const cardImage =
    product.product_images.find((img) => img.imageType === "Card")?.imageUrl ??
    "";

  const handleSelectProduct = () => {
    if (selectedProducts.size === 0) {
      Vibration.vibrate(50);
      toggleSelectedProducts(product.product_id);
    }
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8}>
      {isAffiliateVisible && (
        <AddAffiliate
          product={product}
          visible={isAffiliateVisible}
          setVisible={setIsAffiliateVisible}
        />
      )}

      {/* CARD CONTENT */}
      <View style={styles.contentContainer}>
        <Pressable
          style={styles.imageContainer}
          onLongPress={handleSelectProduct}
        >
          <Image
            source={{
              uri: cardImage,
              cache: "force-cache",
            }}
            resizeMode="contain"
            style={styles.productImage}
            progressiveRenderingEnabled
          />
        </Pressable>
        <View style={styles.detailsContainer}>
          <ProductDetails product={product} onSelect={handleSelectProduct} />
          <ShareBtn
            isPosted={product.is_posted}
            productId={product.product_id}
            hasAffiliate={
              Array.isArray(product?.affiliate_urls) &&
              product.affiliate_urls.length > 0
            }
            onToggleDialog={() => setIsAffiliateVisible(true)}
          />
        </View>
      </View>

      {/* SELECTED PRODUCT INDICATOR */}
      {selectedProducts.size > 0 && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            backgroundColor: selectedProducts.has(product.product_id)
              ? "rgba(0, 128, 0, 0.3)"
              : "rgba(0, 0, 0, 0.6)",
          }}
          onPress={() => toggleSelectedProducts(product.product_id)}
        />
      )}
    </TouchableOpacity>
  );
}

export default React.memo(ProductCards, (prevProps, nextProps) => {
  // Check if it's the same product by ID (most efficient check)
  if (prevProps.product.product_id !== nextProps.product.product_id) {
    return false;
  }

  // For the same product, do a more thorough comparison
  const prevProduct = prevProps.product;
  const nextProduct = nextProps.product;

  return (
    prevProduct.is_posted === nextProduct.is_posted &&
    prevProduct.is_grouped === nextProduct.is_grouped
  );
});

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    padding: 8,
    borderWidth: 1,
    borderRadius: 12,
    shadowOpacity: 1,
    shadowRadius: 4,
    overflow: "hidden",
    shadowColor: "white",
    backgroundColor: Colors.dark.header,
    borderColor: Colors.dark.borderColor,
    shadowOffset: { width: 0, height: 10 },
  },
  contentContainer: {
    columnGap: 8,
    flex: 1,
    height: "100%",
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
  },
  detailsContainer: {
    flex: 1,
    rowGap: 12,
    alignItems: "center",
    flexDirection: "column",
  },
  imageContainer: {
    flex: 0.7,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    borderColor: Colors.dark.borderColor,
  },
  productImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
  },
});
