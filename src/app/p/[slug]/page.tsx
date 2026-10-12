import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { BookCover } from "@/components/BookCover";
import { Container } from "@/components/Container";
import { ProductBuyer } from "@/components/ProductBuyer";
import { Prose } from "@/components/Prose";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getProductBySlug } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return { title: "كتاب غير موجود | الطيب للكتب" };
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    title: `${p.title} | الطيب للكتب`,
    description: p.description.slice(0, 160),
    openGraph: {
      title: p.title,
      description: p.description.slice(0, 160),
      type: "website",
      images: p.images[0] ? [{ url: p.images[0] }] : [{ url: `${base}/brand/og.svg` }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const purchasable =
    product.stock_status === "in_stock" &&
    product.variants.some((v) => v.is_available && v.price > 0);

  return (
    <Container className="pb-20 pt-12">
      <div className="grid items-start gap-10 md:grid-cols-[1fr_1.2fr]">
        <div className="max-w-sm">
          {product.images[0] ? (
            // صور Storage بروابط خارجية — img عادي مقصود.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={`غلاف ${product.title}`}
              className="w-full rounded-book"
            />
          ) : (
            <BookCover title={product.title} />
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.is_new && <Badge tone="warning">وصل حديثًا</Badge>}
            {purchasable ? (
              <Badge tone="success">متوفر</Badge>
            ) : (
              <Badge tone="error">غير متوفر حاليًا</Badge>
            )}
          </div>
          <h1 className="mt-3 font-display text-4xl leading-[1.6] text-ink md:text-5xl">
            {product.title}
          </h1>
          <Prose className="mt-4 text-ink-soft">
            {product.description.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </Prose>
          <div className="mt-8">
            {purchasable ? (
              <ProductBuyer product={product} />
            ) : (
              <div>
                <p className="text-lg text-ink">
                  المقاسات المتاحة نفدت حاليًا — سجّل بياناتك وهنبلغك أول ما يتوفر.
                </p>
                <div className="mt-4">
                  <WaitlistForm productId={product.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
