import { Application } from "@/types";
import { User } from "@supabase/supabase-js";
import { useCallback, useMemo, useState } from "react";
import { AppContext } from "./AppContext";

export default function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<User | null>(null);
  const [app, setApp] = useState<Application | null>(null);

  // =============== Add Session ===============
  const addSession = useCallback((session: User | null) => {
    setSession(session);
  }, []);

  // =============== Add App Data ===============
  const addAppData = useCallback((appData: Application) => {
    setApp(appData);
  }, []);

  const contextValue = useMemo(
    () => ({
      app,
      session,
      addSession,
      addAppData,
    }),
    [app, session, addSession, addAppData]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
