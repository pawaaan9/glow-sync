import { Button } from "@/components/ui/Button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="aurora grain relative flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="font-display font-display-tight text-gradient text-[clamp(5rem,20vw,12rem)] leading-none">
        404
      </span>
      <h1 className="font-display text-2xl text-ink sm:text-3xl">
        This page went for a treatment
      </h1>
      <p className="max-w-sm text-neutral-500">
        The page you are after does not exist — but there are plenty of salons
        waiting for you.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/search" size="lg" icon={<Compass className="size-4" />}>
          Browse salons
        </Button>
        <Button href="/" size="lg" variant="outline">
          Back home
        </Button>
      </div>
    </div>
  );
}
