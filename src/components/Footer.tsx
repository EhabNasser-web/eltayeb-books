import { Container } from "./Container";
import { LeafDivider } from "./Ornaments";
import { SITE } from "@/lib/site";

const links = [
  { label: "فيسبوك", href: SITE.facebook },
  { label: "انستجرام", href: SITE.instagram },
  { label: "تيك توك", href: SITE.tiktok },
  { label: "واتساب", href: SITE.whatsappHref },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-primary-deep text-paper">
      <Container className="py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-md">
            <p className="font-display text-2xl">{SITE.name}</p>
            {/* TODO(copy): نبذة صادقة بصوت صاحب الموقع — تُكتب مع محتوى المرحلة 1. */}
            <p className="mt-2 text-paper/80">
              مكتبة صغيرة بتحب الكتب النافعة وتوصّلها لحد باب بيتك.
            </p>
          </div>
          <nav aria-label="تواصل معنا">
            <p className="font-medium text-accent">تلاقينا هنا</p>
            <ul className="mt-2 space-y-1">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-paper/90 underline-offset-4 hover:underline"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <LeafDivider className="my-8 opacity-60" />
        <p className="text-base text-paper/70">
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </Container>
    </footer>
  );
}
