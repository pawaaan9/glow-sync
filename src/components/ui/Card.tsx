import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-neutral-100 bg-white shadow-[0_1px_2px_rgba(27,20,32,0.04),0_20px_44px_-32px_rgba(217,36,88,0.35)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-3 border-t border-neutral-100 p-6", className)}
      {...props}
    />
  );
}

/** Section heading with an all-caps eyebrow, shared by every page. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="eyebrow flex items-center gap-2 text-rose-600">
          <span className="h-px w-6 bg-rose-300" />
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl text-ink sm:text-4xl">{title}</h2>
      {description && <p className="max-w-lg text-neutral-500">{description}</p>}
    </div>
  );
}
