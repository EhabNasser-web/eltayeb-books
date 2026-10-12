import { Button } from "@/components/Button";
import { Container } from "@/components/Container";

/** صفحة 404 بنبرة الموقع. */
export default function NotFound() {
  return (
    <Container className="pb-24 pt-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl text-ink">الصفحة دي مش على الرف</h1>
        <p className="mt-3 text-ink-soft">
          الرابط اللي دخلت عليه غير موجود — ارجع للرئيسية وكمّل تصفحك.
        </p>
        <div className="mt-6">
          <Button variant="primary" href="/">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    </Container>
  );
}
