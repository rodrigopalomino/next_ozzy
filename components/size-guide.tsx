"use client";

import { useEffect, useState } from "react";

import { useGuiaTallas } from "@/hooks/tienda/useTienda";
import { cn } from "@/lib/utils";
import { parsearGuiaTallas } from "@/types/tienda";

/**
 * Guía de tallas del producto (`GET /catalogo/producto/:slug/guia-tallas`).
 *
 * `datos` es JSON libre: en BD es texto y el back no valida su forma, así que
 * se parsea con Zod y se cae a la nota si no cuadra. Asumir la forma haría que
 * una guía mal guardada desde el panel rompiera la ficha.
 */
export default function SizeGuide({
  slug,
  linkLabel = "Guía de tallas",
}: {
  slug: string;
  linkLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  // Se pide sólo al abrir: la mayoría de visitas a la ficha no la abren.
  const { data, isLoading } = useGuiaTallas(slug, open);
  const guia = data?.data ?? null;
  const tabla = guia ? parsearGuiaTallas(guia.datos) : null;

  useEffect(() => {
    if (!open) return;

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [open]);

  const titulo = guia?.nombre ?? "Guía de tallas";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center text-xs font-semibold text-neutral-900 underline underline-offset-4 hover:opacity-80"
      >
        {linkLabel}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={titulo}
        >
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <div
            className={cn(
              "relative z-10 mx-2 w-full max-w-2xl rounded-t-3xl bg-white shadow-xl sm:mx-4 sm:rounded-3xl",
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 p-4">
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  {titulo}
                </div>
                <div className="mt-0.5 text-xs text-neutral-600">
                  Medidas en centímetros (cm)
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              >
                ×
              </button>
            </div>

            <div className="max-h-[75dvh] overflow-auto p-4">
              {isLoading ? (
                <div className="h-40 animate-pulse rounded-2xl bg-neutral-100" />
              ) : !guia ? (
                <p className="text-sm text-neutral-600">
                  Este producto no tiene guía de tallas.
                </p>
              ) : tabla ? (
                <>
                  <div className="overflow-x-auto rounded-2xl border border-neutral-200">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50 text-left text-neutral-700">
                          {tabla.columnas.map((columna) => (
                            <th
                              key={columna}
                              scope="col"
                              className="px-4 py-3 font-semibold"
                            >
                              {columna}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {tabla.filas.map((fila, idx) => (
                          <tr key={idx} className="text-neutral-800">
                            {fila.map((celda, i) => (
                              <td
                                key={i}
                                className={cn(
                                  "px-4 py-3",
                                  i === 0 && "font-semibold",
                                )}
                              >
                                {celda}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {guia.nota ? (
                    <p className="mt-3 text-xs text-neutral-600">{guia.nota}</p>
                  ) : null}
                </>
              ) : (
                // La tabla no tenía la forma esperada: se muestra la nota en
                // vez de arriesgar un render roto.
                <p className="whitespace-pre-line text-sm text-neutral-700">
                  {guia.nota ?? "La guía de tallas no está disponible."}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
