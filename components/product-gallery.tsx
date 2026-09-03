"use client";

import { useState } from "react";
import Image from "next/image";

import { IMAGEN_FALLBACK, propsDeImagen } from "@/lib/catalogo";
import { cn } from "@/lib/utils";
import type { ImagenSalida } from "@/types/catalogo";

export default function ProductGallery({
  imagenes,
  nombre,
}: {
  imagenes: ImagenSalida[];
  nombre: string;
}) {
  // Al cambiar de color cambia la galería y el índice guardado dejaría de
  // existir. En vez de resetearlo en un effect (que provoca un render extra
  // con el índice viejo) se guarda el id de la imagen y se deriva el índice:
  // si ese id no está en la galería nueva, cae solo a la primera.
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);

  const indiceSeleccionado = imagenes.findIndex(
    (imagen) => imagen.id === idSeleccionado,
  );
  const activa = indiceSeleccionado === -1 ? 0 : indiceSeleccionado;

  if (imagenes.length === 0) {
    return (
      <div className="overflow-hidden bg-neutral-100">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={IMAGEN_FALLBACK}
            alt={nombre}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    );
  }

  const principal = imagenes[activa];

  return (
    <div className="grid gap-4 md:grid-cols-[80px_1fr]">
      {/* Miniaturas */}
      {imagenes.length > 1 ? (
        <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col md:overflow-visible">
          {imagenes.map((imagen, idx) => {
            const seleccionada = idx === activa;

            return (
              <button
                key={imagen.id}
                type="button"
                onClick={() => setIdSeleccionado(imagen.id)}
                aria-pressed={seleccionada}
                aria-label={`Ver imagen ${idx + 1} de ${imagenes.length}`}
                className={cn(
                  "aspect-[3/4] w-16 shrink-0 overflow-hidden border bg-neutral-100 md:w-full",
                  seleccionada
                    ? "border-pink-500"
                    : "border-neutral-300 hover:border-neutral-400",
                )}
              >
                <Image
                  {...propsDeImagen(imagen, `${nombre} - miniatura ${idx + 1}`)}
                  src={imagen.urlSm ?? imagen.url}
                  width={200}
                  height={260}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Imagen grande */}
      <div className="order-1 overflow-hidden bg-neutral-100 md:order-2">
        <div className="relative aspect-[4/5] w-full">
          <Image
            {...propsDeImagen(principal, nombre)}
            src={principal.urlLg ?? principal.url}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
