import { Container } from "@/components/Container";
import { LeafDivider } from "@/components/Ornaments";
import { SproutMark } from "@/components/Ornaments";
import { Button } from "@/components/Button";
import { SITE } from "@/lib/site";

// TODO(copy): كل نصوص هذه الصفحة مسودة وتحتاج مراجعة صاحب الموقع قبل الإطلاق.
export default function HomePage() {
  return (
    <Container className="pb-24 pt-14 md:pt-20">
      <div className="max-w-2xl">
        <SproutMark className="h-16 w-16 text-primary" />
        <p className="mt-8 text-lg text-ink-soft">بسم الله نبدأ…</p>
        <h1 className="mt-2 font-display text-5xl leading-[1.6] text-ink md:text-6xl">
          الطيب للكتب
        </h1>
        <p className="mt-4 font-display text-2xl leading-[1.8] text-primary">{SITE.tagline}</p>
        <LeafDivider className="my-8" />
        <div className="prose-tayeb text-ink-soft">
          <p>
            الموقع لسه قيد التجهيز. بنجهّز لك رفًّا صغيرًا من الكتب اللي نثق فيها: المختصر في
            التفسير، والقرآن تدبيرًا وعملًا، وغيرها — وكل كتاب هنعرضه بصورته الحقيقية وسعره الواضح،
            من غير لفّ ولا وعود فاضية.
          </p>
          <p>لحد ما نخلّص، تلاقينا على فيسبوك — بنرد بنفسنا.</p>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href={SITE.facebook} external variant="primary">
            صفحة الفيسبوك
          </Button>
          <Button href={SITE.whatsappHref} external variant="secondary">
            واتساب {SITE.whatsappDisplay}
          </Button>
        </div>
      </div>
    </Container>
  );
}
