import { Application } from "@/types";
import { User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

interface AppContextType {
  app: Application | null;
  session: User | null;
  addSession: (session: User | null) => void;
  addAppData: (appData: Application) => void;
}

export const AppContext = createContext<AppContextType>({
  app: null,
  session: null,
  addSession: (session: User | null) => {},
  addAppData: (appData: Application) => {},
});

const useAppContext = () => useContext(AppContext);

export default useAppContext;
