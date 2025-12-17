interface ISelector {
  FULL: {
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
    image: "#leftCol",
    content: "#centerCol",
    priceSection: "#rightCol",
  },
  GROUPED: {
    card: ".RGLWAk",
  },
};

export default selector;
