import React from "react";
import { Pressable, StyleSheet, TouchableOpacity } from "react-native";

import { useProductStore } from "@/store/useProductStore";

import { type Product } from "@/types/product";
import { Colors } from "@/constants/Colors";

interface ProductCardsProps {
  product: Product;
  onSelect: (productId: string) => void;
}

function ProductCards({ product, onSelect }: ProductCardsProps) {
  const { productSelectionData } = useProductStore();

  return (
    <TouchableOpacity style={[cardStyles.cardContainer]} activeOpacity={0.8}>
      {productSelectionData.size > 0 && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: productSelectionData.has(product.id!)
              ? "rgba(0, 128, 0, 0.3)"
              : "rgba(0, 0, 0, 0.6)",
            zIndex: 1,
            borderRadius: 8,
          }}
          onPress={() => onSelect(product.product_id)}
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
    prevProduct.has_affiliate === nextProduct.has_affiliate &&
    prevProduct.is_grouped === nextProduct.is_grouped
  );
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
    shadowColor: "white",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 4,
    backgroundColor: Colors.dark.header,
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
    width: "100%",
    height: "100%",
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
