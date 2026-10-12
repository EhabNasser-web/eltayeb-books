"use server";

import { headers } from "next/headers";
import { isValidEgyptianPhone, normalizeEgyptianPhone } from "@/lib/phone";
import { GOVERNORATES } from "@/lib/governorates";
import { getEnv } from "@/lib/env";
import { calculateCart, type VariantInfo } from "../cart";
import { checkoutSchema } from "../schemas";
import { verifyTurnstile } from "../turnstile";
import { rateLimit } from "../ratelimit";
import { audit } from "../audit";
import { createServiceClient } from "../supabase";

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** تحميل المتغيرات من القاعدة وتحويلها لخريطة الحساب. */
async function loadVariants(ids: string[]): Promise<Map<string, VariantInfo>> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("product_variants")
    .select(
      "id,price,is_available,product:products(id,title,price,is_published,stock_status,allow_cod)"
    )
    .in("id", ids);
  if (error) throw new Error("تعذر تحميل الأصناف");
  const map = new Map<string, VariantInfo>();
  for (const row of (data ?? []) as Array<{
    id: string;
    price: number;
    is_available: boolean;
    product:
      | Array<{
          id: string;
          title: string;
          is_published: boolean;
          stock_status: string;
          allow_cod: boolean;
        }>
      | {
          id: string;
          title: string;
          is_published: boolean;
          stock_status: string;
          allow_cod: boolean;
        }
      | null;
  }>) {
    const prod = Array.isArray(row.product) ? row.product[0] : row.product;
    if (!prod) continue;
    map.set(row.id, {
      id: row.id,
      productId: prod.id,
      productTitle: prod.title,
      variantTitle: "",
      price: Number(row.price),
      isAvailable: row.is_available,
      isPublished: prod.is_published,
      productInStock: prod.stock_status === "in_stock",
      allowCod: prod.allow_cod,
    });
  }
  // عنوان المتغير للرسائل
  const { data: names } = await db.from("product_variants").select("id,title").in("id", ids);
  for (const n of (names ?? []) as Array<{ id: string; title: string }>) {
    const v = map.get(n.id);
    if (v) v.variantTitle = n.title;
  }
  return map;
}

async function getShippingFee(): Promise<number> {
  const db = createServiceClient();
  const { data } = await db
    .from("site_settings")
    .select("value")
    .eq("key", "shipping_fee")
    .maybeSingle();
  const fee = Number(
    (data as { value?: string } | null)?.value ?? getEnv("SHIPPING_FEE_FALLBACK") ?? 0
  );
  return Number.isFinite(fee) && fee >= 0 ? fee : 0;
}

/** معاينة محسوبة من السيرفر لشاشة المراجعة (بدون أي حفظ). */
export async function previewCartAction(
  items: Array<{ variantId: string; quantity: number }>
): Promise<
  ActionResult<{
    subtotal: number;
    shippingFee: number;
    total: number;
    codAllowed: boolean;
    count: number;
  }>
> {
  try {
    const parsed = checkoutSchema.shape.items.safeParse(items);
    if (!parsed.success) return { ok: false, error: "العربة غير صالحة" };
    const map = await loadVariants(parsed.data.map((i) => i.variantId));
    const r = calculateCart(parsed.data, map, await getShippingFee());
    if (r.errors.length > 0) return { ok: false, error: r.errors[0] };
    return {
      ok: true,
      data: {
        subtotal: r.subtotal,
        shippingFee: r.shippingFee,
        total: r.total,
        codAllowed: r.codAllowed,
        count: r.lines.reduce((s, l) => s + l.quantity, 0),
      },
    };
  } catch {
    return { ok: false, error: "تعذر حساب السلة — حاول لاحقًا" };
  }
}

export type CheckoutInput = {
  items: Array<{ variantId: string; quantity: number }>;
  customerName: string;
  customerPhone: string;
  customerPhone2?: string;
  governorate: string;
  address: string;
  notes?: string;
  paymentMethod: "cod" | "prepaid";
  idempotencyKey: string;
  turnstileToken: string;
};

