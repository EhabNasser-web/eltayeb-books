"use server";

import { revalidatePath } from "next/cache";
import DOMPurify from "isomorphic-dompurify";
import { requireAdmin } from "../admin";
import { audit } from "../audit";
import { dispatchPendingEvents } from "../outbox";
import { categorySchema, orderUpdateSchema, productSchema, variantSchema } from "../schemas";
import { createServiceClient } from "../supabase";

type Fail = { ok: false; error: string };

async function authed() {
  return requireAdmin();
}

/* ---------- المنتجات ---------- */

export async function saveProductAction(
  input: unknown,
  id?: string
): Promise<{ ok: true; id: string } | Fail> {
  const admin = await authed();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "بيانات المنتج غير صالحة" };
  const db = createServiceClient();
  const row = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description,
    category_id: parsed.data.categoryId ?? null,
    price: parsed.data.price,
    stock_status: parsed.data.stockStatus,
    allow_cod: parsed.data.allowCod,
    is_new: parsed.data.isNew,
    is_published: parsed.data.isPublished,
  };
  if (id) {
    const { error } = await db.from("products").update(row).eq("id", id);
    if (error) return { ok: false, error: "تعذر الحفظ (تأكد من عدم تكرار الـ slug)" };
    await audit(admin.userId, "product.update", "products", id, { title: row.title });
    revalidatePath("/admin/products");
    return { ok: true, id };
  }
  const { data, error } = await db.from("products").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: "تعذر الإنشاء" };
  await audit(admin.userId, "product.create", "products", data.id as string, { title: row.title });
  revalidatePath("/admin/products");
  return { ok: true, id: data.id as string };
}

export async function saveVariantsAction(
  productId: string,
  variants: unknown
): Promise<{ ok: true } | Fail> {
  const admin = await authed();
  if (!Array.isArray(variants) || variants.length > 20)
    return { ok: false, error: "قائمة غير صالحة" };
  const parsed = variants.map((v, i) => ({ ...v, sort_order: i }));
  for (const v of parsed) {
    const r = variantSchema.safeParse(v);
    if (!r.success) return { ok: false, error: "بيانات مقاس غير صالحة" };
    if (r.data.isAvailable && r.data.price <= 0) {
      return { ok: false, error: `المقاس «${r.data.title}» متاح بسعره صفر — حدّد سعرًا أولًا` };
    }
  }
  const db = createServiceClient();
  const { error: delErr } = await db.from("product_variants").delete().eq("product_id", productId);
  if (delErr) return { ok: false, error: "تعذر الحفظ" };
  const { error } = await db.from("product_variants").insert(
    parsed.map((v, i) => ({
      product_id: productId,
      title: (v as { title: string }).title,
      dimensions: (v as { dimensions?: string }).dimensions ?? "",
      price: (v as { price: number }).price,
      compare_at_price: (v as { compareAtPrice?: number | null }).compareAtPrice ?? null,
      is_available: (v as { isAvailable: boolean }).isAvailable,
      sort_order: i,
    }))
  );
  if (error) return { ok: false, error: "تعذر الحفظ" };
  await audit(admin.userId, "variants.update", "products", productId, { count: parsed.length });
  revalidatePath("/admin/products");
  return { ok: true };
}

const ALLOWED_UPLOAD = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function uploadImageAction(
  productId: string,
  formData: FormData
): Promise<{ ok: true; url: string } | Fail> {
  const admin = await authed();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "اختر ملفًا" };
  if (file.size > 2 * 1024 * 1024) return { ok: false, error: "الحد الأقصى 2 ميجا" };
  const ext = ALLOWED_UPLOAD.get(file.type);
  if (!ext) return { ok: false, error: "النوع المسموح: jpg أو png أو webp" };

  const db = createServiceClient();
  const { data: product } = await db
    .from("products")
    .select("images")
    .eq("id", productId)
    .maybeSingle();
  if (!product) return { ok: false, error: "منتج غير موجود" };

  const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await db.storage
    .from("product-images")
    .upload(path, buf, { contentType: file.type });
  if (upErr) return { ok: false, error: "تعذر الرفع — تأكد من إنشاء الحزمة" };
  const {
    data: { publicUrl },
  } = db.storage.from("product-images").getPublicUrl(path);
  const images = [...((product.images as string[]) ?? []), publicUrl];
  await db.from("products").update({ images }).eq("id", productId);
  await audit(admin.userId, "product.image_add", "products", productId, { path });
  revalidatePath("/admin/products");
  return { ok: true, url: publicUrl };
}

export async function removeImageAction(
  productId: string,
  url: string
): Promise<{ ok: true } | Fail> {
  const admin = await authed();
  const marker = "/product-images/";
  const idx = url.indexOf(marker);
  if (idx < 0) return { ok: false, error: "رابط غير صالح" };
  const path = url.slice(idx + marker.length);
  if (!path.startsWith("products/")) return { ok: false, error: "رابط غير صالح" };
  const db = createServiceClient();
  await db.storage.from("product-images").remove([path]);
  const { data: product } = await db
    .from("products")
    .select("images")
    .eq("id", productId)
    .maybeSingle();
  const images = ((product?.images as string[]) ?? []).filter((u) => u !== url);
  await db.from("products").update({ images }).eq("id", productId);
  await audit(admin.userId, "product.image_remove", "products", productId, { path });
  revalidatePath("/admin/products");
  return { ok: true };
}

/* ---------- الأقسام ---------- */

