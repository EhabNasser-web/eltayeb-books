import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { requireAdmin } from "@/server/admin";
import { logoutAction } from "@/server/actions/auth";

export const metadata: Metadata = {
  title: "الإدارة | الطيب للكتب",
  robots: { index: false, follow: false },
};

// الإدارة دائمًا ديناميكية (جلسة + دور) — لا prerender أبدًا.
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "اللوحة" },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/categories", label: "الأقسام" },
  { href: "/admin/content", label: "المحتوى" },
  { href: "/admin/settings", label: "الإعدادات" },
  { href: "/admin/waitlist", label: "الانتظار" },
  { href: "/admin/audit", label: "السجل" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <Container className="pb-20 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <p className="font-display text-2xl text-ink">إدارة الطيب</p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted" dir="ltr">
            {admin.email}
          </span>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline underline-offset-4"
          >
            عرض الموقع
          </a>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-error underline underline-offset-4">
              خروج
            </button>
          </form>
        </div>
      </div>
      <nav aria-label="إدارة" className="mt-4 flex flex-wrap gap-2 print:hidden">
        {NAV.map((n) => (
          <a
            key={n.href}
            href={n.href}
            className="rounded-book border border-line px-3 py-1.5 text-base text-primary hover:border-primary"
          >
            {n.label}
          </a>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </Container>
  );
}
