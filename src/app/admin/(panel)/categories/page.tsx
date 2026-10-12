import Link from "next/link";
import { Badge } from "@/components/Badge";
import { CategoryForm } from "@/components/CategoryForm";
import { SectionHeading } from "@/components/SectionHeading";
import { listCategoriesAdmin } from "@/server/admin-queries";

export default async function CategoriesPage() {
  const categories = await listCategoriesAdmin();
  return (
    <div>
      <SectionHeading title="الأقسام" />
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {(categories as Array<Record<string, unknown>>).map((c) => (
          <li key={c.id as string} className="flex items-center justify-between gap-2 py-3">
            <Link
              href={`/admin/categories/${c.id}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {c.title as string}
            </Link>
            <Badge tone={c.status === "active" ? "success" : "warning"}>
              {c.status === "active" ? "نشط" : "قريبًا"}
            </Badge>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-display text-2xl text-ink">قسم جديد</h2>
      <div className="mt-4">
        <CategoryForm initial={{ title: "", slug: "", description: "", status: "active" }} />
      </div>
    </div>
  );
}
