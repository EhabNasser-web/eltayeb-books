import { notFound } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { SectionHeading } from "@/components/SectionHeading";
import { getProductAdmin, listCategoriesAdmin } from "@/server/admin-queries";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") {
    const categories = await listCategoriesAdmin();
    return (
      <div>
        <SectionHeading title="منتج جديد" />
        <div className="mt-6">
          <ProductForm
            initial={{
              title: "",
              slug: "",
              description: "",
              categoryId: "",
              price: "",
              stockStatus: "in_stock",
              allowCod: true,
              isNew: false,
              isPublished: false,
              images: [],
            }}
            categories={(categories as Array<{ id: string; title: string }>).map((c) => ({
              id: c.id,
              title: c.title,
            }))}
            initialVariants={[]}
          />
        </div>
      </div>
    );
  }
  const found = await getProductAdmin(id);
  if (!found) notFound();
  const p = found.product as unknown as Record<string, unknown>;
  return (
    <div>
      <SectionHeading title={`تعديل: ${p.title}`} />
      <div className="mt-6">
        <ProductForm
          productId={id}
          initial={{
            title: String(p.title ?? ""),
            slug: String(p.slug ?? ""),
            description: String(p.description ?? ""),
            categoryId: (p.category_id as string) ?? "",
            price: String(p.price ?? ""),
            stockStatus: (p.stock_status as "in_stock" | "out_of_stock") ?? "in_stock",
            allowCod: Boolean(p.allow_cod),
            isNew: Boolean(p.is_new),
            isPublished: Boolean(p.is_published),
            images: (p.images as string[]) ?? [],
          }}
          categories={(found.categories as Array<{ id: string; title: string }>).map((c) => ({
            id: c.id,
            title: c.title,
          }))}
          initialVariants={(
            found.variants as Array<{
              title: string;
              dimensions: string;
              price: number;
              compare_at_price: number | null;
              is_available: boolean;
            }>
          ).map((v) => ({
            title: v.title,
            dimensions: v.dimensions ?? "",
            price: String(v.price),
            compareAtPrice: v.compare_at_price != null ? String(v.compare_at_price) : "",
            isAvailable: v.is_available,
          }))}
        />
      </div>
    </div>
  );
}
