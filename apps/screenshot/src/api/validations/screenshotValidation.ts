import CustomError from "../../utils/ErrorHandler";
import {
  IFullScreenShotRequest,
  IGroupedScreenShotRequest,
} from "../../types/index";

const FULL_SCREENSHOT_REGEX = /^https:\/\/www\.(amazon\.in|flipkart\.com)\/.*/;
const GROUPED_SCREENSHOT_REGEX =
  /^https:\/\/www\.amazon\.in\/s\?.*|^https:\/\/www\.flipkart\.com\/.*\?.*/;

const validateFullScreenshotRequest = <T extends IFullScreenShotRequest>(
  data: T,
): T => {
  const { id = "", url = "", website = "" } = data ?? {};

  // checking --> whether id is there or not.
  if (!id) {
    throw new CustomError({
      statusCode: 400,
      message: `Id is requied for website: ${website}`,
    });
  }

  // checking --> valid website or not
  if (website !== "AMAZON" && website !== "FLIPKART") {
    throw new CustomError({
      statusCode: 400,
      message: `Invalid website: ${website}`,
    });
  }

  if (!FULL_SCREENSHOT_REGEX.test(url)) {
    throw new CustomError({
      message: `Invalid url for: ${website}`,
      statusCode: 400,
    });
  }

  return data;
};

const validateGroupedScreenshotRequest = <T extends IGroupedScreenShotRequest>(
  data: T,
): T => {
  const { id = "", url = "", website = "", priceDetails } = data ?? {};

  // checking --> whether id is there or not.
  if (!id) {
    throw new CustomError({
      statusCode: 400,
      message: `Id is requied for website: ${website}`,
    });
  }

  // checking --> valid website or not
  if (website !== "AMAZON" && website !== "FLIPKART") {
    throw new CustomError({
      statusCode: 400,
      message: `Invalid website: ${website}`,
    });
  }

  if (!GROUPED_SCREENSHOT_REGEX.test(url)) {
    throw new CustomError({
      message: `Invalid url for: ${website}`,
      statusCode: 400,
    });
  }

  if (
    !priceDetails?.discount ||
    !priceDetails?.maxPrice ||
    !priceDetails?.minPrice
  ) {
    throw new CustomError({
      statusCode: 400,
      message: `Invalid price details for: ${website}`,
    });
  }

  return data;
};

export { validateFullScreenshotRequest, validateGroupedScreenshotRequest };
