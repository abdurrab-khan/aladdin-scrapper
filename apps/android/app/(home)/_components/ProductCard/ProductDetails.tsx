import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import Badge from "@/components/ui/Badge";

import { Colors } from "@/constants/Colors";

import toast from "@/utils";

import { type Product } from "@/types/product";

function ProductDetails({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: () => void;
}) {
  const { website } = product;

  const handleVisitToProduct = () => {
    try {
      Linking.openURL(product.url);
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "An error occurred while opening the link.",
        0.4,
      );
    }
  };

  return (
    <Pressable
      onPress={handleVisitToProduct}
      onLongPress={onSelect}
      style={styles.descriptionContainerMain}
    >
      {/* Badges to display product details */}
      <View style={styles.upperInfo}>
        {product.product_images.some((p) => p.imageType === "Full") && (
          <Badge text="Full" color={["#ffb347", "#ff6b00"]} />
        )}
        {product.is_grouped && (
          <Badge text="Grouped" color={["#a8d8ff", "#3da3ff"]} />
        )}
        {product.affiliate_urls && product.affiliate_urls.length > 0 && (
          <Badge text="Has Affiliate" color={["#a8d8ff", "#3da3ff"]} />
        )}
        <Badge text={website.name} color={["#ffb347", "#ff6b00"]} />
      </View>
      <View style={{ marginTop: 4 }}>
        <Text style={[commonStyles.text, { fontSize: 12, fontWeight: "500" }]}>
          {product.brand}
        </Text>
      </View>
      <Text style={styles.productTitle}>
        {product.name.length > 54
          ? `${product.name.slice(0, 54)}...`
          : product.name}
      </Text>
      <View style={[commonStyles.spaceBetween]}>
        <Text style={[commonStyles.text, { fontSize: 18 }]}>
          ₹ {product.discount_price}
        </Text>
        <Text style={[commonStyles.text, commonStyles.price, { fontSize: 18 }]}>
          ₹ {product.price}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  descriptionContainerMain: {
    gap: 6,
    flex: 1,
    paddingLeft: 12,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
    color: Colors.dark.titleText,
  },
  upperInfo: {
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row",
    columnGap: 6,
    rowGap: 4,
    flexWrap: "wrap",
  },
});

const commonStyles = StyleSheet.create({
  spaceBetween: {
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    color: Colors.dark.text,
  },
  price: {
    textDecorationLine: "line-through",
  },
});

export default ProductDetails;
