import { Sparkle } from "lucide-react";

/**
 * Infinite ticker. The item list is rendered twice and the track is
 * translated by -50%, so the loop point is seamless.
 */
export function Marquee({ items }: { items: string[] }) {
  return (
    <div className="relative flex overflow-hidden border-y border-neutral-200/70 bg-ink py-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex shrink-0 items-center gap-10 whitespace-nowrap"
          >
            <span className="font-display text-lg tracking-tight text-white/80">
              {item}
            </span>
            <Sparkle className="size-3.5 shrink-0 fill-rose-400 text-rose-400" />
          </span>
        ))}
      </div>
    </div>
  );
}
