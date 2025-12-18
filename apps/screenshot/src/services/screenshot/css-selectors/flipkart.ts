interface ISelector {
  FULL: {
    main: string;
    content: string;
    image: string;
  };
  GROUPED: {
    card: string;
  };
}

const selector: ISelector = {
  FULL: {
    main: ".QSCKDh.eRsYMo[style]",
    content: ".QSCKDh.eRsYMo",
    image: ".QSCKDh.dLgFEE.mfzC0s",
  },
  GROUPED: {
    card: ".lvJbLV div[data-id]",
  },
};

export default selector;
