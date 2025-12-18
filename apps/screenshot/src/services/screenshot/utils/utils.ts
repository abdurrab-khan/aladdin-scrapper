import { ScreenShotVaritents, Website } from "@/types/index.js";
import { ElementHandle, Page, ScreenshotClip } from "puppeteer";
import AmazonSelector from "../css-selectors/amazon.js";
import FlipkartSelector from "../css-selectors/flipkart.js";

interface IUtils {
  calClippedCoords: (
    page: Page,
    website: Website,
    varients: ScreenShotVaritents,
  ) => Promise<ScreenshotClip>;
}

class Utils implements IUtils {
  async calClippedCoords(
    page: Page,
    website: Website,
    varients: ScreenShotVaritents,
  ): Promise<ScreenshotClip> {
    switch (varients) {
      case "FULL": {
        const mainElement = await this.getElementForFullPage(page, website);
        const maxHeight = await this.getMaxHeightForFullPage(
          website,
          mainElement,
        );
        const maxWidth = await this.getMaxWidthForFullPage(
          website,
          mainElement,
        );

        const mainElementBounding = await mainElement.boundingBox();

        if (mainElementBounding === null) {
          throw new Error(
            `Sorry we can't able to found bounding box for main element: ${website}`,
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
        return {
          x: 0,
          y: 0,
          height: 1080,
          width: 1080,
        };
      }
    }
  }

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

  private async getElementForGrouped(website: Website) {}

  private async getMaxHeightForFullPage(
    website: Website,
    mainElement: ElementHandle<Element>,
  ): Promise<number> {
    // trying to find max height --- amazon
    if (website === "AMAZON") {
      const imageSection = await mainElement.$(AmazonSelector.FULL.image);
      const priceSection = await mainElement.$(
        AmazonSelector.FULL.priceSection,
      );

      // if we not found any of them -- throwing an error
      if (imageSection === null || priceSection === null) {
        throw new Error(
          `Sorry we can't able to find image or price section for: ${website}`,
        );
      }

      const imageBounding = await imageSection.boundingBox();
      const priceBounding = await priceSection.boundingBox();

      // if we not found any of them -- throwing an error
      if (imageBounding === null || priceBounding === null) {
        throw new Error(
          `Sorry we can't able to find image or price bounding for: ${website}`,
        );
      }

      return Math.max(imageBounding.height, priceBounding.height);
    } else if (website === "FLIPKART") {
      // trying to find max height -- flipkart
      const imageSection = await mainElement.$(FlipkartSelector.FULL.image);

      // if we not found image -- throwing an error
      if (imageSection === null) {
        throw new Error(
          `Sorry we can't able to find image section for: ${website}`,
        );
      }

      const imageBounding = await imageSection.boundingBox();

      // if we not found image bounding -- throwing an error
      if (imageBounding === null) {
        throw new Error(
          `Sorry we can't able to find image bounding for: ${website}`,
        );
      }

      return imageBounding.height + 28;
    } else {
      throw new Error(`Invalid website: ${website} it's not supported.`);
    }
  }

  private async getMaxWidthForFullPage(
    website: Website,
    mainElement: ElementHandle<Element>,
  ): Promise<number> {
    if (website === "AMAZON") {
      const mainElementBounding = await mainElement.boundingBox();

      // throwing an error -- if no bounding box found
      if (mainElementBounding === null) {
        throw new Error(
          `Sorry we can't able to found main bounding box for height: ${website}`,
        );
      }

      return mainElementBounding.width;
    } else if (website === "FLIPKART") {
      const mainElementBounding = await mainElement.boundingBox();

      // throwing an error -- if no bounding box found
      if (mainElementBounding === null) {
        throw new Error(
          `Sorry we can't able to found main bounding box for height: ${website}`,
        );
      }

      return mainElementBounding.width;
    } else {
      throw new Error(`Invalid website: ${website} it's not supported.`);
    }
  }
}

export default Utils;
