import { Application } from "@/types";
import { Product } from "@/types/product";
import { User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

// Generic utility: if T is an array of strings, return Product[]; if a single string, return Product | null.
type GetProductById = <T extends string | string[]>(
  id: T
) => T extends string[] ? Product[] : Product | null;

interface AppContextType {
  app: Application | null;
  session: User | null;
  products: Product[];
  pushProducts: (products: Product[] | null) => void;
  insertProducts: (products: Product[] | null) => void;
  addSession: (session: User | null) => void;
  addAppData: (appData: Application) => void;
  deleteProduct: (id: string | string[]) => void;
  updateProduct: (id: string | string[], updateValue: Partial<Product>) => void;
  getProductById: GetProductById;
}

export const AppContext = createContext<AppContextType>({
  app: null,
  session: null,
  products: [],
  addSession: (session: User | null) => {},
  addAppData: (appData: Application) => {},
  pushProducts: (products: Product[] | null) => {},
  insertProducts: (products: Product[] | null) => {},
  updateProduct: (id: string | string[], updateValue: Partial<Product>) => {},
  getProductById: ((_) => null) as GetProductById,
  deleteProduct: (id: string | string[]) => null,
});

const useAppContext = () => useContext(AppContext);

export default useAppContext;
