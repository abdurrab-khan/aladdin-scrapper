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
    main: ".sU0Kgs.ruXbYP.eq0K9s",
    content: ".QSCKDh.eRsYMo",
    image: ".QSCKDh.dLgFEE.mfzC0s",
  },
  GROUPED: {
    card: ".RGLWAk",
  },
};

export default selector;
