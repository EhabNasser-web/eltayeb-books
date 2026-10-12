import Link from "next/link";
import { Badge } from "@/components/Badge";
import { SectionHeading } from "@/components/SectionHeading";
import { listOrdersAdmin } from "@/server/admin-queries";

const STATUS_AR: Record<string, string> = {
  new: "جديد",
  confirmed: "مؤكد",
  paid: "مدفوع",
  shipped: "اتشحن",
  delivered: "اتسلّم",
  cancelled: "ملغي",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const orders = (await listOrdersAdmin({
    status: sp.status || undefined,
    q: sp.q || undefined,
  })) as Array<Record<string, unknown>>;
  return (
    <div>
      <SectionHeading title="الطلبات" />
      <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-ink">
          <span className="text-base text-ink-soft">الحالة</span>
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="rounded-book border border-line bg-paper px-3 py-2"
          >
            <option value="">الكل</option>
            {Object.entries(STATUS_AR).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-ink">
          <span className="text-base text-ink-soft">بحث برقم الطلب أو الموبايل</span>
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            className="rounded-book border border-line bg-paper px-3 py-2"
            dir="ltr"
          />
        </label>
        <button type="submit" className="rounded-book bg-primary px-4 py-2 text-paper">
          بحث
        </button>
      </form>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {orders.map((o) => (
          <li key={o.id as string} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
            <Link
              href={`/admin/orders/${o.id}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
              dir="ltr"
            >
              {o.order_number as string}
            </Link>
            <span className="text-ink">{o.customer_name as string}</span>
            <span className="text-sm text-ink-soft" dir="ltr">
              {o.customer_phone as string}
            </span>
            <span className="text-ink">{String(o.total)} جنيه</span>
            <Badge
              tone={o.status === "new" ? "warning" : o.status === "cancelled" ? "error" : "neutral"}
            >
              {STATUS_AR[o.status as string] ?? String(o.status)}
            </Badge>
            <Badge tone={o.payment_status === "paid" ? "success" : "neutral"}>
              {o.payment_status === "paid" ? "مدفوع" : "غير مدفوع"}
            </Badge>
          </li>
        ))}
      </ul>
      {orders.length === 0 && <p className="mt-4 text-ink-soft">لا توجد طلبات مطابقة.</p>}
    </div>
  );
}
