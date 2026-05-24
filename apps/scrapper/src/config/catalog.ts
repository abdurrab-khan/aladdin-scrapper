import { type Category } from "../types/common.js";

export const CATALOG_CONFIG: Record<string, Category> = {
  menClothings: {
    category: "menClothings",
    subCategories: {
      "T-Shirts": {
        maxPrice: 1500,
        minPrice: 120,
        maxDiscount: 75,
        maxBrandDiscount: 75,
        maxDiscountForFullPageScreenshot: 86,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "t-shirt", nodeId: "1968123031" },
          flipkart: {
            path: "/clothing-and-accessories/topwear/tshirt/men-tshirt/pr",
            sid: "clo,ash,ank,edy",
          },
        },
      },
      Shirts: {
        maxPrice: 2300,
        minPrice: 150,
        maxDiscount: 75,
        maxBrandDiscount: 78,
        maxDiscountForFullPageScreenshot: 85,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "shirts", nodeId: "1968120031" },
          flipkart: { path: "/mens-shirts/pr", sid: "clo,ash,axc,mmk" },
        },
      },
      Jeans: {
        maxPrice: 2400,
        minPrice: 180,
        maxDiscount: 75,
        maxBrandDiscount: 75,
        maxDiscountForFullPageScreenshot: 80,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "jeans", nodeId: "1968076031" },
          flipkart: {
            path: "/clothing-and-accessories/bottomwear/jeans/men-jeans/pr",
            sid: "clo,vua,k58,i51",
          },
        },
      },
      Trousers: {
        maxPrice: 1800,
        minPrice: 135,
        maxDiscount: 75,
        maxBrandDiscount: 78,
        maxDiscountForFullPageScreenshot: 85,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "pants", nodeId: "1968125031" },
          flipkart: { path: "/mens-trousers/pr", sid: "clo,vua,mle,lhk" },
        },
      },
    },
    lowPriorityCategories: {
      Watches: {
        maxPrice: 20000,
        minPrice: 5000,
        maxDiscount: 15,
        maxBrandDiscount: 10,
        maxDiscountForFullPageScreenshot: 20,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "watches", nodeId: "2238139031" },
          flipkart: { path: "/watches/wrist-watches/pr", sid: "r18,f13" },
        },
      },
      Perfume: {
        maxPrice: 8000,
        minPrice: 1500,
        maxDiscount: 25,
        maxBrandDiscount: 20,
        maxDiscountForFullPageScreenshot: 30,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "perfume", nodeId: "1374431031" },
          flipkart: {
            path: "/beauty-and-grooming/fragrances/perfume/pr",
            sid: "g9b,0yh,jhz",
          },
        },
      },
      Sunglasses: {
        maxPrice: 15000,
        minPrice: 3000,
        maxDiscount: 15,
        maxBrandDiscount: 10,
        maxDiscountForFullPageScreenshot: 20,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "sunglasses", nodeId: "1968039031" },
          flipkart: { path: "/search", sid: "" }, // Special case for search
        },
      },
      "Smart Watch": {
        maxPrice: 20000,
        minPrice: 5000,
        maxDiscount: 15,
        maxBrandDiscount: 10,
        maxDiscountForFullPageScreenshot: 20,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "smart watch", nodeId: "25635050031" },
          flipkart: {
            path: "/wearable-smart-devices/smart-watches/pr",
            sid: "ajy,buh",
          },
        },
      },
    },
  },
  footWear: {
    category: "footWear",
    subCategories: {
      Sneakers: {
        maxPrice: 2500,
        minPrice: 250,
        maxDiscount: 75,
        maxBrandDiscount: 77,
        maxDiscountForFullPageScreenshot: 80,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "sneakers", nodeId: "1983518031" },
          flipkart: {
            path: "/mens-footwear/casual-shoes/sneakers/pr",
            sid: "osp,cil,e1f",
          },
        },
      },
      "Formal Shoes": {
        maxPrice: 3500,
        minPrice: 250,
        maxDiscount: 70,
        maxBrandDiscount: 75,
        maxDiscountForFullPageScreenshot: 80,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "formal shoes", nodeId: "1983572031" },
          flipkart: {
            path: "/mens-footwear/formal-shoes/pr",
            sid: "osp,cil,ssb",
          },
        },
      },
    },
  },
  laptopAndDesktop: {
    category: "laptopAndDesktop",
    subCategories: {
      Laptops: {
        maxPrice: 85000,
        minPrice: 18000,
        maxDiscount: 45,
        maxBrandDiscount: 40,
        maxDiscountForFullPageScreenshot: 50,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "laptop", nodeId: "1375424031" },
          flipkart: { path: "/laptops/pr", sid: "6bo,b5g" },
        },
      },
      Monitor: {
        maxPrice: 20000,
        minPrice: 2000,
        maxDiscount: 50,
        maxBrandDiscount: 55,
        maxDiscountForFullPageScreenshot: 60,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "pc monitor", nodeId: "1375425031" },
          flipkart: { path: "/computers/monitors/pr", sid: "6bo,9no" },
        },
      },
      Mouse: {
        maxPrice: 2500,
        minPrice: 250,
        maxDiscount: 45,
        maxBrandDiscount: 50,
        maxDiscountForFullPageScreenshot: 60,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "mouse", nodeId: "1375412031" },
          flipkart: { path: "/laptop-accessories/mouse/pr", sid: "6bo,ai3,2ay" },
        },
      },
      Keyboard: {
        maxPrice: 5000,
        minPrice: 250,
        maxDiscount: 45,
        maxBrandDiscount: 55,
        maxDiscountForFullPageScreenshot: 60,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "keyboard", nodeId: "1375411031" },
          flipkart: {
            path: "/laptop-accessories/keyboards/pr",
            sid: "6bo,ai3,3oe",
          },
        },
      },
    },
  },
  healthAndPersonalCare: {
    category: "healthAndPersonalCare",
    subCategories: {
      Trimmer: {
        maxPrice: 2000,
        minPrice: 400,
        maxDiscount: 45,
        maxBrandDiscount: 50,
        maxDiscountForFullPageScreenshot: 60,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "trimmer", nodeId: "1374439031" },
          flipkart: {
            path: "/health-personal-care-appliances/personal-care-appliances/trimmers/pr",
            sid: "zlw,79s,by3",
          },
        },
      },
      "Hair Dryer": {
        maxPrice: 2000,
        minPrice: 400,
        maxDiscount: 45,
        maxBrandDiscount: 50,
        maxDiscountForFullPageScreenshot: 60,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "hair dryer", nodeId: "1374441031" },
          flipkart: {
            path: "/health-personal-care-appliances/personal-care-appliances/hair-dryers/pr",
            sid: "zlw,79s,mh8",
          },
        },
      },
    },
  },
  nutritionAndSupplements: {
    category: "nutritionAndSupplements",
    subCategories: {},
    lowPriorityCategories: {
      "Protein Powder": {
        maxPrice: 5000,
        minPrice: 500,
        maxDiscount: 60,
        maxBrandDiscount: 60,
        maxDiscountForFullPageScreenshot: 70,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "protein powder", nodeId: "1350384031" },
          flipkart: {
            path: "/health-care/health-supplements/protein-supplement/pr",
            sid: "hlc,etg,1rx",
          },
        },
      },
    },
  },
  sportsAndFitness: {
    category: "sportsAndFitness",
    subCategories: {},
    lowPriorityCategories: {
      "Home Gym Combos": {
        maxPrice: 5000,
        minPrice: 500,
        maxDiscount: 75,
        maxBrandDiscount: 80,
        maxDiscountForFullPageScreenshot: 82,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "home gym combos", nodeId: "26381705031" },
          flipkart: {
            path: "/exercise-fitness/fitness-equipment/home-gym-combos/pr",
            sid: "qoc,amf,pz0",
          },
        },
      },
      Dumbbells: {
        maxPrice: 4000,
        minPrice: 250,
        maxDiscount: 75,
        maxBrandDiscount: 80,
        maxDiscountForFullPageScreenshot: 82,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "dumbbells", nodeId: "3404717031" },
          flipkart: {
            path: "/exercise-fitness/fitness-accessories/dumbbells/pr",
            sid: "qoc,acb,zuc",
          },
        },
      },
    },
  },
  homeAppliances: {
    category: "homeAppliances",
    subCategories: {
      Iron: {
        maxPrice: 4000,
        minPrice: 250,
        maxDiscount: 60,
        maxBrandDiscount: 65,
        maxDiscountForFullPageScreenshot: 75,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "dry iron", nodeId: "1380023031" },
          flipkart: { path: "/iron/pr", sid: "j9e,abm,a0u" },
        },
      },
      "Water Purifier": {
        maxPrice: 10000,
        minPrice: 1700,
        maxDiscount: 75,
        maxBrandDiscount: 72,
        maxDiscountForFullPageScreenshot: 78,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "water purifier", nodeId: "1380061031" },
          flipkart: { path: "/water-purifiers/pr", sid: "j9e,abm,i45" },
        },
      },
      "Water Geyser": {
        maxPrice: 10000,
        minPrice: 1600,
        maxDiscount: 68,
        maxBrandDiscount: 65,
        maxDiscountForFullPageScreenshot: 75,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "water geyser", nodeId: "1380029031" },
          flipkart: { path: "/water-geysers/pr", sid: "j9e,abm,bfm" },
        },
      },
      "Washing Machine": {
        maxPrice: 40000,
        minPrice: 15000,
        maxDiscount: 10,
        maxBrandDiscount: 5,
        maxDiscountForFullPageScreenshot: 15,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "washing machine", nodeId: "1389395031" },
          flipkart: { path: "/washing-machines/pr", sid: "j9e,abm,8qx" },
        },
      },
      Refrigerator: {
        maxPrice: 50000,
        minPrice: 20000,
        maxDiscount: 10,
        maxBrandDiscount: 5,
        maxDiscountForFullPageScreenshot: 15,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "refrigerator", nodeId: "1380365031" },
          flipkart: { path: "/refrigerators/pr", sid: "j9e,abm,hzg" },
        },
      },
      Television: {
        maxPrice: 60000,
        minPrice: 25000,
        maxDiscount: 10,
        maxBrandDiscount: 5,
        maxDiscountForFullPageScreenshot: 15,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "television", nodeId: "1389396031" },
          flipkart: { path: "/televisions/pr", sid: "ckf,czl" },
        },
      },
      "Air Cooler": {
        maxPrice: 15000,
        minPrice: 4000,
        maxDiscount: 15,
        maxBrandDiscount: 10,
        maxDiscountForFullPageScreenshot: 20,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "air cooler", nodeId: "3705030031" },
          flipkart: { path: "/air-coolers/pr", sid: "j9e,abm,52j" },
        },
      },
      "Air Conditioner": {
        maxPrice: 50000,
        minPrice: 20000,
        maxDiscount: 10,
        maxBrandDiscount: 5,
        maxDiscountForFullPageScreenshot: 15,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "air conditioner", nodeId: "3474656031" },
          flipkart: { path: "/air-conditioners/pr", sid: "j9e,abm,c54" },
        },
      },
      Fans: {
        maxPrice: 5000,
        minPrice: 1000,
        maxDiscount: 20,
        maxBrandDiscount: 15,
        maxDiscountForFullPageScreenshot: 25,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "ceiling fan", nodeId: "4369221031" },
          flipkart: { path: "/fan/pr", sid: "j9e,abm,lbz" },
        },
      },
    },
  },
  kitchenAppliances: {
    category: "kitchenAppliances",
    subCategories: {
      MicrowaveOven: {
        maxPrice: 20000,
        minPrice: 5000,
        maxDiscount: 30,
        maxBrandDiscount: 35,
        maxDiscountForFullPageScreenshot: 40,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "microwave", nodeId: "1380017031" },
          flipkart: { path: "/microwave-ovens/pr", sid: "j9e,m38,o49" },
        },
      },
      "Mixer Juicer Grinder": {
        maxPrice: 5000,
        minPrice: 800,
        maxDiscount: 60,
        maxBrandDiscount: 65,
        maxDiscountForFullPageScreenshot: 75,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "mixer juicer grinder", nodeId: "1380045031" },
          flipkart: { path: "/mixerjuicergrinders/pr", sid: "j9e,m38,7ek" },
        },
      },
      "Coffee Maker": {
        maxPrice: 8000,
        minPrice: 500,
        maxDiscount: 45,
        maxBrandDiscount: 50,
        maxDiscountForFullPageScreenshot: 60,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "coffee maker", nodeId: "1379960031" },
          flipkart: { path: "/coffee-makers/pr", sid: "j9e,m38,wqo" },
        },
      },
      PopUpToaster: {
        maxPrice: 4000,
        minPrice: 500,
        maxDiscount: 45,
        maxBrandDiscount: 55,
        maxDiscountForFullPageScreenshot: 60,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "pop up toaster", nodeId: "1380011031" },
          flipkart: { path: "/popup-toasters/pr", sid: "j9e,m38,txh" },
        },
      },
      Cookware: {
        maxPrice: 8000,
        minPrice: 500,
        maxDiscount: 60,
        maxBrandDiscount: 70,
        maxDiscountForFullPageScreenshot: 75,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "cookware", nodeId: "1380031031" },
          flipkart: { path: "/kitchen-cookware-serveware/cookware/pr", sid: "upp,tnx" },
        },
      },
    },
  },
  homeFurnishing: {
    category: "homeFurnishing",
    subCategories: {},
    lowPriorityCategories: {
      Curtains: {
        maxPrice: 2500,
        minPrice: 150,
        maxDiscount: 60,
        maxBrandDiscount: 75,
        maxDiscountForFullPageScreenshot: 80,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "curtains", nodeId: "1380436031" },
          flipkart: { path: "/home-furnishing/curtains-accessories/curtains/pr", sid: "jra,pce,9f3" },
        },
      },
      "Cushion Covers": {
        maxPrice: 2000,
        minPrice: 100,
        maxDiscount: 60,
        maxBrandDiscount: 75,
        maxDiscountForFullPageScreenshot: 80,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "cushion covers", nodeId: "1380438031" },
          flipkart: { path: "/home-furnishing/cushion-pillow-covers/cushion-covers/pr", sid: "jra,ixy,jgq" },
        },
      },
      BedSheets: {
        maxPrice: 2500,
        minPrice: 150,
        maxDiscount: 75,
        maxBrandDiscount: 80,
        maxDiscountForFullPageScreenshot: 85,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "bedsheets", nodeId: "1380434031" },
          flipkart: { path: "/home-furnishing/bed-linen-blankets/bedsheets/pr", sid: "jra,knw,qcw" },
        },
      },
    },
  },
  homeDecor: {
    category: "homeDecor",
    subCategories: {},
    lowPriorityCategories: {
      Clocks: {
        maxPrice: 2500,
        minPrice: 150,
        maxDiscount: 60,
        maxBrandDiscount: 64,
        maxDiscountForFullPageScreenshot: 70,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "clocks", nodeId: "1380392031" },
          flipkart: { path: "/home-decor/clocks/pr", sid: "arb,kjw" },
        },
      },
    },
  },
  smartProducts: {
    category: "smartProducts",
    subCategories: {},
    lowPriorityCategories: {
      SmartLight: {
        maxPrice: 2500,
        minPrice: 120,
        maxDiscount: 65,
        maxBrandDiscount: 70,
        maxDiscountForFullPageScreenshot: 75,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "smart light", nodeId: "1380424031" },
          flipkart: { path: "/automation-robotics/smart-lighting/pr", sid: "igc,b4q" },
        },
      },
    },
  },
  audio: {
    category: "audio",
    subCategories: {
      Headphones: {
        maxPrice: 3500,
        minPrice: 150,
        maxDiscount: 60,
        maxBrandDiscount: 70,
        maxDiscountForFullPageScreenshot: 72,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "headphones", nodeId: "14146390031" },
          flipkart: { path: "/headset/headphones/pr", sid: "fcn,gc3" },
        },
      },
      TrueWirelessEarbuds: {
        maxPrice: 2500,
        minPrice: 150,
        maxDiscount: 50,
        maxBrandDiscount: 60,
        maxDiscountForFullPageScreenshot: 85,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "earbuds", nodeId: "14146389031" },
          flipkart: { path: "/headset/earphones/wireless-earphones/pr", sid: "fcn,821,a7x" },
        },
      },
    },
  },
  smartPhone: {
    category: "smartPhone",
    subCategories: {
      SmartPhone: {
        maxPrice: 20000,
        minPrice: 5000,
        maxDiscount: 25,
        maxBrandDiscount: 30,
        maxDiscountForFullPageScreenshot: 35,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "smartphones", nodeId: "1389401031" },
          flipkart: { path: "/mobiles/pr", sid: "tyy,4io" },
        },
      },
    },
  },
  bathAndPersonalCare: {
    category: "bathAndPersonalCare",
    subCategories: {
      Soap: {
        maxPrice: 500,
        minPrice: 50,
        maxDiscount: 38,
        maxBrandDiscount: 42,
        maxDiscountForFullPageScreenshot: 50,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "soap", nodeId: "1374415031" },
          flipkart: { path: "/beauty-and-grooming/bath-shower/bath-essentials/bath-soap/pr", sid: "g9b,5nz,b1b,yug" },
        },
      },
      "Washing Powder": {
        maxPrice: 1000,
        minPrice: 100,
        maxDiscount: 52,
        maxBrandDiscount: 58,
        maxDiscountForFullPageScreenshot: 60,
        urls: { amazon: "", flipkart: "" },
        baseConfig: {
          amazon: { keyword: "washing powder", nodeId: "1374507031" },
          flipkart: { path: "/home-cleaning-bathroom-accessories/household-supplies/washing-powders/pr", sid: "rja,plv,bwz" },
        },
      },
    },
  },
};
