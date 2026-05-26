import SplashScreenController from '@/components/SplashScreenController';
import { Colors } from '@/constants/Colors';
import AppContextProvider from '@/context/AppContextProvider';
import { supabase } from '@/lib/supabase';
import * as SplashScreen from 'expo-splash-screen';
import { AppState, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';


SplashScreen.preventAutoHideAsync();

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function RootLayout() {
  return (
    <AppContextProvider>
      <StatusBar barStyle={"light-content"} backgroundColor={Colors.dark.header} animated />
      <SafeAreaProvider>
        {/* Control Splash Screen With Protected Route */}
        <SplashScreenController />
      </SafeAreaProvider>
    </AppContextProvider>
  );
}
