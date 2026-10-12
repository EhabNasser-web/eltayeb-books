import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { listProductsAdmin } from "@/server/admin-queries";

export default async function ProductsPage() {
  const products = await listProductsAdmin();
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <SectionHeading title="المنتجات" />
        <Button href="/admin/products/new" variant="primary" size="sm">
          منتج جديد
        </Button>
      </div>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {products.map((p) => {
          const prod = p as unknown as {
            id: string;
            title: string;
            is_published: boolean;
            stock_status: string;
            category: { title: string } | null;
          };
          return (
            <li key={prod.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <Link
                href={`/admin/products/${prod.id}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {prod.title}
              </Link>
              <span className="flex items-center gap-2">
                <span className="text-sm text-ink-soft">{prod.category?.title ?? "بدون قسم"}</span>
                <Badge tone={prod.is_published ? "success" : "neutral"}>
                  {prod.is_published ? "منشور" : "مخفي"}
                </Badge>
                {prod.stock_status === "out_of_stock" && <Badge tone="error">غير متوفر</Badge>}
              </span>
            </li>
          );
        })}
      </ul>
      {products.length === 0 && <p className="mt-4 text-ink-soft">لا توجد منتجات.</p>}
    </div>
  );
}
