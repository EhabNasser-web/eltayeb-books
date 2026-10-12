import { cn } from "@/lib/cn";

/*
 * عرض موحّد لأغلفة الكتب: كبير، بظل خفيف كأنه على رف، وإطار ذهبي رفيع.
 * TODO(brand, phase-1): استبدال الغلاف التوضيحي بصور الأغلفة الحقيقية من Supabase Storage.
 */
export function BookCover({
  title,
  author,
  className,
}: {
  title: string;
  author?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-book bg-primary-deep",
        "shadow-[0_14px_30px_-14px_rgba(34,48,42,0.55)]",
        className
      )}
      role="img"
      aria-label={`غلاف كتاب ${title}`}
    >
      <div className="absolute inset-2 rounded-book border border-accent/70" aria-hidden="true" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="block h-px w-10 bg-accent" aria-hidden="true" />
        <p className="font-display text-2xl leading-[1.8] text-paper">{title}</p>
        {author && <p className="text-base text-paper/80">{author}</p>}
        <span className="block h-px w-10 bg-accent" aria-hidden="true" />
      </div>
    </div>
  );
}
