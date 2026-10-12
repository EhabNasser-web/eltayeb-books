import { cn } from "@/lib/cn";

type Tone = "success" | "warning" | "error" | "neutral";

const tones: Record<Tone, string> = {
  success: "bg-success text-paper",
  warning: "bg-warning text-paper",
  error: "bg-error text-paper",
  neutral: "bg-primary-deep text-paper",
};

/** شارة حالة صغيرة — نص صريح، من غير مبالغة تسويقية. */
export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-book px-3 py-0.5 text-base font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
