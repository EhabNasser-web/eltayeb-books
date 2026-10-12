import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { getOrderAdmin } from "@/server/admin-queries";

export default async function OrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const found = await getOrderAdmin((await params).id);
  if (!found) notFound();
  const o = found.order as unknown as Record<string, unknown>;
  const items = found.items as Array<Record<string, unknown>>;

  return (
    <div className="max-w-2xl bg-paper p-8 text-ink">
      <h1 className="font-display text-3xl" dir="ltr">
        {o.order_number as string}
      </h1>
      <div className="mt-4 space-y-1 text-lg">
        <p>
          <strong>الاسم:</strong> {o.customer_name as string}
        </p>
        <p dir="ltr">
          <strong>موبايل:</strong> {o.customer_phone as string}
        </p>
        {(o.customer_phone2 as string) && (
          <p dir="ltr">
            <strong>إضافي:</strong> {o.customer_phone2 as string}
          </p>
        )}
        <p>
          <strong>العنوان:</strong> {o.governorate as string} — {o.address as string}
        </p>
        <p>
          <strong>الدفع:</strong> {(o.payment_method as string) === "cod" ? "عند الاستلام" : "مسبق"}{" "}
          ({(o.payment_status as string) === "paid" ? "مدفوع" : "غير مدفوع"})
        </p>
      </div>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {items.map((it) => (
          <li key={it.id as string} className="flex justify-between py-2">
            <span>
              {it.title as string} ({it.variant_title as string}) × {String(it.quantity)}
            </span>
            <span>{String(it.line_total)} جنيه</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xl font-bold">
        الإجمالي: {String(o.total)} جنيه (الشحن: {String(o.shipping_fee)})
      </p>
      <div className="mt-6">
        <PrintButton />
      </div>
    </div>
  );
}
