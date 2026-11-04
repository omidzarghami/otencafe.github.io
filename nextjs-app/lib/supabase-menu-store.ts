import { getSupabaseServer, isSupabaseConfigured } from "./supabase-server";
import type { MenuItem, MenuSection } from "./menu-data";

export type PersistedMenuState = {
  prices: Record<string, number>;
  settings: Record<string, unknown>;
  customSections: MenuSection[];
  customItems: Record<string, MenuItem[]>;
  sectionNameOverrides: Record<string, string>;
  itemNameOverrides: Record<string, string>;
  deletedItems: string[];
  deletedSections: string[];
};

function writeSecret() {
  return process.env.MENU_WRITE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export async function loadMenuStateFromSupabase(): Promise<PersistedMenuState | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  try {
    // Prefer direct table read (RLS allows select)
    const { data, error } = await supabase
      .from("menu_state")
      .select(
        "prices, settings, custom_sections, custom_items, section_name_overrides, item_name_overrides, deleted_items, deleted_sections"
      )
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      console.error("supabase menu load error:", error.message);
      return null;
    }
    if (!data) return null;

    return {
      prices: (data.prices as Record<string, number>) || {},
      settings: (data.settings as Record<string, unknown>) || {},
      customSections: (data.custom_sections as MenuSection[]) || [],
      customItems: (data.custom_items as Record<string, MenuItem[]>) || {},
      sectionNameOverrides: (data.section_name_overrides as Record<string, string>) || {},
      itemNameOverrides: (data.item_name_overrides as Record<string, string>) || {},
      deletedItems: (data.deleted_items as string[]) || [],
      deletedSections: (data.deleted_sections as string[]) || [],
    };
  } catch (error) {
    console.error("supabase menu load failed:", error);
    return null;
  }
}

export async function saveMenuStateToSupabase(
  state: PersistedMenuState
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseServer();
  const secret = writeSecret();
  if (!supabase || !secret) {
    console.error("supabase menu save skipped: missing client or MENU_WRITE_SECRET");
    return false;
  }

  try {
    // Prefer service-role direct upsert when available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { error } = await supabase.from("menu_state").upsert(
        {
          id: "default",
          prices: state.prices,
          settings: state.settings,
          custom_sections: state.customSections,
          custom_items: state.customItems,
          section_name_overrides: state.sectionNameOverrides,
          item_name_overrides: state.itemNameOverrides,
          deleted_items: state.deletedItems,
          deleted_sections: state.deletedSections,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (error) {
        console.error("supabase menu upsert error:", error.message);
        return false;
      }
      return true;
    }

    const { error } = await supabase.rpc("save_menu_state", {
      p_secret: secret,
      p_state: {
        prices: state.prices,
        settings: state.settings,
        custom_sections: state.customSections,
        custom_items: state.customItems,
        section_name_overrides: state.sectionNameOverrides,
        item_name_overrides: state.itemNameOverrides,
        deleted_items: state.deletedItems,
        deleted_sections: state.deletedSections,
      },
    });

    if (error) {
      console.error("supabase menu rpc save error:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("supabase menu save failed:", error);
    return false;
  }
}
