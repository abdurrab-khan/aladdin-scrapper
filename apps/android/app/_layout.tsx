import * as SplashScreen from "expo-splash-screen";
import { AppState, StatusBar } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { supabase } from "@/api/clients/supabase";
import { Colors } from "@/constants/Colors";
import queryClient from "@/api/clients/queryClient";
import AppContextProvider from "@/context/AppContextProvider";
import SplashScreenController from "@/components/SplashScreenController";

SplashScreen.preventAutoHideAsync();

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <StatusBar
          barStyle={"light-content"}
          backgroundColor={Colors.dark.header}
          animated
        />
        <SafeAreaProvider>
          <SplashScreenController />
        </SafeAreaProvider>
      </AppContextProvider>
    </QueryClientProvider>
  );
}
