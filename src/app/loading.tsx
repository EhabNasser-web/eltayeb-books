import { Container } from "@/components/Container";

/** حالة التحميل: هيكل عظمي بنفس مقاسات الصفحة (بدون مؤشرات عامة). */
export default function Loading() {
  return (
    <Container className="pb-24 pt-14" aria-busy="true" aria-label="جاري التحميل">
      <div className="max-w-2xl">
        <div className="h-16 w-16 animate-pulse rounded-book bg-line" />
        <div className="mt-8 h-6 w-32 animate-pulse rounded-book bg-line" />
        <div className="mt-2 h-14 w-3/4 animate-pulse rounded-book bg-line" />
        <div className="mt-4 h-8 w-1/2 animate-pulse rounded-book bg-line" />
        <div className="mt-8 h-px w-full bg-line" />
        <div className="mt-8 space-y-3">
          <div className="h-5 w-full animate-pulse rounded-book bg-line" />
          <div className="h-5 w-11/12 animate-pulse rounded-book bg-line" />
          <div className="h-5 w-2/3 animate-pulse rounded-book bg-line" />
        </div>
      </div>
    </Container>
  );
}
