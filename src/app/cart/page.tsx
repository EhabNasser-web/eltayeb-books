"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeading } from "@/components/SectionHeading";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const { lines, estimate, setQuantity, remove } = useCart();

  if (lines.length === 0) {
    return (
      <Container className="pb-20 pt-12">
        <SectionHeading title="العربة" />
        <div className="mt-6">
          <EmptyState title="العربة فاضية" body="لسه مخترتش كتب — تصفّح الرف واختار اللي يعجبك." />
          <div className="mt-6">
            <Button href="/#books" variant="primary">
              تصفّح الكتب
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="pb-20 pt-12">
      <SectionHeading
        title="العربة"
        description="الحساب النهائي بيتحسب على السيرفر عند تأكيد الطلب."
      />
      <ul className="mt-8 max-w-2xl divide-y divide-line border-y border-line">
        {lines.map((l) => (
          <li key={l.variantId} className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="font-medium text-ink">
                <Link href={`/p/${l.productSlug}`} className="underline-offset-4 hover:underline">
                  {l.productTitle}
                </Link>
              </p>
              <p className="text-base text-ink-soft">{l.variantTitle}</p>
              <p className="mt-1 text-base text-ink">
                {l.price} جنيه × {l.quantity} = {l.price * l.quantity} جنيه
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <select
                value={l.quantity}
                onChange={(e) => setQuantity(l.variantId, Number(e.target.value))}
                className="rounded-book border border-line bg-paper px-2 py-1"
                aria-label={`كمية ${l.productTitle}`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <Button variant="text" size="sm" onClick={() => remove(l.variantId)}>
                حذف
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex max-w-2xl items-center justify-between">
        <p className="text-xl font-bold text-ink">
          الإجمالي التقديري: {estimate} جنيه{" "}
          <span className="text-base font-normal text-ink-soft">(+ الشحن)</span>
        </p>
        <Button href="/checkout" variant="primary">
          إتمام الطلب
        </Button>
      </div>
    </Container>
  );
}
