import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Badge } from "@/components/Badge";
import { BookCover } from "@/components/BookCover";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Input, Select, Textarea } from "@/components/Field";
import { LeafDivider } from "@/components/Ornaments";
import { ProductCard } from "@/components/ProductCard";
import { Prose } from "@/components/Prose";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata = {
  title: "دليل الهوية | الطيب للكتب",
  robots: { index: false, follow: false },
};

// تُقيَّم البوابة عند الطلب (لا وقت البناء) ليعمل ALLOW_STYLEGUIDE على السيرفر المنشور.
export const dynamic = "force-dynamic";

const SWATCHES: Array<{ name: string; hex: string; text: string }> = [
  { name: "paper — الخلفية", hex: "#efe8d9", text: "#22302a" },
  { name: "paper-deep — خلفية بديلة", hex: "#e4d5b4", text: "#22302a" },
  { name: "ink — النص", hex: "#22302a", text: "#efe8d9" },
  { name: "primary — الزيتوني", hex: "#3a5246", text: "#efe8d9" },
  { name: "primary-dark — hover", hex: "#2f4439", text: "#efe8d9" },
  { name: "primary-deep — الفوتر", hex: "#24352c", text: "#efe8d9" },
  { name: "accent — الذهبي (تفاصيل فقط)", hex: "#b69c5c", text: "#22302a" },
  { name: "accent-deep — نص ذهبي", hex: "#7c622f", text: "#efe8d9" },
  { name: "line — الفواصل", hex: "#d5c69e", text: "#22302a" },
  { name: "muted — نص ثانوي", hex: "#67634f", text: "#efe8d9" },
  { name: "success", hex: "#336e3d", text: "#efe8d9" },
  { name: "error", hex: "#a23325", text: "#efe8d9" },
  { name: "warning", hex: "#8a5c10", text: "#efe8d9" },
];

const COMPARE = "العلمُ نورٌ يهدي صاحبَه إلى الخير";

function GuideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <LeafDivider className="my-4 max-w-md" />
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_STYLEGUIDE !== "1") {
    notFound();
  }

  return (
    <Container className="pb-24 pt-10">
      <p className="font-medium text-accent-deep">دليل الهوية — يظهر في التطوير فقط</p>
      <h1 className="mt-1 font-display text-4xl text-ink md:text-5xl">مكونات الطيب للكتب</h1>

      <GuideSection title="الألوان">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {SWATCHES.map((s) => (
            <div key={s.hex} className="overflow-hidden rounded-book border border-line">
              <div className="h-16" style={{ backgroundColor: s.hex }} />
              <div className="bg-paper px-3 py-2">
                <p className="text-base font-medium text-ink">{s.name}</p>
                <p className="text-base text-ink-soft" dir="ltr">
                  {s.hex}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GuideSection>

      <GuideSection title="مقارنة خطوط العناوين (الفائز: Aref Ruqaa)">
        <p className="font-amiri text-3xl text-ink">أميري — {COMPARE}</p>
        <p className="font-ruqaa text-3xl text-ink">رقعة (المُختار) — {COMPARE}</p>
        <p className="font-kufi text-3xl text-ink">كوفي — {COMPARE}</p>
        <p className="text-base text-ink-soft">
          أميري نسخي هادئ لكنه محايد، والكوفي هندسي بارد لا يشبه روح اللوجو. الرقعة فيه شخصية خط
          اليد العربي وقريب من رسم كلمة «الطيب» في اللوجو — لذلك هو خط العناوين.
        </p>
      </GuideSection>

      <GuideSection title="الأزرار">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">اطلب الآن</Button>
          <Button variant="secondary">تصفّح الكتب</Button>
          <Button variant="text">اقرأ المزيد</Button>
          <Button variant="primary" size="sm">
            صغير
          </Button>
          <Button variant="primary" disabled>
            معطّل
          </Button>
        </div>
      </GuideSection>

      <GuideSection title="الحقول">
        <div className="grid max-w-2xl gap-5">
          <Input label="الاسم الكامل" placeholder="مثال: عبد الله محمد" />
          <Input label="الموبايل" hint="رقم مصري يبدأ بـ 01" dir="ltr" />
          <Input label="العنوان" error="العنوان مطلوب لاستكمال الطلب" />
          <Select label="المحافظة" defaultValue="">
            <option value="" disabled>
              اختر المحافظة
            </option>
            <option value="cairo">القاهرة</option>
            <option value="giza">الجيزة</option>
          </Select>
          <Textarea label="ملاحظات" placeholder="أي تفاصيل تساعد المندوب" />
        </div>
      </GuideSection>

      <GuideSection title="الشارات">
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">متوفر</Badge>
          <Badge tone="error">غير متوفر حاليًا</Badge>
          <Badge tone="warning">قريبًا</Badge>
          <Badge tone="neutral">معلومة</Badge>
        </div>
      </GuideSection>

      <GuideSection title="عنوان قسم وفاصل">
        <SectionHeading
          kicker="من رفّ الطيب"
          title="وصل حديثًا"
          description="كتب اخترناها لك بعناية — كل كتاب بصورته الحقيقية وسعره الواضح."
        />
        <LeafDivider />
      </GuideSection>

      <GuideSection title="الغلاف وبطاقة المنتج">
        <div className="flex flex-wrap items-start gap-8">
          <div className="w-44">
            <BookCover title="المختصر في التفسير" />
          </div>
          <ProductCard title="المختصر في التفسير" price="260" oldPrice="275" stock="in_stock" />
          <ProductCard title="القرآن تدبر وعمل" price="400" stock="out_of_stock" />
        </div>
      </GuideSection>

      <GuideSection title="شريط الإعلان والنصوص">
        <AnnouncementBar />
        <Prose>
          <p>
            هذه فقرة تجريبية بخط النص: الحمد لله الذي علّم بالقلم. القراءة عادة صغيرة تصنع فرقًا
            كبيرًا مع الوقت، والكتاب الجيد رفيق لا يملّ.
          </p>
          <p>السطر هنا لا يزيد عن خمسة وستين حرفًا تقريبًا ليبقى مريحًا للعين.</p>
        </Prose>
      </GuideSection>
    </Container>
  );
}
