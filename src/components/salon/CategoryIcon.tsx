import {
  Flower2,
  HandHeart,
  HeartHandshake,
  Palette,
  Scissors,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  scissors: Scissors,
  hand: HandHeart,
  sparkles: Sparkles,
  "heart-handshake": HeartHandshake,
  palette: Palette,
  "flower-2": Flower2,
};

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = iconMap[icon] ?? Sparkles;
  return <Icon className={className} />;
}
