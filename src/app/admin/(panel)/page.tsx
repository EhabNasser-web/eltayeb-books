import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ResendButton } from "@/components/ResendButton";
import { SectionHeading } from "@/components/SectionHeading";
import { getDashboardStats } from "@/server/admin-queries";

const STATUS_AR: Record<string, string> = {
  new: "جديد",
  confirmed: "مؤكد",
  paid: "مدفوع",
  shipped: "اتشحن",
  delivered: "اتسلّم",
  cancelled: "ملغي",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return (
    <div>
      <SectionHeading title="اللوحة الرئيسية" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-book border border-line p-5">
          <p className="text-ink-soft">طلبات اليوم</p>
          <p className="font-display text-4xl text-ink">{stats.today}</p>
        </div>
        <div className="rounded-book border border-line p-5">
          <p className="text-ink-soft">بانتظار التأكيد</p>
          <p className="font-display text-4xl text-ink">{stats.awaiting}</p>
          <Link
            href="/admin/orders?status=new"
            className="text-base text-primary underline underline-offset-4"
          >
            عرضها
          </Link>
        </div>
        <div className="rounded-book border border-line p-5">
          <p className="text-ink-soft">إشعارات معلقة (n8n)</p>
          <div className="mt-2">
            <ResendButton pending={stats.outboxPending} />
          </div>
        </div>
      </div>
      <h2 className="mt-10 font-display text-2xl text-ink">أحدث الطلبات</h2>
      {stats.recent.length === 0 ? (
        <p className="mt-3 text-ink-soft">لا توجد طلبات بعد.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {(stats.recent as Array<Record<string, unknown>>).map((o) => (
            <li
              key={o.id as string}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <Link
                href={`/admin/orders/${o.id}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
                dir="ltr"
              >
                {o.order_number as string}
              </Link>
              <span className="text-ink-soft">{o.customer_name as string}</span>
              <span className="text-ink">{String(o.total)} جنيه</span>
              <Badge tone={o.status === "new" ? "warning" : "neutral"}>
                {STATUS_AR[o.status as string] ?? (o.status as string)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
