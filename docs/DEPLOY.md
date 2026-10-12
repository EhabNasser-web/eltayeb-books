# النشر والإعداد — المرحلة 1

## 1) مشروع Supabase (يدوي — مرة واحدة)

1. أنشئ مشروعًا جديدًا على supabase.com (الخطة المجانية).
2. من Dashboard ← **SQL Editor**: نفّذ ملفات `supabase/migrations` بالترتيب
   (`0001_core.sql` ثم `0002_seed` ثم `0003_admin_session`).
3. حزمة الصور تُنشأ تلقائيًا من الـ migration (اسمها `product-images` وقراءتها عامة).
4. من **Project Settings ← API**: انسخ `Project URL` و`anon public key` و`service_role key`.

## 2) متغيرات البيئة

### محليًا (`.env.local` — من `.env.example`)

| المتغير                                                   | من أين                                                                                               |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                                | إعدادات Supabase                                                                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                           | إعدادات Supabase                                                                                     |
| `SUPABASE_SERVICE_ROLE_KEY`                               | إعدادات Supabase (سري — سيرفر فقط)                                                                   |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | dash.cloudflare.com ← Turnstile                                                                      |
| `N8N_WEBHOOK_BASE_URL` + `N8N_WEBHOOK_SECRET`             | سيرفر n8n (لاحقًا — بدونهما تبقى الأحداث معلقة دون ضرر)                                              |
| `OUTBOX_WORKER_KEY`                                       | ولّد قيمة عشوائية طويلة (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `ADMIN_SEED_EMAIL` + `ADMIN_SEED_PASSWORD`                | اخترهما أنت (للتشغيل مرة واحدة ثم احذفهما)                                                           |
| `NEXT_PUBLIC_SITE_URL`                                    | دومين Railway بعد النشر                                                                              |

### Railway (Variables)

نفس القائمة أعلاه + `ALLOW_STYLEGUIDE` فارغة. لا تضع أي ملفات على القرص —
الصور في Storage فقط.

## 3) أول أدمن + MFA

```powershell
npm run seed:admin
```

ثم ادخل `/admin/login` وفعّل المصادقة الثنائية من `/admin/mfa` (إجبارية — لا دخول بدونها).

## 4) n8n (لاحقًا)

1. أنشئ Webhook production لكل حدث (`order.created` و`waitlist.created`) — الشكل في `docs/n8n-events.md`.
2. أضف Schedule Trigger كل دقيقة يستدعي `POST /api/worker/outbox` بالـ Bearer key.
3. أول node يتحقق من `X-Webhook-Secret`.

## 5) قبل الإطلاق — راجع بنفسك

- [ ] رسوم الشحن في الإعدادات قيمة حقيقية (ليست صفرًا).
- [ ] `allow_cod` لكل منتج مضبوط حسب سياستك.
- [ ] أسعار المقاسات والتوافر مطابقة للواقع.
- [ ] مفاتيح Turnstile حقيقية (ليست اختبارية).
- [ ] جرّبت طلبًا كاملًا من موبايل حقيقي.
- [ ] قايمة المراجعة في `PROJECT_SPEC.md` (القسم الرابع).
