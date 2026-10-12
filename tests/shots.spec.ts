import { test, expect } from "@playwright/test";

// يلتقط الرئيسية و/styleguide على 375 و768 و1280 (عبر مشاريع الإعداد).
test("الرئيسية تعمل", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "الطيب للكتب" })).toBeVisible();
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

test("فحص الصحة", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  expect(await res.json()).toEqual({ ok: true });
});
