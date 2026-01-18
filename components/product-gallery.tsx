"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images }: { images: string[] }) {
  const safeImages = useMemo(
    () => (images?.length ? images : ["/img/polo.png"]),
    [images],
  );
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-4 md:grid-cols-[80px_1fr]">
      {/* Thumbnails (columna izquierda como en el diseño) */}
      <div className="order-2 flex gap-3 md:order-1 md:flex-col">
        {safeImages.map((src, idx) => {
          const selected = idx === active;
          return (
            <button
              key={`${src}-${idx}`}
              onClick={() => setActive(idx)}
              className={[
                "aspect-[3/4] w-16 overflow-hidden border bg-neutral-100 md:w-full",
                selected
                  ? "border-pink-500"
                  : "border-neutral-300 hover:border-neutral-400",
              ].join(" ")}
              aria-label={`Imagen ${idx + 1}`}
            >
              <Image
                src={src}
                alt={`Miniatura ${idx + 1}`}
                width={200}
                height={260}
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Imagen grande */}
      <div className="order-1 overflow-hidden bg-neutral-100 md:order-2">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={safeImages[active]}
            alt="Producto"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
