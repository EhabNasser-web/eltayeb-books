import { redirect } from "next/navigation";
import { createServiceClient, createSessionClient } from "./supabase";

export const ADMIN_IDLE_MINUTES = 30;

/*
 * بوابة الإدارة على السيرفر: جلسة + دور + MFA + مهلة خمول.
 * تُستدعى في أول كل layout/action للإدارة. الإخفاء في الواجهة ليس حماية.
 */
export async function requireAdmin(): Promise<{ userId: string; email: string }> {
  const supa = await createSessionClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user?.email) redirect("/admin/login");

  const service = createServiceClient();
  const { data: profile } = await service
    .from("admin_profiles")
    .select("user_id,last_active_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/admin/login?e=forbidden");

  const { data: assurance } = await supa.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.currentLevel !== "aal2") redirect("/admin/mfa");

  const last = new Date(profile.last_active_at as string).getTime();
  if (Date.now() - last > ADMIN_IDLE_MINUTES * 60_000) {
    await supa.auth.signOut();
    redirect("/admin/login?e=expired");
  }
  await service
    .from("admin_profiles")
    .update({ last_active_at: new Date().toISOString() })
    .eq("user_id", user.id);

  return { userId: user.id, email: user.email };
}
