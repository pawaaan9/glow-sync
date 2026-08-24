import Image from "next/image";

export function FullPageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="relative flex size-16 items-center justify-center">
        <span className="animate-pulse-ring absolute inset-0 rounded-full bg-linear-to-br from-rose-400 to-purple-500" />
        <span
          className="animate-pulse-ring absolute inset-0 rounded-full bg-linear-to-br from-rose-400 to-purple-500"
          style={{ animationDelay: "0.9s" }}
        />
        <span className="relative flex size-11 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_-10px_var(--color-purple-500)]">
          <Image src="/logo1.png" alt="GlowSync" width={28} height={28} className="size-7 rounded-md" priority />
        </span>
      </div>
      <p className="text-sm text-neutral-400">{label}</p>
    </div>
  );
}
