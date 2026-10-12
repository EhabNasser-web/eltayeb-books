import type { Metadata } from "next";
import { BookCover } from "@/components/BookCover";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { LeafBullet, LeafDivider, SproutMark } from "@/components/Ornaments";
import { ProductCard } from "@/components/ProductCard";
import { Prose } from "@/components/Prose";
import { SectionHeading } from "@/components/SectionHeading";
import { SITE } from "@/lib/site";
import {
  getCategories,
  getContentBlock,
  getProductBySlug,
  getPublishedProducts,
} from "@/server/queries";

export const metadata: Metadata = {
  title: "الطيب للكتب | كتب قيّمة لحد باب بيتك",
  description: "كتب دينية وكتب تزكية النفس نختارها بعناية ونوصّلها لحد باب بيتك في كل محافظات مصر.",
};

// TODO(copy): صياغة الأقسام الثابتة مسودة وتحتاج مراجعة صاحب الموقع.
const WHY = [
  { title: "توصيل لباب البيت", body: "نشحن لكل محافظات مصر، والكتاب يوصلك لحد عندك." },
  { title: "استبدال لو فيه مشكلة", body: "عيب طباعة أو تلف شحن؟ تواصل معنا وهنستبدله لك." },
  { title: "كتب نثق فيها", body: "رف صغير مختار بعناية — مش كل حاجة، بس اللي نرشّحه بضمير." },
];

const STEPS = [
  "اختار الكتاب والمقاس المناسب لك.",
  "املا بياناتك: الاسم والموبايل والعنوان.",
  "راجع طلبك وأكّده.",
  "فريقنا يتواصل معك للتأكيد وإتمام الدفع.",
];

function coverFor(images: string[], title: string) {
  if (images[0]) {
    // صور Storage بروابط خارجية — img عادي مقصود (أبعاد غير معروفة مسبقًا).
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={images[0]} alt={`غلاف ${title}`} className="w-full rounded-book" loading="lazy" />
    );
  }
  return <BookCover title={title} />;
}

