import { Product } from "./product";

export interface Database {
  public: {
    Views: {
      fetch_products_v2: {
        Row: Product;
      };
    };
  };
}
