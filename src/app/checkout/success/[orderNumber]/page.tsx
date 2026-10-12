import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Prose } from "@/components/Prose";
import { SectionHeading } from "@/components/SectionHeading";
import { getSetting } from "@/server/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تم استلام طلبك | الطيب للكتب",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const orderNumber = decodeURIComponent((await params).orderNumber);
  const team = await getSetting("team_name", "خدمة عملاء الطيب");
  const sla = await getSetting("contact_sla", "في أقرب وقت");

  return (
    <Container className="pb-20 pt-12">
      <div className="max-w-2xl">
        <p className="font-medium text-accent-deep">طلبك وصلنا</p>
        <h1 className="mt-1 font-display text-4xl text-ink md:text-5xl">استلمنا طلبك!</h1>
        <p className="mt-4 font-display text-3xl text-primary" dir="ltr">
          {orderNumber}
        </p>
        <Prose className="mt-4 text-ink-soft">
          <p>
            فريق {team} هيتواصل معاك {sla} لتأكيد الطلب وإتمام الدفع. احتفظ برقم الطلب لمتابعة أي
            استفسار.
          </p>
        </Prose>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="underline underline-offset-4 text-primary">
            العودة للرئيسية
          </Link>
        </div>
      </div>
      <div className="mt-10">
        <SectionHeading title="إيه اللي هيحصل بعد كده؟" />
        <Prose className="mt-3 text-ink-soft">
          <p>
            هنتصل بيك لتأكيد العنوان، ولو الدفع مسبق هنبعتلك بيانات التحويل. رسوم الشحن تُدفع عند
            الاستلام.
          </p>
        </Prose>
      </div>
    </Container>
  );
}
