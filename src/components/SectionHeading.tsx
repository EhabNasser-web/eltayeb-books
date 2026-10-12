import { cn } from "@/lib/cn";
import { LeafBullet } from "./Ornaments";

/** عنوان قسم بزخرفة ورقة النبات — بمحاذاة البداية دائمًا (RTL). */
export function SectionHeading({
  kicker,
  title,
  description,
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl text-start", className)}>
      {kicker && <p className="font-medium text-accent-deep">{kicker}</p>}
      <h2 className="mt-1 flex items-start gap-2 font-display text-3xl leading-[1.7] text-ink md:text-4xl">
        <LeafBullet className="mt-3 h-5 w-5 shrink-0" />
        <span>{title}</span>
      </h2>
      {description && <p className="mt-2 text-ink-soft">{description}</p>}
    </div>
  );
}
