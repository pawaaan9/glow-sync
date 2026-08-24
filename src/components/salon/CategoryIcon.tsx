import { SALON_CATEGORIES, type SalonCategory } from "@/lib/shared";
import {
  Flower2,
  HandHeart,
  Heart,
  Palette,
  Scissors,
  Sparkles,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";

/** One icon per real salon category — the same eight the registration form offers. */
const CATEGORY_ICONS: Record<SalonCategory, LucideIcon> = {
  [SALON_CATEGORIES.HAIR_SALON]: Scissors,
  [SALON_CATEGORIES.BEAUTY_SALON]: Sparkles,
  [SALON_CATEGORIES.BARBERSHOP]: Store,
  [SALON_CATEGORIES.NAIL_SALON]: HandHeart,
  [SALON_CATEGORIES.BRIDAL_MAKEUP_STUDIO]: Palette,
  [SALON_CATEGORIES.SPA]: Flower2,
  [SALON_CATEGORIES.WELLNESS_CENTRE]: Heart,
  [SALON_CATEGORIES.FREELANCE_BEAUTY_PROFESSIONAL]: UserRound,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: SalonCategory;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category] ?? Sparkles;
  return <Icon className={className} />;
}
