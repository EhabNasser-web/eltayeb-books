import { cn } from "@/lib/cn";

/** نصوص طويلة (من نحن، السياسات) بحد عرض مقروء. */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("prose-tayeb", className)}>{children}</div>;
}
