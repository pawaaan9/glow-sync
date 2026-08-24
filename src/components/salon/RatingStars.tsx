import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function RatingStars({
  rating,
  size = 14,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <Star
            key={i}
            size={size}
            className={filled ? "fill-rose-400 text-rose-400" : "fill-neutral-200 text-neutral-200"}
          />
        );
      })}
    </div>
  );
}
