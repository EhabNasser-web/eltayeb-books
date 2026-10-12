import { test, expect } from "@playwright/test";

// تُشغَّل قبل ربط Supabase: تتحقق من عدم كسر البناء والتدهور اللطيف.
// بعد الربط والـ seed تُوسَّع لتغطية المحتوى الحقيقي.

test("الرئيسية تعمل", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "كتب قيّمة لحد باب بيتك" })).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("الدليل يعمل", async ({ page }, testInfo) => {
  await page.goto("/styleguide");
  await expect(page.getByRole("heading", { name: "مكونات الطيب للكتب" })).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/styleguide-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("العربة الفارغة تُعرض", async ({ page }, testInfo) => {
  await page.goto("/cart");
  await expect(page.getByText("العربة فاضية")).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/cart-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("إتمام الطلب يوجه للكتب عند فراغ العربة", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByText("العربة فارغة")).toBeVisible();
});

test("صفحة قسم غير موجودة تُظهر 404 مهذبة", async ({ page }) => {
  await page.goto("/c/books");
  await expect(page.getByRole("heading", { name: "الصفحة دي مش على الرف" })).toBeVisible();
});

test("دخول الإدارة يُعرض", async ({ page }, testInfo) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "دخول الإدارة" })).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/admin-login-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("فحص الصحة", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  expect(await res.json()).toEqual({ ok: true });
});
