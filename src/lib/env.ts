/** الوصول الآمن لمتغيرات البيئة — تُقرأ عند الطلب لا عند الاستيراد (لينجح البناء بدونها). */
export function getEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export function requireEnv(name: string): string {
  const v = getEnv(name);
  if (!v) throw new Error(`متغير البيئة ${name} غير مضبوط — راجع docs/DEPLOY.md`);
  return v;
}

/** هل إعدادات Supabase موجودة؟ (وضع التدهور اللطيف قبل الربط) */
export function isSupabaseConfigured(): boolean {
  return Boolean(getEnv("NEXT_PUBLIC_SUPABASE_URL") && getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function isServiceConfigured(): boolean {
  return isSupabaseConfigured() && Boolean(getEnv("SUPABASE_SERVICE_ROLE_KEY"));
}
