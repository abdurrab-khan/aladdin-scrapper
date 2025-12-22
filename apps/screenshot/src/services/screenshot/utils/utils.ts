import { ElementHandle } from "puppeteer";
import AmazonSelector from "../css-selectors/amazon";
import FlipkartSelector from "../css-selectors/flipkart";
import { IGroupedScreenShotRequest, Website } from "@/types/index";

// =================== GROUPED UTILS FUNCTION ===================
function isValidProduct(
  price: ElementHandle<Element> | null,
  discountPrice: ElementHandle<Element> | null,
  website: Website,
  priceDetails: IGroupedScreenShotRequest["priceDetails"],
): boolean {
  return true;
  // extracting inner text from it.
  const priceText = price?.evaluate((e) => e.textContent);
  const discountText = discountPrice?.evaluate((e) => e.textContent);

  if (!priceText || !discountText) {
    throw new Error(
      `Sorry we can't able to find price element for: ${website}`,
    );
  }

  return true;
}

// =================== FULL UTILS FUNCTION ===================
async function getMaxHeightForFullPage(
  website: Website,
  mainElement: ElementHandle<Element>,
): Promise<number> {
  // trying to find max height --- amazon
  if (website === "AMAZON") {
    const imageSection = await mainElement.$(AmazonSelector.FULL.image);
    const priceSection = await mainElement.$(AmazonSelector.FULL.priceSection);

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

async function getMaxWidthForFullPage(
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

export { isValidProduct, getMaxHeightForFullPage, getMaxWidthForFullPage };
