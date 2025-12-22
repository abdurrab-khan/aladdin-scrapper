interface ISelector {
  FULL: {
    main: string;
    content: string;
    priceSection: string;
    image: string;
  };
  GROUPED: {
    sponsoreCard: string;
    card: string;
    price: string;
    discount: string;
  };
}

const selector: ISelector = {
  FULL: {
    main: "#ppd, #dp",
    image: "#leftCol",
    content: "#centerCol",
    priceSection: "#rightCol",
  },
  GROUPED: {
    price: "span.a-price.a-text-price[data-a-strike='true'] span.a-offscreen",
    discount: "span.a-price span.a-price-whole",
    card: "div.s-result-item.s-asin[id][data-uuid]",
    sponsoreCard: ".s-result-item.s-widget-spacing-small.AdHolder",
  },
};

export default selector;
