import { createAnonClient } from "./supabase";
import { isSupabaseConfigured } from "@/lib/env";

/** الإعدادات العامة (is_public) — ترجع فارغًا بهدوء قبل الربط أو عند الخطأ. */
export async function getPublicSettings(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured()) return {};
  try {
    const db = createAnonClient();
    const { data } = await db.from("site_settings").select("key,value").eq("is_public", true);
    const out: Record<string, string> = {};
    for (const row of data ?? []) out[row.key as string] = row.value as string;
    return out;
  } catch {
    return {};
  }
}

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const all = await getPublicSettings();
  return all[key] ?? fallback;
}
