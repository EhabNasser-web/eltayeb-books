"use client";

import { useState } from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useCart, type CartSnapshot } from "./CartProvider";
import { cn } from "@/lib/cn";
import type { ProductWithExtras } from "@/server/queries";

/** اختيار المقاس والإضافة للعربة في صفحة المنتج. */
export function ProductBuyer({ product }: { product: ProductWithExtras }) {
  const { add } = useCart();
  const available = product.variants.filter((v) => v.is_available && v.price > 0);
  const [variantId, setVariantId] = useState(available[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const current = product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  const purchasable =
    product.is_published && product.stock_status === "in_stock" && available.length > 0;

  if (!purchasable) return null;

  const snapshot: CartSnapshot = {
    variantId: current.id,
    productId: product.id,
    productTitle: product.title,
    productSlug: product.slug,
    variantTitle: current.title,
    price: current.price,
    image: product.images[0],
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-medium text-ink">المقاس</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="المقاس">
          {product.variants.map((v) => {
            const disabled = !v.is_available || v.price <= 0;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={v.id === variantId}
                disabled={disabled}
                onClick={() => {
                  setVariantId(v.id);
                  setAdded(false);
                }}
                className={cn(
                  "rounded-book border px-4 py-2 text-base transition-colors duration-200",
                  v.id === variantId
                    ? "border-primary bg-primary text-paper"
                    : "border-line bg-paper text-ink hover:border-primary",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {v.title}
                {v.dimensions ? ` (${v.dimensions})` : ""}
                {disabled ? " — غير متاح" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-end gap-3">
        <p className="text-2xl font-bold text-ink">
          {current.price} <span className="text-base font-normal text-ink-soft">جنيه</span>
        </p>
        {current.compare_at_price && current.compare_at_price > current.price && (
          <>
            <p className="text-lg text-muted line-through">{current.compare_at_price} جنيه</p>
            <Badge tone="success">خصم حقيقي</Badge>
          </>
        )}
      </div>

      {product.allow_cod ? (
        <p className="text-base text-ink-soft">الدفع عند الاستلام متاح لهذا الكتاب.</p>
      ) : (
        <p className="text-base text-ink-soft">
          هذا الكتاب دفع مسبق فقط — نتواصل معك بعد الطلب لإتمام التحويل.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="text-base text-ink-soft">الكمية</span>
          <select
            value={quantity}
            onChange={(e) => {
              setQuantity(Number(e.target.value));
              setAdded(false);
            }}
            className="rounded-book border border-line bg-paper px-3 py-2"
            aria-label="الكمية"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="primary"
          onClick={() => {
            add(snapshot, quantity);
            setAdded(true);
          }}
        >
          أضف للعربة
        </Button>
        {added && (
          <span className="text-base font-medium text-success" role="status">
            أُضيف للعربة —{" "}
            <a href="/cart" className="underline underline-offset-4">
              عرض العربة
            </a>
          </span>
        )}
      </div>
    </div>
  );
}
