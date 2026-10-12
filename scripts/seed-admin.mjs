#!/usr/bin/env node
/*
 * إنشاء أول أدمن — يُشغَّل مرة واحدة محليًا بعد ضبط المتغيرات:
 *   ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD (+ مفاتيح Supabase في .env.local)
 * يرفض العمل لو يوجد أدمن بالفعل. تفعيل MFA يتم من /admin/mfa بعد الدخول.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_SEED_EMAIL;
const password = process.env.ADMIN_SEED_PASSWORD;

if (!url || !service || !email || !password) {
  console.error(
    "اضبط NEXT_PUBLIC_SUPABASE_URL وSUPABASE_SERVICE_ROLE_KEY وADMIN_SEED_EMAIL وADMIN_SEED_PASSWORD أولًا."
  );
  process.exit(1);
}

const db = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

const existing = await db.from("admin_profiles").select("user_id", { count: "exact", head: true });
if ((existing.count ?? 0) > 0) {
  console.error("يوجد أدمن بالفعل — السكريبت يعمل مرة واحدة فقط.");
  process.exit(1);
}

const { data: created, error: createErr } = await db.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (createErr || !created.user) {
  console.error("فشل إنشاء المستخدم:", createErr?.message);
  process.exit(1);
}

const { error: profileErr } = await db
  .from("admin_profiles")
  .insert({ user_id: created.user.id, role: "owner" });
if (profileErr) {
  console.error("فشل إنشاء الصلاحية:", profileErr.message);
  process.exit(1);
}

console.log(`تم إنشاء الأدمن ${email} — ادخل من /admin/login ثم فعّل MFA من /admin/mfa.`);
