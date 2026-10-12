import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { OrderForm } from "@/components/OrderForm";
import { SectionHeading } from "@/components/SectionHeading";
import { getOrderAdmin } from "@/server/admin-queries";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const found = await getOrderAdmin((await params).id);
  if (!found) notFound();
  const o = found.order as unknown as Record<string, unknown>;
  const items = found.items as Array<Record<string, unknown>>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading title={`طلب ${o.order_number}`} />
        <Button href={`/admin/orders/${o.id}/print`} variant="secondary" size="sm">
          ملخص الشحن للطباعة
        </Button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-book border border-line p-5">
          <h2 className="font-display text-xl text-ink">العميل</h2>
          <p className="mt-2 text-ink">{o.customer_name as string}</p>
          <p className="text-ink" dir="ltr">
            {o.customer_phone as string}
          </p>
          {(o.customer_phone2 as string) && (
            <p className="text-ink-soft" dir="ltr">
              {o.customer_phone2 as string}
            </p>
          )}
          <p className="mt-2 text-ink">
            {o.governorate as string} — {o.address as string}
          </p>
          {(o.notes as string) && (
            <p className="mt-2 text-ink-soft">ملاحظات العميل: {o.notes as string}</p>
          )}
        </div>
        <div className="rounded-book border border-line p-5">
          <h2 className="font-display text-xl text-ink">الدفع</h2>
          <p className="mt-2 text-ink">
            الطريقة: {(o.payment_method as string) === "cod" ? "عند الاستلام" : "مسبق"}
          </p>
          <p className="mt-1">
            <Badge tone={o.payment_status === "paid" ? "success" : "warning"}>
              {(o.payment_status as string) === "paid" ? "مدفوع" : "غير مدفوع"}
            </Badge>
          </p>
          <p className="mt-2 text-ink">
            الفرعي: {String(o.subtotal)} + الشحن: {String(o.shipping_fee)}
          </p>
          <p className="text-xl font-bold text-ink">الإجمالي: {String(o.total)} جنيه</p>
        </div>
      </div>

      <h2 className="mt-8 font-display text-xl text-ink">الأصناف (لقطة وقت الطلب)</h2>
      <ul className="mt-2 divide-y divide-line border-y border-line">
        {items.map((it) => (
          <li key={it.id as string} className="flex justify-between gap-4 py-2">
            <span className="text-ink">
              {it.title as string} ({it.variant_title as string}) × {String(it.quantity)}
            </span>
            <span className="text-ink">{String(it.line_total)} جنيه</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-display text-xl text-ink">تحديث الطلب</h2>
      <div className="mt-3">
        <OrderForm
          orderId={o.id as string}
          initial={{
            status: String(o.status),
            paymentStatus: String(o.payment_status),
            internalNotes: String(o.internal_notes ?? ""),
          }}
        />
      </div>
    </div>
  );
}
