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
    main: 'div[style="max-width: 1200px; width: 100%;"].fWi7J_ div[style="width: 100%; position: static;"] div[style="flex-direction: row; background-color: rgb(255, 255, 255); margin: 0px;"]',
    content: ".QSCKDh.eRsYMo",
    image:
      ".QSCKDh.dLgFEE.mfzC0s, div[aspectratioinnumber]._1psv1zeb9._1psv1ze0",
  },
  GROUPED: {
    price: "div.kRYCnD",
    discount: "div.hZ3P6w",
    card: "div.QSCKDh .nZIRY7 div[data-id]",
    sponsoreCard: "div.nZIRY7 div[data-id]:has(.t7gRps, .s4t9tK, .IxWX8O)",
  },
};

export default selector;
