# الطيب للكتب — eltayeb-books

متجر عربي (RTL) لبيع الكتب الدينية وكتب تزكية النفس. المواصفات الكاملة في
`PROJECT_SPEC.md` (منسوخة أيضًا كـ `AGENTS.md`). الهوية في `docs/DESIGN.md`.

الحالة الحالية: **المرحلة 0** — أساس تقني + هوية بصرية + صفحة «قيد التجهيز».

## التشغيل المحلي

متطلبات: **Node.js 20+** و**Git**. نزّلهما من nodejs.org وgit-scm.com (نسخة ويندوز).

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

ثم افتح http://localhost:3000 (والدليل `/styleguide`).

## الأوامر

| الأمر                               | الوظيفة                                               |
| ----------------------------------- | ----------------------------------------------------- |
| `npm run dev`                       | التطوير المحلي                                        |
| `npm run build`                     | بناء الإنتاج (أمر بناء Railway)                       |
| `npm run start`                     | تشغيل الإنتاج على `PORT` (أمر تشغيل Railway)          |
| `npm run lint`                      | ESLint بدون أي تحذيرات                                |
| `npm run typecheck`                 | فحص TypeScript                                        |
| `npm test`                          | اختبارات vitest                                       |
| `npm run format`                    | فحص تنسيق Prettier                                    |
| `npm run extract-palette -- <logo>` | استخراج ألوان اللوجو الفعلية                          |
| `npm run shots`                     | لقطات Playwright (375/768/1280) في `docs/screenshots` |

## النشر على Railway (خطوة بخطوة)

1. اعمل حساب على railway.app، وارفع المشروع على GitHub:
   ```powershell
   git init; git add -A; git commit -m "phase 0"; git branch -M main
   git remote add origin <رابط-الريبو>; git push -u origin main
   ```
2. في Railway: New Project ← Deploy from GitHub ← اختر الريبو.
3. إعدادات الخدمة: Build Command = `npm run build`، Start Command = `npm run start`،
   نسخة واحدة (replicas = 1).
4. Variables: أضف `ALLOW_STYLEGUIDE` فارغة (لإخفاء `/styleguide` في الإنتاج).
   لا توجد أسرار في هذه المرحلة.
5. Railway يعطيك دومين مؤقت + HTTPS تلقائيًا. تأكد أن `/api/health` يرجع `{"ok":true}`.
6. راجع حدود الخطة المجانية (رصيد صغير + ذاكرة محدودة) قبل الإطلاق الفعلي — التفاصيل
   في `PROJECT_SPEC.md` قسم 3.
.

## البنية

```
src/app            الصفحات (App Router): الرئيسية، /styleguide، /api/health
src/components     مكونات الهوية (يدوية — لا shadcn افتراضي)
src/lib            أدوات (cn، site) + اختبارات
supabase/          migrations (تبدأ من المرحلة 1)
scripts/           extract-palette
docs/              DESIGN.md + screenshots
tests/             لقطات Playwright
public/brand       اللوجو والـ favicon وصورة OG
```