/** إنشاء الطلب: تحقق كامل على السيرفر ثم إدراج ذري واحد. */
export async function createOrderAction(
  input: CheckoutInput
): Promise<ActionResult<{ orderNumber: string; total: number }>> {
  try {
    const ip = await clientIp();
    if (!rateLimit(`order:${ip}`, 10, 10 * 60_000)) {
      return { ok: false, error: "محاولات كثيرة — انتظر قليلًا وحاول مجددًا" };
    }

    const parsed = checkoutSchema.safeParse({
      ...input,
      customerPhone2: input.customerPhone2 ?? "",
      notes: input.notes ?? "",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
    }
    const data = parsed.data;

    if (!(await verifyTurnstile(data.turnstileToken, ip))) {
      return { ok: false, error: "فشل تحقق الحماية — حدّث الصفحة وحاول مجددًا" };
    }
    if (!isValidEgyptianPhone(data.customerPhone)) {
      return { ok: false, error: "رقم الموبايل غير صالح (01xxxxxxxxx)" };
    }
    if (data.customerPhone2 && !isValidEgyptianPhone(data.customerPhone2)) {
      return { ok: false, error: "الرقم الإضافي غير صالح" };
    }
    if (!(GOVERNORATES as readonly string[]).includes(data.governorate)) {
      return { ok: false, error: "اختر المحافظة من القائمة" };
    }

    const phone = normalizeEgyptianPhone(data.customerPhone);
    const phone2 = data.customerPhone2 ? normalizeEgyptianPhone(data.customerPhone2) : "";

    const db = createServiceClient();

    // منع التكرار: نفس المفتاح يرجع نفس الطلب
    const { data: existing } = await db
      .from("orders")
      .select("order_number,total")
      .eq("idempotency_key", data.idempotencyKey)
      .maybeSingle();
    if (existing) {
      return {
        ok: true,
        data: {
          orderNumber: existing.order_number as string,
          total: Number(existing.total),
        },
      };
    }

    const map = await loadVariants(data.items.map((i) => i.variantId));
    const calc = calculateCart(data.items, map, await getShippingFee());
    if (calc.errors.length > 0) return { ok: false, error: calc.errors[0] };
    if (data.paymentMethod === "cod" && !calc.codAllowed) {
      return {
        ok: false,
        error: "الدفع عند الاستلام غير متاح لبعض الأصناف — اختر الدفع المسبق",
      };
    }

    const snapshotItems = calc.lines.map((l) => {
      const v = map.get(l.variantId);
      return {
        product_id: v?.productId,
        variant_id: l.variantId,
        title: l.productTitle,
        variant_title: l.variantTitle,
        unit_price: l.unitPrice,
        quantity: l.quantity,
        line_total: l.lineTotal,
      };
    });

    const { data: created, error } = await db.rpc("create_order", {
      p_idempotency_key: data.idempotencyKey,
      p_customer_name: data.customerName.trim(),
      p_customer_phone: phone,
      p_customer_phone2: phone2,
      p_governorate: data.governorate,
      p_address: data.address.trim(),
      p_notes: data.notes?.trim() ?? "",
      p_payment_method: data.paymentMethod,
      p_subtotal: calc.subtotal,
      p_shipping_fee: calc.shippingFee,
      p_total: calc.total,
      p_items: snapshotItems,
    });
    if (error || !created) {
      // سباق محتمل على نفس المفتاح — أعد القراءة
      const { data: retry } = await db
        .from("orders")
        .select("order_number,total")
        .eq("idempotency_key", data.idempotencyKey)
        .maybeSingle();
      if (retry) {
        return {
          ok: true,
          data: { orderNumber: retry.order_number as string, total: Number(retry.total) },
        };
      }
      return { ok: false, error: "تعذر حفظ الطلب — حاول مجددًا" };
    }

    const orderNumber = (created as { order_number: string }).order_number;
    await audit(null, "order.created", "orders", orderNumber, { total: calc.total });
    return { ok: true, data: { orderNumber, total: calc.total } };
  } catch {
    return { ok: false, error: "حدث خطأ غير متوقع — حاول لاحقًا" };
  }
}
