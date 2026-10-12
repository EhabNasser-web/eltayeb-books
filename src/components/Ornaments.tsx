import { cn } from "@/lib/cn";

/*
 * زخارف SVG أصلية مستوحاة من عناصر اللوجو (النبتة والكتاب المفتوح).
 * تُستخدم بحساب: فواصل أقسام ونقاط عناوين فقط.
 */

/** علامة النبتة فوق الكتاب — للشعار والأماكن المميزة. */
export function SproutMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {/* الكتاب المفتوح */}
      <path
        d="M8 46c7-3.5 14-3.5 21 0 1.6.8 4.4.8 6 0 7-3.5 14-3.5 21 0"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* الساق */}
      <path d="M32 44V22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* الورقة اليسرى */}
      <path d="M30 26C22 26 16 21 15 13c8 0 14 5 15 13Z" fill="currentColor" />
      {/* الورقة اليمنى — ذهبية دائمًا */}
      <path d="M34 22c1-8 7-13 15-13-1 8-7 13-15 13Z" fill="var(--accent)" />
    </svg>
  );
}

/** ورقة صغيرة — نقطة للعناوين. */
export function LeafBullet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 2C5 6 4 12 10 18c6-6 5-12 0-16Z"
        fill="none"
        stroke="var(--accent-deep)"
        strokeWidth="1.8"
      />
      <path d="M10 5v10" stroke="var(--accent-deep)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** فاصل: خط رفيع بورقة في المنتصف. */
export function LeafDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-line" />
      <LeafBullet className="h-5 w-5" />
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
