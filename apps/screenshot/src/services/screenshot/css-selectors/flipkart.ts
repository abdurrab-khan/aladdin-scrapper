interface ISelector {
  FULL: {
    main: string;
    content: string;
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
    main: ".QSCKDh.eRsYMo[style]",
    content: ".QSCKDh.eRsYMo",
    image: ".QSCKDh.dLgFEE.mfzC0s",
  },
  GROUPED: {
    price: "div.kRYCnD",
    discount: "div.hZ3P6w",
    card: "div.QSCKDh .nZIRY7 div[data-id]",
    sponsoreCard: "div.nZIRY7 div[data-id]:has(.t7gRps, .s4t9tK, .IxWX8O)",
  },
};

export default selector;
