import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireEnv } from "@/lib/env";

/*
 * عملاء Supabase — إنشاء كسول داخل الدوال فقط (لا شيء على مستوى الوحدة).
 * مفاتيح anon علنية بطبيعتها ومحمية بـ RLS. مفتاح service role على السيرفر فقط.
 */

export function createAnonClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createSupabaseClient(url, anon);
}

export function createServiceClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const service = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createSupabaseClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** عميل مرتبط بجلسة المستخدم (للتحقق من الأدمن) — يُستخدم في Server Components/Actions. */
export async function createSessionClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value, options }) => store.set(name, value, options));
      },
    },
  });
}
