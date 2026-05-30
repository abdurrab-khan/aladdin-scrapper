import { supabase } from "@/api/clients/supabase";
import { Application } from "@/types";
import { PostgrestError } from "@supabase/supabase-js";

// Interface -- getAppData
interface getAppDataProps {
  user_id: string;
}

export async function getAppData(user_id: string): Promise<Application | null> {
  try {
    const appData = await supabase
      .from("apps")
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

    const data = appData.data[0];

    return {
      id: data?.app_id,
      name: data?.app_name,
      logo: data?.app_logo,
      is_active: data?.is_active,
      created_at: data?.created_at,
    } as Application;
  } catch (err) {
    const errMessage =
      err instanceof PostgrestError
        ? err.message
        : "An unexpected error occurred during fetching products";

    throw new Error(errMessage);
  }
}
