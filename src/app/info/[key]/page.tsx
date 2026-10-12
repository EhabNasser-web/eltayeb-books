import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Prose } from "@/components/Prose";
import { SectionHeading } from "@/components/SectionHeading";
import { getContentBlock } from "@/server/queries";

export const dynamic = "force-dynamic";

const KEYS: Record<string, string> = {
  about: "about",
  "return-policy": "return_policy",
  "shipping-payment": "shipping_payment",
  privacy: "privacy",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const block = await getContentBlock(KEYS[(await params).key] ?? "");
  return { title: block ? `${block.title} | الطيب للكتب` : "صفحة غير موجودة | الطيب للكتب" };
}

export default async function InfoPage({ params }: { params: Promise<{ key: string }> }) {
  const dbKey = KEYS[(await params).key];
  if (!dbKey) notFound();
  const block = await getContentBlock(dbKey);
  if (!block) notFound();

  return (
    <Container className="pb-20 pt-12">
      <div className="max-w-2xl">
        <SectionHeading title={block.title} />
        <Prose className="mt-6">
          <div dangerouslySetInnerHTML={{ __html: block.body }} />
        </Prose>
      </div>
    </Container>
  );
}
