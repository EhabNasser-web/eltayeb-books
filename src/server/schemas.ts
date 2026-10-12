import { z } from "zod";
import { GOVERNORATES } from "@/lib/governorates";

const egyptianPhone = z.string().min(1, "الموبايل مطلوب").max(20, "رقم طويل غير معقول");

export const checkoutItemSchema = z.object({
  variantId: z.string().uuid("صنف غير صالح"),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "العربة فارغة").max(50),
  customerName: z.string().trim().min(3, "الاسم الكامل مطلوب").max(120),
  customerPhone: egyptianPhone,
  customerPhone2: z.string().trim().max(20).optional().default(""),
  governorate: z.enum(GOVERNORATES as unknown as [string, ...string[]], {
    error: "اختر المحافظة من القائمة",
  }),
  address: z.string().trim().min(10, "اكتب العنوان بالتفصيل").max(500),
  notes: z.string().trim().max(1000).optional().default(""),
  paymentMethod: z.enum(["cod", "prepaid"], { error: "طريقة دفع غير صالحة" }),
  idempotencyKey: z.string().uuid("مفتاح طلب غير صالح"),
  turnstileToken: z.string().min(1, "تحقق الحماية مطلوب"),
});

export const waitlistSchema = z.object({
  contact: z.string().trim().min(5, "اكتب موبايل أو إيميل صالح").max(120),
  channel: z.enum(["phone", "email"]),
  categoryId: z.string().uuid().nullish(),
  productId: z.string().uuid().nullish(),
  variantId: z.string().uuid().nullish(),
  turnstileToken: z.string().min(1, "تحقق الحماية مطلوب"),
});

export const adminLoginSchema = z.object({
  email: z.string().email("إيميل غير صالح").max(200),
  password: z.string().min(1, "كلمة السر مطلوبة").max(200),
  turnstileToken: z.string().min(1, "تحقق الحماية مطلوب"),
});

export const productSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "الslug حروف إنجليزية صغيرة وشرطات فقط"),
  description: z.string().trim().max(10000).default(""),
  categoryId: z.string().uuid().nullish(),
  price: z.number().min(0).max(1000000),
  stockStatus: z.enum(["in_stock", "out_of_stock"]),
  allowCod: z.boolean(),
  isNew: z.boolean(),
  isPublished: z.boolean(),
});

export const variantSchema = z.object({
  title: z.string().trim().min(1).max(100),
  dimensions: z.string().trim().max(50).default(""),
  price: z.number().min(0).max(1000000),
  compareAtPrice: z.number().min(0).max(1000000).nullish(),
  isAvailable: z.boolean(),
});

export const categorySchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "الslug حروف إنجليزية صغيرة وشرطات فقط"),
  description: z.string().trim().max(5000).default(""),
  status: z.enum(["active", "coming_soon"]),
});

export const orderUpdateSchema = z.object({
  status: z.enum(["new", "confirmed", "paid", "shipped", "delivered", "cancelled"]),
  paymentStatus: z.enum(["unpaid", "paid"]),
  internalNotes: z.string().trim().max(5000).default(""),
});
