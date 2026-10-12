import { useId } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: (id: string, describedBy: string | undefined) => React.ReactNode;
};

function Field({ label, error, hint, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-medium text-ink">
        {label}
      </label>
      {children(id, describedBy)}
      {hint && !error && (
        <p id={hintId} className="text-base text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-base font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

const controlClass = (invalid: boolean) =>
  cn(
    "w-full rounded-book border bg-paper px-4 py-2.5 text-ink placeholder:text-muted",
    "transition-[border-color] duration-200",
    invalid ? "border-error" : "border-line hover:border-accent focus:border-primary"
  );

export function Input({
  label,
  error,
  hint,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(id, describedBy) => (
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={controlClass(Boolean(error))}
          {...rest}
        />
      )}
    </Field>
  );
}

export function Textarea({
  label,
  error,
  hint,
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(id, describedBy) => (
        <textarea
          id={id}
          rows={4}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={controlClass(Boolean(error))}
          {...rest}
        />
      )}
    </Field>
  );
}

export function Select({
  label,
  error,
  hint,
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(id, describedBy) => (
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={controlClass(Boolean(error))}
          {...rest}
        >
          {children}
        </select>
      )}
    </Field>
  );
}
