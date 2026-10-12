import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getCategoryBySlug } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const cat = await getCategoryBySlug((await params).slug);
  if (!cat) return { title: "قسم غير موجود | الطيب للكتب" };
  return {
    title: `${cat.title} | الطيب للكتب`,
    description: cat.description.slice(0, 160),
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const cat = await getCategoryBySlug((await params).slug);
  if (!cat) notFound();

  if (cat.status === "coming_soon") {
    return (
      <Container className="pb-20 pt-12">
        <div className="max-w-2xl">
          <Badge tone="warning">قريبًا</Badge>
          <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">{cat.title}</h1>
          <p className="mt-3 text-xl text-ink-soft">{cat.description}</p>
          <div className="mt-8">
            <SectionHeading title="ابلغني أول ما ينزل" />
            <div className="mt-4">
              <WaitlistForm categoryId={cat.id} />
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="pb-20 pt-12">
      <SectionHeading title={cat.title} description={cat.description} />
      {cat.products.length === 0 ? (
        <p className="mt-6 text-ink-soft">لا توجد كتب منشورة في هذا القسم حاليًا.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 items-start gap-x-5 gap-y-10 md:grid-cols-3">
          {cat.products.map((p) => {
            const avail = p.variants.filter((v) => v.is_available && v.price > 0);
            const min = avail.length > 0 ? Math.min(...avail.map((v) => v.price)) : 0;
            const cmp = p.variants.find(
              (v) => v.is_available && v.compare_at_price && v.compare_at_price > v.price
            );
            return (
              <ProductCard
                key={p.id}
                title={p.title}
                price={String(min)}
                oldPrice={cmp?.compare_at_price ? String(cmp.compare_at_price) : undefined}
                stock={p.stock_status === "in_stock" ? "in_stock" : "out_of_stock"}
                href={`/p/${p.slug}`}
              />
            );
          })}
        </div>
      )}
    </Container>
  );
}
