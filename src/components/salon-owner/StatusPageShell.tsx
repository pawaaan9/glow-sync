import { Badge } from "@/components/ui/Badge";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatusPageShell({
  icon: Icon,
  iconClassName,
  badge,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  iconClassName: string;
  badge: { label: string; variant: "warning" | "danger" | "neutral" };
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="aurora grain relative flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-lg rounded-4xl border border-neutral-100 bg-white p-8 text-center shadow-[0_30px_70px_-40px_rgba(27,20,32,0.4)] sm:p-10">
        <span
          className={`mx-auto flex size-16 items-center justify-center rounded-full ${iconClassName}`}
        >
          <Icon className="size-7" />
        </span>

        <Badge variant={badge.variant} className="mx-auto mt-5 w-fit">
          {badge.label}
        </Badge>

        <h1 className="font-display mt-4 text-2xl text-ink sm:text-3xl">{title}</h1>
        <p className="mt-3 leading-relaxed text-neutral-500">{description}</p>

        {children && <div className="mt-8 flex flex-col gap-3">{children}</div>}
      </div>
    </div>
  );
}
