import { SectionHeading } from "@/components/SectionHeading";
import { listAuditAdmin } from "@/server/admin-queries";

export default async function AuditPage() {
  const rows = (await listAuditAdmin()) as Array<Record<string, unknown>>;
  return (
    <div>
      <SectionHeading title="سجل التدقيق" description="كل تعديل في الداشبورد — قراءة فقط." />
      {rows.length === 0 ? (
        <p className="mt-4 text-ink-soft">لا توجد أحداث مسجلة.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {rows.map((r) => (
            <li
              key={r.id as string}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-base"
            >
              <span className="text-muted">
                {new Date(r.created_at as string).toLocaleString("ar-EG")}
              </span>
              <span className="font-mono text-sm" dir="ltr">
                {r.action as string}
              </span>
              <span className="text-ink-soft">
                {r.entity as string} {r.entity_id as string}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
