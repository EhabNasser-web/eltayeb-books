/*
 * تحديد المعدل في الذاكرة (نسخة واحدة على Railway — كافٍ للمرحلة 1).
 * القيد موثق: لو زادت النسخ لاحقًا يُنقل لمتجر خارجي.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

/** تنظيف دوري بسيط لتفادي نمو الخريطة. */
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}, 60_000).unref?.();
