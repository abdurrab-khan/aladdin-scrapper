import { Database } from "@/types/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// cspell:ignore supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Handle refresh token errors gracefully
    flowType: "pkce",
  },
});

// Handle auth errors globally
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "TOKEN_REFRESHED") {
    console.log("Token refreshed successfully");
  }
});

// Helper function to clear corrupted session data
export const clearAuthStorage = async () => {
  try {
    await AsyncStorage.removeItem("supabase.auth.token");
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error clearing auth storage:", error);
  }
};

// Additional function to clear all potential auth keys
export const clearAllAuthKeys = async () => {
  try {
    const keys = [
      "supabase.auth.token",
      "@supabase/auth-token",
      "sb-auth-token",
      "supabase-auth-token",
    ];

    await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error clearing all auth keys:", error);
  }
};

// // Upload image to Supabase Storage
// export const uploadImage = async (image: string): Promise<void> => {
//   try{
//     const response = await
//   }
// };
