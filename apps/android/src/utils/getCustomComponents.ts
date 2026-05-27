import AjioLogo from "@/assets/images/icons/e-commerce/ajio.svg";
import AmazonLogo from "@/assets/images/icons/e-commerce/amazon.svg";
import FlipkartLogo from "@/assets/images/icons/e-commerce/flipkart.svg";
import MyntraLogo from "@/assets/images/icons/e-commerce/myntra.svg";

// social media
import MetaLogo from "@/assets/images/icons/social-media/meta.png";
import TelegramLogo from "@/assets/images/icons/social-media/telegram.png";
import XLogo from "@/assets/images/icons/social-media/x.png";
import { SocialMedia } from "@/types";

export const getPlatformLogo = (plateForm: any) => {
  switch (plateForm) {
    case "amazon":
      return AmazonLogo;
    case "flipkart":
      return FlipkartLogo;
    case "myntra":
      return MyntraLogo;
    default:
      return AjioLogo;
  }
};

export const getSocialMediaLogo = (platform: SocialMedia) => {
  switch (platform) {
    case "telegram":
      return TelegramLogo;
    case "meta":
      return MetaLogo;
    case "x":
      return XLogo;
  }
};
