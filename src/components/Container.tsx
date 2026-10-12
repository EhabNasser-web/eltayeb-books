import { cn } from "@/lib/cn";

/** حاوية بعرض مقروء وهوامش موبايل-أولًا. */
export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 md:px-8", className)}>{children}</div>;
}
