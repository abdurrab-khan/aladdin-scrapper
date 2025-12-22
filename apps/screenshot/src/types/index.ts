type Website = "AMAZON" | "FLIPKART";
type ScreenShotVaritents = "FULL" | "GROUPED";

interface IFullScreenShotRequest {
  id: string;
  url: string;
  website: Website;
}

interface IGroupedScreenShotRequest {
  id: string;
  url: string;
  website: Website;
  priceDetails: {
    minPrice: number;
    maxPrice: number;
    discount: number;
  };
}

export {
  Website,
  ScreenShotVaritents,
  IFullScreenShotRequest,
  IGroupedScreenShotRequest,
};
