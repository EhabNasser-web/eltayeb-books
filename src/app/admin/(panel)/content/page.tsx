import { ContentForm } from "@/components/ContentForm";
import { SectionHeading } from "@/components/SectionHeading";
import { listContentAdmin } from "@/server/admin-queries";

export default async function ContentPage() {
  const blocks = (await listContentAdmin()) as Array<Record<string, unknown>>;
  return (
    <div>
      <SectionHeading
        title="المحتوى"
        description="من نحن والسياسات والافتتاحية — تُنظَّف تلقائيًا من أي أكواد ضارة عند الحفظ."
      />
      <div className="mt-6 space-y-6">
        {blocks.map((b) => (
          <ContentForm
            key={b.key as string}
            blockKey={b.key as string}
            title={String(b.title ?? "")}
            body={String(b.body_html ?? "")}
          />
        ))}
      </div>
    </div>
  );
}
