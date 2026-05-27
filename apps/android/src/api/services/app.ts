import { supabase } from "@/api/clients/supabase";
import { Application } from "@/types";
import { PostgrestError } from "@supabase/supabase-js";

// Interface -- getAppData
interface getAppDataProps {
  user_id: string;
}

export async function getAppData({
  user_id,
}: getAppDataProps): Promise<Application | null> {
  try {
    const appData = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true);

    if (appData.status !== 200) {
      throw new PostgrestError({
        message: appData.error?.message || "Failed to fetch app data",
        details: appData.error?.details || "",
        hint: appData.error?.hint || "",
        code: appData.error?.code || "",
      });
    }

    if (!appData.data || appData.data.length === 0) {
      return null;
    }

    return appData.data[0] as Application;
  } catch (err) {
    const errMessage =
      err instanceof PostgrestError
        ? err.message
        : "An unexpected error occurred during fetching products";

    throw new Error(errMessage);
  }
}
