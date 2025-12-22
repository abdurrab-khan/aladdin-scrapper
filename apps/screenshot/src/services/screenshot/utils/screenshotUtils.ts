import { ElementHandle, Page, ScreenshotClip } from "puppeteer";

import {
  getMaxHeightForFullPage,
  getMaxWidthForFullPage,
  isValidProduct,
} from "./utils.js";

import AmazonSelector from "../css-selectors/amazon";
import FlipkartSelector from "../css-selectors/flipkart";
import CustomError from "@/utils/ErrorHandler";

import {
  IGroupedScreenShotRequest,
  ScreenShotVaritents,
  Website,
} from "@/types/index.js";

interface IScreenshotUtils {
  calClippedCoords: (
    page: Page,
    website: Website,
    varients: ScreenShotVaritents,
    priceDetails?: IGroupedScreenShotRequest["priceDetails"],
  ) => Promise<ScreenshotClip>;
}

class ScreenshotUtils implements IScreenshotUtils {
  async calClippedCoords(
    page: Page,
    website: Website,
    varients: ScreenShotVaritents,
    priceDetails?: IGroupedScreenShotRequest["priceDetails"],
  ): Promise<ScreenshotClip> {
    // checking whether or not price details there
    if (varients === "GROUPED" && !priceDetails) {
      throw new Error(
        `price details are required to take grouped screenshot for: ${website}`,
      );
    }

    if (website === "AMAZON") await page.reload();

    switch (varients) {
      case "FULL": {
        const mainElement = await this.getElementForFullPage(page, website);
        const maxHeight = await getMaxHeightForFullPage(website, mainElement);
        const maxWidth = await getMaxWidthForFullPage(website, mainElement);

        const mainElementBounding = await mainElement.boundingBox();

        if (mainElementBounding === null) {
          throw new Error(
            `Sorry we can't able to find bounding box for main element: ${website}`,
          );
        }

        return {
          x: mainElementBounding.x,
          y: mainElementBounding.y,
          height: maxHeight,
          width: maxWidth,
        };
      }
      case "GROUPED": {
        // let's remove all sponsore product cards;
        await this.removeSponsorsProducts(page, website);

        const cardsSelector =
          website === "AMAZON"
            ? AmazonSelector.GROUPED.card
            : FlipkartSelector.GROUPED.card;

        // let's fetch all product cards
        const productCards = await page.$$(cardsSelector);

        if (productCards.length === 0) {
          throw new Error(
            `Sorry we can't able to find product cards for: ${website}`,
          );
        }

        const validProductCards = await this.validatingGroupedProducts(
          productCards,
          website,
          priceDetails!,
        );

        return this.getClipedValueForGroup(validProductCards);
      }
    }
  }

  //  <======================> GROUPED - SCREENSHOT <======================>
  private async validatingGroupedProducts(
    elems: ElementHandle<Element>[],
    website: Website,
    priceDetails: IGroupedScreenShotRequest["priceDetails"],
  ) {
    const priceSelector =
      website === "AMAZON"
        ? AmazonSelector.GROUPED.price
        : FlipkartSelector.GROUPED.price;
    const discountPriceSelector =
      website === "AMAZON"
        ? AmazonSelector.GROUPED.discount
        : FlipkartSelector.GROUPED.discount;

    // checking whether price and discount is there or not.
    if (!priceSelector.trim() || !discountPriceSelector.trim()) {
      throw new Error(
        "Sorry there is some issue in price and discount selector check it.",
      );
    }

    // checking it's price and discount price whether it has valid products or not
    const result = [];

    for (let idx = 0; idx < elems.length && idx < 4; idx++) {
      const elem = elems[idx];

      const price = await elem.$(priceSelector);
      const discountPrice = await elem.$(discountPriceSelector);

      const isProductValid = isValidProduct(
        price,
        discountPrice,
        website,
        priceDetails,
      );

      if (!isProductValid) {
        if (idx >= 2) break;

        throw new CustomError({
          statusCode: 400,
          message: "There is no valid products to take a screenshot",
        });
      }

      result.push(elem);
    }

    return result;
  }

  private async getClipedValueForGroup(
    elems: ElementHandle<Element>[],
  ): Promise<ScreenshotClip> {
    let x: number = 0;
    let y: number = 0;
    let maxHeight: number = 0;
    let maxWidth: number = 0;

    for (let idx = 0; idx < elems.length; idx++) {
      const bounding = await elems[idx].boundingBox();

      if (!bounding) {
        throw new Error("Sorry we can't bounding founding box");
      }

      // extracting all values of bounding
      const {
        x: boundingX,
        y: boundingY,
        height: boundingHeight,
        width: boundingWidth,
      } = bounding;

      // intializing starting start position of product
      if (idx === 0) {
        x = boundingX;
        y = boundingY;
      }

      // handling horizontally aligned product cards
      if (boundingHeight > boundingWidth) {
        maxWidth += boundingWidth;
        maxHeight = Math.max(maxHeight, boundingHeight);
      } else {
        maxHeight += boundingHeight;
        maxWidth = Math.max(maxWidth, boundingWidth);
      }
    }

    return {
      x,
      y,
      height: maxHeight,
      width: maxWidth,
    };
  }

  private async removeSponsorsProducts(
    page: Page,
    website: Website,
  ): Promise<void> {
    const sponsorsSelector =
      website === "AMAZON"
        ? AmazonSelector.GROUPED.sponsoreCard
        : FlipkartSelector.GROUPED.sponsoreCard;

    // removing all sponsors cards
    await page.$$eval(
      sponsorsSelector,
      (elems, website) => {
        if (website === "FLIPKART") {
          const bounding = elems[0].getBoundingClientRect();

          if (bounding.height > bounding.width) {
            return;
          }
        }

        elems.forEach((e) => e.remove());
      },
      website,
    );
  }

  //  <======================> FULL - SCREENSHOT <======================>
  private async getElementForFullPage(
    page: Page,
    website: Website,
  ): Promise<ElementHandle<Element>> {
    let mainSelector: string | null = null;

    // finding -- css selector to full page main section
    if (website === "AMAZON") {
      mainSelector = AmazonSelector.FULL.main;
    } else if (website === "FLIPKART") {
      mainSelector = FlipkartSelector.FULL.main;
    }

    // throw an error if we can't find mainSelector
    if (mainSelector === null) {
      throw new Error(`Sorry we can't able to find selector for: ${website}`);
    }

    const mainElement = await page.$(mainSelector);

    if (mainElement === null) {
      throw new Error(
        `Sorry we can't able to find main element for: ${website}`,
      );
    }

    return mainElement;
  }
}

export default ScreenshotUtils;
