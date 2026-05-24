import { Website } from "@/types";
import { AmazonProvider } from "./amazon.provider";
import { FlipkartProvider } from "./flipkart.provider";
import { BaseProvider } from "./base.provider";

export class ProviderFactory {
  static getProvider(website: Website): BaseProvider {
    switch (website) {
      case "AMAZON":
        return new AmazonProvider();
      case "FLIPKART":
        return new FlipkartProvider();
      default:
        throw new Error(`Unsupported website: ${website}`);
    }
  }
}
