"use server";

import { headers } from "next/headers";
import { normalizeEgyptianPhone } from "@/lib/phone";
import { waitlistSchema } from "../schemas";
import { verifyTurnstile } from "../turnstile";
import { rateLimit } from "../ratelimit";
import { createServiceClient } from "../supabase";

type Result = { ok: true } | { ok: false; error: string };

/** الانضمام لقائمة الانتظار + حدث waitlist.created في الصادر. */
export async function joinWaitlistAction(input: {
  contact: string;
  channel: "phone" | "email";
  categoryId?: string | null;
  productId?: string | null;
  variantId?: string | null;
  turnstileToken: string;
}): Promise<Result> {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!rateLimit(`waitlist:${ip}`, 10, 10 * 60_000)) {
      return { ok: false, error: "محاولات كثيرة — انتظر قليلًا" };
    }

    const parsed = waitlistSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
    }
    const data = parsed.data;
    if (!data.categoryId && !data.productId) {
      return { ok: false, error: "حدد القسم أو المنتج" };
    }

    let contact = data.contact.trim();
    if (data.channel === "phone") {
      contact = normalizeEgyptianPhone(contact);
      if (!/^01[0125][0-9]{8}$/.test(contact)) return { ok: false, error: "رقم الموبايل غير صالح" };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      return { ok: false, error: "الإيميل غير صالح" };
    }

    if (!(await verifyTurnstile(data.turnstileToken, ip))) {
      return { ok: false, error: "فشل تحقق الحماية — حدّث الصفحة وحاول مجددًا" };
    }

    const db = createServiceClient();
    const { data: row, error } = await db
      .from("waitlist")
      .insert({
        contact,
        channel: data.channel,
        category_id: data.categoryId ?? null,
        product_id: data.productId ?? null,
        variant_id: data.variantId ?? null,
      })
      .select("id")
      .single();
    if (error || !row) return { ok: false, error: "تعذر الحفظ — حاول مجددًا" };

    await db.from("outbox_events").insert({
      event: "waitlist.created",
      payload: {
        contact,
        channel: data.channel,
        category_id: data.categoryId ?? null,
        product_id: data.productId ?? null,
        variant_id: data.variantId ?? null,
      },
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "حدث خطأ غير متوقع — حاول لاحقًا" };
  }
}
