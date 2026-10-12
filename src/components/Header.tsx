import Image from "next/image";
import Link from "next/link";
import { AnnouncementBar } from "./AnnouncementBar";
import { Container } from "./Container";
import { SITE } from "@/lib/site";

export function Header() {
  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-10 border-b border-line bg-paper">
        <Container className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-2.5" aria-label={SITE.name}>
            {/* اللوجو الحقيقي — TODO(brand): نسخة SVG أخف عندما تتوفر */}
            <Image
              src="/brand/logo.png"
              alt=""
              width={897}
              height={865}
              className="h-10 w-auto"
              priority
            />
            <span className="font-display text-2xl leading-snug text-ink">{SITE.name}</span>
          </Link>
          <nav className="flex items-center gap-4" aria-label="التنقل الرئيسي">
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-medium text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-primary-deep"
            >
              فيسبوك
            </a>
            <span
              role="status"
              title="العربة ستُفعَّل مع إطلاق المتجر في المرحلة 1"
              className="cursor-not-allowed text-base text-muted"
            >
              العربة (قريبًا)
            </span>
          </nav>
        </Container>
      </header>
    </>
  );
}
