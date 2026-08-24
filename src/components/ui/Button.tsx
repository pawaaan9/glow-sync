import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "ink";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "text-white shadow-[0_6px_20px_-8px_var(--color-rose-500)] bg-size-[200%_auto] bg-linear-to-r from-rose-500 via-purple-500 to-rose-500 hover:bg-right hover:shadow-[0_10px_28px_-8px_var(--color-purple-500)] active:scale-[0.98]",
  secondary: "bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-[0.98]",
  outline:
    "border border-neutral-200 bg-white/60 text-neutral-800 backdrop-blur hover:border-rose-300 hover:bg-rose-50/60 active:scale-[0.98]",
  ghost: "text-neutral-700 hover:bg-neutral-100 active:scale-[0.98]",
  danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
  ink: "bg-ink text-white hover:bg-neutral-800 shadow-[0_6px_20px_-10px_var(--color-ink)] active:scale-[0.98]",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

interface ButtonAsButton
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  href?: undefined;
}

interface ButtonAsLink extends BaseProps {
  href: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClasses =
  "group/btn inline-flex items-center justify-center rounded-full font-medium tracking-tight transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 cursor-pointer";

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    loading,
    icon,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    baseClasses,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className,
  );

  if ("href" in rest && rest.href) {
    const { href, onClick, target, rel } = rest as ButtonAsLink;
    return (
      <Link href={href} onClick={onClick} target={target} rel={rel} className={classes}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as Omit<ButtonAsButton, keyof BaseProps>;

  return (
    <button
      type={type}
      className={classes}
      disabled={loading || buttonProps.disabled}
      {...buttonProps}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
