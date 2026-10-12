import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/CategoryForm";
import { SectionHeading } from "@/components/SectionHeading";
import { listCategoriesAdmin } from "@/server/admin-queries";

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = (await listCategoriesAdmin()) as Array<Record<string, unknown>>;
  const cat = categories.find((c) => c.id === id);
  if (!cat) notFound();
  return (
    <div>
      <SectionHeading title={`تعديل: ${cat.title}`} />
      <div className="mt-6">
        <CategoryForm
          categoryId={id}
          initial={{
            title: String(cat.title ?? ""),
            slug: String(cat.slug ?? ""),
            description: String(cat.description ?? ""),
            status: (cat.status as "active" | "coming_soon") ?? "active",
          }}
        />
      </div>
    </div>
  );
}