export default async function HomePage() {
  const [products, categories, heroTitle, heroSubtitle] = await Promise.all([
    getPublishedProducts(),
    getCategories(),
    getContentBlock("hero_title"),
    getContentBlock("hero_subtitle"),
  ]);

  const fresh = products.filter((p) => p.is_new);
  const featured = products.filter((p) => !p.is_new);
  const coming = categories.filter((c) => c.status === "coming_soon");
  const heroBook = fresh[0] ?? products[0];
  const heroProduct = heroBook ? await getProductBySlug(heroBook.slug) : null;

  return (
    <>
      {/* افتتاحية تحريرية: نص يمين وغلاف كبير شمال */}
      <Container className="pb-16 pt-12 md:pt-16">
        <div className="grid items-start gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <SproutMark className="h-14 w-14 text-primary" />
            <p className="mt-6 text-lg text-ink-soft">بسم الله نبدأ…</p>
            <h1 className="mt-2 font-display text-5xl leading-[1.6] text-ink md:text-6xl">
              {heroTitle?.body || SITE.tagline}
            </h1>
            <p className="mt-3 max-w-xl text-xl text-primary">
              {heroSubtitle?.body || "كتب قيّمة لحد باب بيتك"}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="#books" variant="primary">
                تصفّح الكتب
              </Button>
              <Button href={SITE.whatsappHref} external variant="secondary">
                اسألنا واتساب
              </Button>
            </div>
          </div>
          <div className="max-w-sm justify-self-start md:justify-self-end">
            {heroProduct ? (
              <a href={`/p/${heroProduct.slug}`} aria-label={heroProduct.title}>
                {coverFor(heroProduct.images, heroProduct.title)}
              </a>
            ) : (
              <BookCover title="الطيب للكتب" />
            )}
            {heroProduct && (
              <p className="mt-2 text-base text-ink-soft">
                من رفّنا:{" "}
                <a href={`/p/${heroProduct.slug}`} className="underline underline-offset-4">
                  {heroProduct.title}
                </a>
              </p>
            )}
          </div>
        </div>
      </Container>

      {/* وصل حديثًا */}
      <Container className="pb-16">
        <div id="books">
          <SectionHeading kicker="من رفّ الطيب" title="وصل حديثًا" />
        </div>
        {fresh.length === 0 && featured.length === 0 ? (
          <EmptyState
            title="الرف بيجهز"
            body="بنرصّ الكتب على الرف — ارجع قريبًا أو تابعنا على فيسبوك."
          />
        ) : (
          <div className="mt-6 grid grid-cols-2 items-start gap-x-5 gap-y-10 md:grid-cols-3">
            {[...fresh, ...featured].map((p) => (
              <ProductCard
                key={p.id}
                title={p.title}
                price={String(minPrice(p))}
                oldPrice={comparePrice(p) ?? undefined}
                stock={p.stock_status === "in_stock" ? "in_stock" : "out_of_stock"}
                href={`/p/${p.slug}`}
              />
            ))}
          </div>
        )}
        {fresh.length > 0 && featured.length > 0 && (
          <div className="mt-12">
            <SectionHeading title="كتب مختارة" />
            <div className="mt-6 grid grid-cols-2 items-start gap-x-5 gap-y-10 md:grid-cols-3">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  title={p.title}
                  price={String(minPrice(p))}
                  oldPrice={comparePrice(p) ?? undefined}
                  stock={p.stock_status === "in_stock" ? "in_stock" : "out_of_stock"}
                  href={`/p/${p.slug}`}
                />
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* ليه الطيب؟ — قائمة صادقة مش كروت */}
      <div className="border-y border-line bg-paper-deep">
        <Container className="py-14">
          <SectionHeading title="ليه الطيب؟" />
          <ul className="mt-6 max-w-2xl space-y-5">
            {WHY.map((w) => (
              <li key={w.title} className="flex items-start gap-3">
                <LeafBullet className="mt-2 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-display text-xl text-ink">{w.title}</p>
                  <p className="text-ink-soft">{w.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* خطوات الطلب */}
      <Container className="py-14">
        <SectionHeading kicker="من غير تعقيد" title="تطلب إزاي؟" />
        <ol className="mt-6 max-w-2xl space-y-4">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-start gap-4">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent font-display text-lg text-accent-deep"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <p className="pt-1 text-ink">{s}</p>
            </li>
          ))}
        </ol>
      </Container>

      {/* أقسام قريبًا */}
      {coming.length > 0 && (
        <Container className="pb-14">
          <LeafDivider className="mb-8" />
          <SectionHeading
            title="أقسام قريبًا"
            description="العطور والسبح وسجاجيد الصلاة في الطريق — سجّل موبايلك وهنبلغك أول ما تنزل."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            {coming.map((c) => (
              <Button key={c.slug} href={`/c/${c.slug}`} variant="secondary">
                {c.title} — قريبًا
              </Button>
            ))}
          </div>
        </Container>
      )}

      {/* دعوة أخيرة */}
      <Container className="pb-20">
        <div className="max-w-2xl">
          <p className="font-display text-3xl leading-[1.8] text-ink">
            الكتاب الجيد رفيق لا يملّ — ابدأ رحلتك النهاردة.
          </p>
          <div className="mt-5">
            <Button href="#books" variant="primary">
              شوف الكتب
            </Button>
          </div>
          <Prose className="mt-6 text-ink-soft">
            <p>لو محتار تختار إيه، ابعتلنا واتساب وهنرشّح لك اللي يناسبك بصدق.</p>
          </Prose>
        </div>
      </Container>
    </>
  );
}

function minPrice(p: { variants: Array<{ price: number; is_available: boolean }> }): number {
  const avail = p.variants.filter((v) => v.is_available && v.price > 0).map((v) => v.price);
  return avail.length > 0 ? Math.min(...avail) : 0;
}

function comparePrice(p: {
  variants: Array<{ price: number; compare_at_price: number | null; is_available: boolean }>;
}): string | null {
  const v = p.variants.find(
    (x) => x.is_available && x.compare_at_price && x.compare_at_price > x.price
  );
  return v?.compare_at_price ? String(v.compare_at_price) : null;
}
