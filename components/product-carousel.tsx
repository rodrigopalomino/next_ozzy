"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./product-card";

import type { ProductoTarjetaSalida } from "@/types/catalogo";

export default function ProductCarousel({
  title,
  subtitle,
  items,
  autoplayMs = 0,
}: {
  title: string;
  subtitle?: string;
  items: ProductoTarjetaSalida[];
  autoplayMs?: number;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollSnaps = useMemo(
    () => emblaApi?.scrollSnapList() ?? [],
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || autoplayMs <= 0) return;
    const id = window.setInterval(() => emblaApi.scrollNext(), autoplayMs);
    return () => window.clearInterval(id);
  }, [emblaApi, autoplayMs]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo = (idx: number) => emblaApi?.scrollTo(idx);

  return (
    <section>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-2 sm:mt-0">
          <button
            onClick={scrollPrev}
            className="rounded-full border border-neutral-200 bg-white p-2 hover:bg-black/5"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="rounded-full border border-neutral-200 bg-white p-2 hover:bg-black/5"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-5">
        {/* ✅ padding interno para que no se recorte el borde/sombra */}
        <div className="overflow-hidden px-1 py-2" ref={emblaRef}>
          {/* ✅ padding lateral extra (gutter) */}
          <div className="-mx-1 flex gap-6 px-1">
            {items.map((p, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <div
                  key={p.id}
                  className={[
                    "min-w-0 flex-[0_0_72%] sm:flex-[0_0_40%] md:flex-[0_0_26%] lg:flex-[0_0_22%]",
                    "transition-transform duration-300",
                    // ✅ un pelín menos escala para evitar recortes
                    isActive ? "scale-[1.015]" : "scale-100",
                  ].join(" ")}
                >
                  <ProductCard
                    producto={p}
                    sizes="(max-width: 768px) 72vw, (max-width: 1024px) 26vw, 22vw"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {scrollSnaps.map((_, i) => {
            const active = i === selectedIndex;
            return (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={[
                  "h-2 rounded-full transition-all",
                  active
                    ? "w-8 bg-pink-500"
                    : "w-2 bg-neutral-300 hover:bg-neutral-400",
                ].join(" ")}
                aria-label={`Ir al slide ${i + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
