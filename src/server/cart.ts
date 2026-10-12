/*
 * حساب السلة على السيرفر — دالة نقية: العميل يرسل المعرفات والكميات فقط،
 * والأسعار والتوافر تُحقن من قاعدة البيانات. أي سعر من المتصفح يُتجاهل.
 */

export type CartInputItem = { variantId: string; quantity: number };

export type VariantInfo = {
  id: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  price: number;
  isAvailable: boolean;
  isPublished: boolean;
  productInStock: boolean;
  allowCod: boolean;
};

export type CartLine = {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type CartResult = {
  lines: CartLine[];
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  total: number;
  codAllowed: boolean;
  errors: string[];
};

export type DiscountApplication = { label: string; amount: number };

/**
 * مكان جاهز لخصومات المرحلة 2 (product_relations) — تُنفَّذ لاحقًا.
 * العقد: تُرجع إجمالي الخصم والبنود المطبقة، وتُحسب على السيرفر فقط.
 */
export function applyDiscounts(
  subtotal: number,
  lines: CartLine[]
): { discountTotal: number; applied: DiscountApplication[] } {
  void subtotal;
  void lines;
  return { discountTotal: 0, applied: [] };
}

export function calculateCart(
  items: CartInputItem[],
  variants: Map<string, VariantInfo>,
  shippingFee: number
): CartResult {
  const errors: string[] = [];
  const lines: CartLine[] = [];

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      errors.push(`كمية غير صالحة للصنف المطلوب.`);
      continue;
    }
    const v = variants.get(item.variantId);
    if (!v) {
      errors.push(`صنف غير معروف في السلة.`);
      continue;
    }
    if (!v.isPublished || !v.productInStock || !v.isAvailable) {
      errors.push(`«${v.productTitle} (${v.variantTitle})» غير متاح حاليًا.`);
      continue;
    }
    lines.push({
      variantId: v.id,
      productTitle: v.productTitle,
      variantTitle: v.variantTitle,
      unitPrice: v.price,
      quantity: item.quantity,
      lineTotal: v.price * item.quantity,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const { discountTotal } = applyDiscounts(subtotal, lines);
  const shipping = lines.length === 0 ? 0 : Math.max(0, shippingFee);
  const total = Math.max(0, subtotal - discountTotal) + shipping;
  const codAllowed = lines.length > 0 && lines.every((l) => variants.get(l.variantId)?.allowCod);

  return { lines, subtotal, discountTotal, shippingFee: shipping, total, codAllowed, errors };
}
