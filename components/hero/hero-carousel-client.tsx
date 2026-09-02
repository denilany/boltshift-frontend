"use client";

import * as React from "react";
import { HeroCard } from "./hero-card";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { HeroItem } from "@/types/type";

type HeroCarouselClientProps = {
  items: HeroItem[];
};

export function HeroCarouselClient({ items }: HeroCarouselClientProps) {
  const [api, setApi] = React.useState<any>(null);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const plugin = React.useRef(
    Autoplay({
      delay: 8000,
      stopOnInteraction: true,
    }),
  );

  return (
    <div className="w-full relative">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current, Fade()]}
        opts={{ loop: true }}
        className="pt-4 w-full"
        onMouseEnter={() => plugin.current.stop()}
        onMouseLeave={() => plugin.current.play()}
      >
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id}>
              <HeroCard
                item={item}
                count={count}
                current={current}
                onDotClick={(i) => api?.scrollTo(i)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