export async function saveCategoryAction(
  input: unknown,
  id?: string
): Promise<{ ok: true; id: string } | Fail> {
  const admin = await authed();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "بيانات القسم غير صالحة" };
  const db = createServiceClient();
  const row = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description,
    status: parsed.data.status,
  };
  if (id) {
    const { error } = await db.from("categories").update(row).eq("id", id);
    if (error) return { ok: false, error: "تعذر الحفظ" };
    await audit(admin.userId, "category.update", "categories", id, { title: row.title });
  } else {
    const { data, error } = await db.from("categories").insert(row).select("id").single();
    if (error || !data) return { ok: false, error: "تعذر الإنشاء" };
    await audit(admin.userId, "category.create", "categories", data.id as string, {
      title: row.title,
    });
    revalidatePath("/admin/categories");
    return { ok: true, id: data.id as string };
  }
  revalidatePath("/admin/categories");
  return { ok: true, id };
}

/* ---------- الطلبات ---------- */

export async function updateOrderAction(
  orderId: string,
  input: unknown
): Promise<{ ok: true } | Fail> {
  const admin = await authed();
  const parsed = orderUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };
  const db = createServiceClient();
  const { error } = await db
    .from("orders")
    .update({
      status: parsed.data.status,
      payment_status: parsed.data.paymentStatus,
      internal_notes: parsed.data.internalNotes,
    })
    .eq("id", orderId);
  if (error) return { ok: false, error: "تعذر الحفظ" };
  await audit(admin.userId, "order.update", "orders", orderId, {
    status: parsed.data.status,
    payment_status: parsed.data.paymentStatus,
  });
  revalidatePath("/admin/orders");
  return { ok: true };
}

/* ---------- المحتوى (مع تنضيف HTML ضد XSS) ---------- */

export async function saveContentAction(
  key: string,
  title: string,
  bodyHtml: string
): Promise<{ ok: true } | Fail> {
  const admin = await authed();
  if (!/^[a-z_]+$/.test(key) || title.trim().length < 2 || bodyHtml.length > 50000) {
    return { ok: false, error: "بيانات غير صالحة" };
  }
  const clean = DOMPurify.sanitize(bodyHtml, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li", "a", "h2", "h3"],
    ALLOWED_ATTR: ["href"],
  });
  const db = createServiceClient();
  const { error } = await db
    .from("content_blocks")
    .update({ title: title.trim(), body_html: clean })
    .eq("key", key);
  if (error) return { ok: false, error: "تعذر الحفظ" };
  await audit(admin.userId, "content.update", "content_blocks", key, {});
  revalidatePath("/");
  return { ok: true };
}

/* ---------- الإعدادات ---------- */

const SETTING_RULES: Record<string, (v: string) => string | null> = {
  whatsapp_number: (v) => (/^01[0125][0-9]{8}$/.test(v.trim()) ? null : "رقم واتساب غير صالح"),
  facebook_url: (v) => (v.startsWith("https://") ? null : "رابط غير صالح"),
  instagram_url: (v) => (v === "" || v.startsWith("https://") ? null : "رابط غير صالح"),
  tiktok_url: (v) => (v === "" || v.startsWith("https://") ? null : "رابط غير صالح"),
  shipping_fee: (v) =>
    Number(v) >= 0 && Number.isFinite(Number(v)) ? null : "رسوم الشحن رقم غير سالب",
  transfer_details: (v) => (v.trim().length > 0 ? null : "بيانات التحويل مطلوبة"),
  team_name: (v) => (v.trim().length >= 2 ? null : "اسم الفريق مطلوب"),
  contact_sla: (v) => (v.trim().length >= 2 ? null : "مدة التواصل مطلوبة"),
};

export async function saveSettingsAction(
  entries: Array<{ key: string; value: string }>
): Promise<{ ok: true } | Fail> {
  const admin = await authed();
  for (const e of entries) {
    const rule = SETTING_RULES[e.key];
    if (!rule) return { ok: false, error: `إعداد غير معروف: ${e.key}` };
    const err = rule(e.value ?? "");
    if (err) return { ok: false, error: err };
  }
  const db = createServiceClient();
  for (const e of entries) {
    const { error } = await db.from("site_settings").update({ value: e.value }).eq("key", e.key);
    if (error) return { ok: false, error: "تعذر الحفظ" };
  }
  await audit(admin.userId, "settings.update", "site_settings", "", {
    keys: entries.map((e) => e.key),
  });
  revalidatePath("/");
  return { ok: true };
}

/* ---------- الانتظار والصادر ---------- */

export async function setWaitlistStatusAction(
  id: string,
  status: "new" | "notified"
): Promise<{ ok: true } | Fail> {
  const admin = await authed();
  const db = createServiceClient();
  const { error } = await db.from("waitlist").update({ status }).eq("id", id);
  if (error) return { ok: false, error: "تعذر الحفظ" };
  await audit(admin.userId, "waitlist.update", "waitlist", id, { status });
  revalidatePath("/admin/waitlist");
  return { ok: true };
}

export async function resendOutboxAction(): Promise<
  { ok: true; sent: number; processed: number } | Fail
> {
  const admin = await authed();
  try {
    const r = await dispatchPendingEvents(20);
    await audit(admin.userId, "outbox.resend", "outbox_events", "", r);
    return { ok: true, sent: r.sent, processed: r.processed };
  } catch {
    return { ok: false, error: "تعذر الإرسال — تحقق من إعدادات n8n" };
  }
}
