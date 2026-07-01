import { Colors } from "@/constants/Colors";
import useAppContext from "@/context/AppContext";
import { getAppData } from "@/api/services/app";
import { supabase } from "@/api/clients/supabase";
import { Stack } from "expo-router";
import React, { useEffect } from "react";

export default function RootNavigator() {
  const { session, addSession, addAppData } = useAppContext();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === "SIGNED_OUT" || _event === "TOKEN_REFRESHED") {
        if (_event === "SIGNED_OUT") {
          addSession(null);
        }
      }

      if (_event === "SIGNED_IN" || _event === "TOKEN_REFRESHED") {
        if (session?.user) {
          addSession(session.user);

          // Let's find app data and add them into the state
          const appData = await getAppData(session.user.id);

          if (appData) {
            addAppData(appData);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [addSession, addAppData]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.dark.background,
        },
      }}
    >
      <Stack.Protected guard={session !== null}>
        <Stack.Screen
          name="(home)"
          options={{
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="(others)"
          options={{
            animation: "fade_from_bottom",
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={session === null}>
        <Stack.Screen
          name="(auth)"
          options={{
            animation: "fade",
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
