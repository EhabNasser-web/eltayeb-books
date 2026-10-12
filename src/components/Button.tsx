import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "text";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  // الأساسي: أخضر عميق، تفصيلة ذهبية عند الـ hover.
  primary:
    "bg-primary text-paper hover:bg-primary-dark border-b-2 border-accent/70 disabled:border-transparent",
  // الثانوي: إطار أخضر على الورق.
  secondary: "bg-transparent text-primary border border-primary hover:bg-primary hover:text-paper",
  // نصي: للروابط-الأزرار الهادية.
  text: "bg-transparent text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-primary-deep",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-1.5 text-base",
  md: "px-6 py-2.5 text-lg",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps & {
  href?: undefined;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
};

/** زر بزوايا صغيرة (4px) — ممنوع الكبسولات. */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-book font-medium leading-relaxed",
    "transition-[background-color,color,border-color,transform] duration-200",
    "active:scale-[0.98]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if ("href" in props && props.href) {
    const external = "external" in props && props.external;
    return (
      <a
        href={props.href}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  const { type = "button", disabled, onClick } = props as ButtonProps;
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
