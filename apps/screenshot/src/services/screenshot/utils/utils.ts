import { ScreenShotVaritents, Website } from "@/types/index.js";
import { ElementHandle, ScreenshotClip } from "puppeteer";

interface IUtils {
  calClippedCoords: (
    website: Website,
    varients: ScreenShotVaritents,
    element: ElementHandle<Element>,
  ) => Promise<ScreenshotClip>;
}

class Utils implements IUtils {
  async calClippedCoords(
    website: Website,
    varients: ScreenShotVaritents,
    element: ElementHandle<Element>,
  ): Promise<ScreenshotClip> {
    switch (varients) {
      case "FULL": {
        const boundingBox = await element.boundingBox();

        return {
          x: 0,
          y: 0,
          height: 1080,
          width: 1080,
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
}

export default Utils;
