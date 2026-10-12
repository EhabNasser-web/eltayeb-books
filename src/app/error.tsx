"use client";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";

/** حد خطأ — رسالة عامة للمستخدم، والتفاصيل في اللوج فقط. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  return (
    <Container className="pb-24 pt-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl text-ink">حصل عطل غير متوقع</h1>
        <p className="mt-3 text-ink-soft">
          جرّب تحديث الصفحة، ولو المشكلة استمرت تواصل معنا على فيسبوك وسنساعدك.
        </p>
        <div className="mt-6">
          <Button variant="primary" onClick={reset}>
            حاول مرة أخرى
          </Button>
        </div>
      </div>
    </Container>
  );
}
