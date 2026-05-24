import type { E_COMMERCE, ProductSelector } from "../../types/common.js";

type CardSelectorType = Record<E_COMMERCE, string>;
type ProductDetailsType = Record<E_COMMERCE, Record<ProductSelector, string>>;

/**
 * CSS Selectors for selecting product cards.
 */
export const PRODUCT_CARD_SELECTOR: CardSelectorType = {
  amazon: "div[data-asin]:not([data-asin=''])",
  flipkart: "div.QSCKDh .nZIRY7 div[data-id]",
};

/**
 * CSS Selectors for extracting product details from product cards.
 */
export const PRODUCT_DETAILS: ProductDetailsType = {
  amazon: {
    name: "h2 a.a-link-normal span.a-text-normal, h2.a-size-mini span.a-text-normal",
    price: "span.a-price.a-text-price span.a-offscreen",
    discountPrice: "span.a-price span.a-offscreen",
    rating: "i.a-icon-star-small span, i.a-icon-star span, span.a-icon-alt",
    reviews: "span.a-size-base.s-underline-text, div[data-cy='reviews-block'] a.a-link-normal",
    brand: "h2.a-size-mini.s-line-clamp-1 span, .s-line-clamp-1",
    discountType: "span.a-badge-text",
    images: "img.s-image",
    url: "a.a-link-normal.s-no-outline",
  },
  flipkart: {
    name: "a.atJtCj, div.RG5Slk, a.pIpigb",
    price: "div.kRYCnD",
    discountPrice: "div.hZ3P6w",
    rating: "div.MKiFS6",
    reviews: "span.PvbNMB",
    brand: "div.Fo1I0b",
    images: "img.UCc1lI, img.MZeksS",
    discountType: "div.HZ0E6r.Rm9_cy",
    url: "a.k7wcnx, a.CIaYa1, a.GnxRXv",
  },
};

/**
 * CSS Selectors for the "Next" button on pagination.
 */
export const NEXT_BUTTON_SELECTOR: Record<E_COMMERCE, string> = {
  amazon: ".s-pagination-item.s-pagination-next",
  flipkart: "a.jgg0SZ",
};

export const FLIPKART_FETCH_BRAND_PRODUCTS = {
  mainSection: "section._2OLUF3",
  sectionTitle: ".fxf7w6.rgHxCQ",
  selector: "div.QCKZip.hpLdC3",
  input: "div.SDsN9S input.XPD6hh[placeholder='Search Brand']",
};

export const AMAZON_FETCH_BRAND_PRODUCTS = {
  seeMore:
    "div#brandsRefinements div.a-expander-extend-container a[aria-label='See more, Brands']",
  selector: "div#brandsRefinements li.a-spacing-micro a.s-navigation-item",
  selectionText: ".a-size-base.a-color-base",
};

export const FULL_PAGE_SELECTOR = {
  amazon: "div#ppd",
  flipkart: "div.sU0Kgs.ruXbYP",
};
