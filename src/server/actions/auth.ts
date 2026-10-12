"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminLoginSchema } from "../schemas";
import { verifyTurnstile } from "../turnstile";
import { rateLimit } from "../ratelimit";
import { audit } from "../audit";
import { createServiceClient, createSessionClient } from "../supabase";

/* قفل مؤقت بعد محاولات فاشلة (في الذاكرة — نسخة واحدة، موثق في DEPLOY). */
const fails = new Map<string, { count: number; until: number }>();

function locked(key: string): boolean {
  const f = fails.get(key);
  return !!f && f.until > Date.now();
}

function recordFail(key: string): void {
  const f = fails.get(key) ?? { count: 0, until: 0 };
  f.count += 1;
  if (f.count >= 5) {
    f.until = Date.now() + 15 * 60_000;
    f.count = 0;
  }
  fails.set(key, f);
}

export async function loginAction(input: {
  email: string;
  password: string;
  turnstileToken: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };
  const { email, password, turnstileToken } = parsed.data;

  if (!rateLimit(`login:${ip}`, 20, 15 * 60_000)) {
    return { ok: false, error: "محاولات كثيرة — انتظر 15 دقيقة" };
  }
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return { ok: false, error: "فشل تحقق الحماية" };
  }
  const lockKey = `login:${ip}:${email.toLowerCase()}`;
  if (locked(lockKey)) return { ok: false, error: "الحساب مقفول مؤقتًا — حاول بعد 15 دقيقة" };

  const supa = await createSessionClient();
  const { error } = await supa.auth.signInWithPassword({ email, password });
  if (error) {
    recordFail(lockKey);
    return { ok: false, error: "بيانات الدخول غير صحيحة" };
  }

  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return { ok: false, error: "تعذر التحقق من الجلسة" };

  const service = createServiceClient();
  const { data: profile } = await service
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) {
    await supa.auth.signOut();
    await audit(null, "admin.forbidden", "admin_profiles", user.id, { email });
    return { ok: false, error: "هذا الحساب ليس أدمن" };
  }

  await audit(user.id, "admin.login", "admin_profiles", user.id, {});
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const supa = await createSessionClient();
  await supa.auth.signOut();
  redirect("/admin/login");
}

/** بدء تسجيل جهاز مصادقة (TOTP) — يرجع المفتاح وURI للإدخال اليدوي. */
export async function mfaEnrollAction(): Promise<
  { ok: true; factorId: string; secret: string; uri: string } | { ok: false; error: string }
> {
  try {
    const supa = await createSessionClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) return { ok: false, error: "سجّل الدخول أولًا" };
    const { data, error } = await supa.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "eltayeb-admin",
    });
    if (error || !data) return { ok: false, error: "تعذر بدء التسجيل — أعد المحاولة" };
    return { ok: true, factorId: data.id, secret: data.totp.secret, uri: data.totp.uri };
  } catch {
    return { ok: false, error: "تعذر بدء التسجيل — أعد المحاولة" };
  }
}

/** تأكيد التسجيل أو التحقق عند الدخول برمز 6 أرقام. */
export async function mfaVerifyAction(input: {
  factorId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!/^[0-9]{6}$/.test(input.code)) return { ok: false, error: "الرمز 6 أرقام" };
    if (!input.factorId) return { ok: false, error: "اختر الجهاز أولًا" };
    const supa = await createSessionClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) return { ok: false, error: "سجّل الدخول أولًا" };
    const { data: challenge, error: chErr } = await supa.auth.mfa.challenge({
      factorId: input.factorId,
    });
    if (chErr || !challenge) return { ok: false, error: "تعذر إنشاء التحدي — أعد المحاولة" };
    const { error } = await supa.auth.mfa.verify({
      factorId: input.factorId,
      challengeId: challenge.id,
      code: input.code,
    });
    if (error) return { ok: false, error: "رمز غير صحيح — تأكد من وقت الموبايل وحاول مجددًا" };
    await audit(user.id, "admin.mfa_verified", "admin_profiles", user.id, {});
    redirect("/admin");
  } catch {
    return { ok: false, error: "تعذر التحقق حاليًا — حاول مجددًا" };
  }
}

/** عوامل TOTP المسجلة للحساب الحالي. */
export async function mfaFactorsAction(): Promise<
  { ok: true; factors: Array<{ id: string; friendlyName: string }> } | { ok: false; error: string }
> {
  const supa = await createSessionClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return { ok: false, error: "سجّل الدخول أولًا" };
  const { data, error } = await supa.auth.mfa.listFactors();
  if (error || !data) return { ok: false, error: "تعذر القراءة" };
  return {
    ok: true,
    factors: (data.totp ?? []).map((f) => ({ id: f.id, friendlyName: f.friendly_name ?? "جهاز" })),
  };
}
