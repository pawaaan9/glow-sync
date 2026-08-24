import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium tracking-tight text-neutral-800"
          >
            {label}
          </label>
        )}
        <div className="group relative">
          {icon && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-rose-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100",
              icon && "pl-11",
              error && "border-red-400 focus:border-red-500 focus:ring-red-100",
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-neutral-500">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
