import { useCallback, useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import { AppContext } from "./AppContext";
import { Application } from "@/types";

export default function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<User | null>(null);
  const [app, setApp] = useState<Application | null>(null);

  const addSession = useCallback((session: User | null) => {
    setSession(session);
  }, []);

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
    [app, session, addSession, addAppData],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
