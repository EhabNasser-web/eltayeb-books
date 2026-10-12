import { SectionHeading } from "@/components/SectionHeading";
import { WaitlistTable } from "@/components/WaitlistTable";
import { listWaitlistAdmin } from "@/server/admin-queries";

export default async function WaitlistPage() {
  const entries = (await listWaitlistAdmin()) as Array<{
    id: string;
    contact: string;
    channel: string;
    status: string;
    created_at: string;
  }>;
  return (
    <div>
      <SectionHeading
        title="قائمة الانتظار"
        description="المسجلون للإبلاغ عند التوافر أو نزول الأقسام."
      />
      {entries.length === 0 ? (
        <p className="mt-4 text-ink-soft">لا توجد تسجيلات.</p>
      ) : (
        <WaitlistTable entries={entries} />
      )}
    </div>
  );
}
