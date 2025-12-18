interface ISelector {
  FULL: {
    main: string;
    content: string;
    priceSection: string;
    image: string;
  };
  GROUPED: {
    card: string;
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
    card: ".s-result-item.s-widget-spacing-small:not(.AdHolder)",
  },
};

export default selector;
