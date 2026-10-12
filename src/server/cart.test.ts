import { describe, expect, it } from "vitest";
import { calculateCart, type VariantInfo } from "./cart";

function v(over: Partial<VariantInfo> = {}): VariantInfo {
  return {
    id: "v1",
    productId: "p1",
    productTitle: "المختصر في التفسير",
    variantTitle: "الربع",
    price: 260,
    isAvailable: true,
    isPublished: true,
    productInStock: true,
    allowCod: true,
    ...over,
  };
}

describe("calculateCart", () => {
  it("يحسب المجموع مع الشحن للكميات", () => {
    const map = new Map([["v1", v()]]);
    const r = calculateCart([{ variantId: "v1", quantity: 2 }], map, 65);
    expect(r.errors).toEqual([]);
    expect(r.subtotal).toBe(520);
    expect(r.shippingFee).toBe(65);
    expect(r.total).toBe(585);
    expect(r.codAllowed).toBe(true);
  });

  it("يتجاهل سعر العميل ويستخدم سعر القاعدة", () => {
    const map = new Map([["v1", v({ price: 260 })]]);
    // العميل لا يرسل سعرًا أصلًا — حتى لو عدّل الكمية فقط يُحسب من القاعدة
    const r = calculateCart([{ variantId: "v1", quantity: 1 }], map, 0);
    expect(r.lines[0].unitPrice).toBe(260);
  });

  it("يرفض المنتج غير المنشور وغير المتاح", () => {
    const map = new Map([
      ["v1", v({ id: "v1", isPublished: false })],
      ["v2", v({ id: "v2", isAvailable: false, productTitle: "كتاب", variantTitle: "النص" })],
    ]);
    const r = calculateCart(
      [
        { variantId: "v1", quantity: 1 },
        { variantId: "v2", quantity: 1 },
      ],
      map,
      0
    );
    expect(r.lines).toEqual([]);
    expect(r.errors).toHaveLength(2);
    expect(r.total).toBe(0);
  });

  it("يرفض الصنف المجهول والكمية الصفرية", () => {
    const r = calculateCart(
      [
        { variantId: "nope", quantity: 1 },
        { variantId: "v1", quantity: 0 },
      ],
      new Map([["v1", v()]]),
      0
    );
    expect(r.lines).toEqual([]);
    expect(r.errors).toHaveLength(2);
  });

  it("عربة فاضية: بلا شحن وبلا دفع عند الاستلام", () => {
    const r = calculateCart([], new Map(), 65);
    expect(r.total).toBe(0);
    expect(r.shippingFee).toBe(0);
    expect(r.codAllowed).toBe(false);
  });

  it("منتج لا يدعم COD يمنع الدفع عند الاستلام عن الكل", () => {
    const map = new Map([
      ["v1", v({ id: "v1" })],
      ["v2", v({ id: "v2", allowCod: false })],
    ]);
    const r = calculateCart(
      [
        { variantId: "v1", quantity: 1 },
        { variantId: "v2", quantity: 1 },
      ],
      map,
      0
    );
    expect(r.codAllowed).toBe(false);
    expect(r.total).toBe(520);
  });
});
