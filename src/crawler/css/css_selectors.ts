import type { E_COMMERCE, ProductSelector } from "../../types/index.js";

type CardSelectorType = Record<E_COMMERCE, string>;
type ProductDetailsType = Record<E_COMMERCE, Record<ProductSelector, string>>;

/**
 * CSS Selectors for selecting product cards.
 */
export const CARD_SELECTOR: CardSelectorType = {
  amazon:
    "div.puis-card-container.s-card-container, .a-column.a-span4.dp_aib_left_column_t1",
  flipkart:
    "div._1sdMkc.LFEi7Z, div.tUxRFH, div.slAVV4, div.DOjaWF.gdgoEp.col-8-12",
};

/**
 * CSS Selectors for extracting product details from product cards.
 */
export const PRODUCT_DETAILS: ProductDetailsType = {
  amazon: {
    productName: "h2.a-color-base.a-text-normal span",
    price: "span.a-price.a-text-price[data-a-strike='true'] span.a-offscreen",
    discountPrice: "span.a-price span.a-price-whole",
    rating:
      "div.a-spacing-top-micro[data-cy='reviews-block'] span.a-size-small.a-color-base",
    reviews:
      "div.a-spacing-top-micro[data-cy='reviews-block'] span.puis-normal-weight-text.s-underline-text",
    brand: "h2.a-size-mini.s-line-clamp-1 span.a-size-base-plus.a-color-base",
    image: "div.s-product-image-container img",
    productUrl: "div.s-product-image-container a.a-link-normal",
  },
  flipkart: {
    productName: ".KzDlHZ, .WKTcLC, .wjcEIp",
    price: ".yRaY8j",
    discountPrice: ".Nx9bqj",
    rating: ".XQDdHH",
    reviews: ".Wphh3N",
    brand: ".syl9yP",
    image: ".gqcSqV.YGE0gZ img, ._4WELSP img",
    productUrl: "a.VJA3rP, a.rPDeLR, a.CGtC98",
  },
};

/**
 * CSS Selectors for the "Next" button on pagination.
 */
export const NEXT_BUTTON_SELECTOR: Record<E_COMMERCE, string> = {
  amazon: ".s-pagination-item.s-pagination-next",
  flipkart: ".WSL9JP ._9QVEpD",
};
