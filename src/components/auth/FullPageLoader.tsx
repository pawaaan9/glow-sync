import { Sparkles } from "lucide-react";

export function FullPageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative flex size-16 items-center justify-center">
        <span className="animate-pulse-ring absolute inset-0 rounded-full bg-linear-to-br from-rose-400 to-purple-500" />
        <span
          className="animate-pulse-ring absolute inset-0 rounded-full bg-linear-to-br from-rose-400 to-purple-500"
          style={{ animationDelay: "0.9s" }}
        />
        <span className="relative flex size-11 items-center justify-center rounded-full bg-linear-to-br from-rose-500 to-purple-600 shadow-[0_10px_24px_-10px_var(--color-purple-500)]">
          <Sparkles className="size-5 text-white" />
        </span>
      </div>
      <p className="text-sm text-neutral-400">{label}</p>
    </div>
  );
}
