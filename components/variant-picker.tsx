"use client";

import { Check } from "lucide-react";

import { formatearPrecio } from "@/lib/catalogo";
import { cn } from "@/lib/utils";
import type { ColorSalida, TallaSalida } from "@/types/catalogo";

/**
 * Selector de color + talla.
 *
 * La jerarquía viene del servidor como `colores[].tallas[]`, así que cada
 * `TallaSalida` ya pertenece a un color: `agotado` es de la combinación
 * talla+color, no de la talla suelta. Por eso las tallas se re-renderizan al
 * cambiar de color en vez de mantener una lista global.
 *
 * Es controlado: el detalle es dueño de la selección porque necesita el
 * `variante_id` para el botón de WhatsApp y la galería del color elegido.
 */
export default function VariantPicker({
  colores,
  colorId,
  tallaId,
  onColorChange,
  onTallaChange,
}: {
  colores: ColorSalida[];
  colorId: number | null;
  tallaId: number | null;
  onColorChange: (color: ColorSalida) => void;
  onTallaChange: (talla: TallaSalida) => void;
}) {
  const colorActivo = colores.find((c) => c.id === colorId) ?? colores[0];
  const tallas = colorActivo?.tallas ?? [];

  if (colores.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Colores */}
      <div className="flex items-start gap-3">
        <span className="w-20 shrink-0 pt-2 text-sm font-medium text-neutral-800">
          Color:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {colores.map((color) => {
            const activo = color.id === colorActivo?.id;

            return (
              <button
                key={color.id}
                type="button"
                onClick={() => onColorChange(color)}
                title={color.nombre}
                aria-pressed={activo}
                aria-label={`Color ${color.nombre}${color.agotado ? " (agotado)" : ""}`}
                className={cn(
                  "relative flex h-9 items-center gap-2 rounded border px-2 pr-3 text-sm transition-colors",
                  activo
                    ? "border-pink-500 ring-1 ring-pink-500"
                    : "border-neutral-300 hover:border-neutral-400",
                  // Un color agotado sigue siendo elegible: el usuario puede
                  // querer verlo. Se marca, no se bloquea.
                  color.agotado && "text-neutral-400",
                )}
              >
                <span
                  className="h-5 w-5 rounded-full border border-neutral-300"
                  style={{ backgroundColor: color.hex ?? "#e5e5e5" }}
                />
                {color.nombre}
                {activo ? <Check className="h-3.5 w-3.5 text-pink-500" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tallas del color activo */}
      <div className="flex items-start gap-3">
        <span className="w-20 shrink-0 pt-2 text-sm font-medium text-neutral-800">
          Talla:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {tallas.length === 0 ? (
            <span className="pt-2 text-sm text-neutral-500">
              Sin tallas disponibles
            </span>
          ) : (
            tallas.map((talla) => {
              const activa = talla.id === tallaId;

              return (
                <button
                  key={talla.id}
                  type="button"
                  disabled={talla.agotado}
                  onClick={() => onTallaChange(talla)}
                  aria-pressed={activa}
                  aria-label={`Talla ${talla.etiqueta}${talla.agotado ? " (agotada)" : ""}`}
                  className={cn(
                    "relative h-9 min-w-9 rounded border px-2 text-sm transition-colors",
                    activa
                      ? "border-pink-500 bg-pink-500 text-white"
                      : "border-neutral-300 hover:bg-black/5",
                    talla.agotado &&
                      "cursor-not-allowed border-neutral-200 text-neutral-300 line-through hover:bg-transparent",
                  )}
                >
                  {talla.etiqueta}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* El precio depende de la combinación elegida, así que se avisa cuando
          difiere del precio base que ya se muestra arriba. */}
      {colorActivo?.desde && tallas.length > 1 ? (
        <p className="text-xs text-neutral-500 sm:pl-23">
          Desde {formatearPrecio(colorActivo.desde.precio)} en {colorActivo.nombre}
        </p>
      ) : null}
    </div>
  );
}
