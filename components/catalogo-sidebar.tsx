"use client";

import Link from "next/link";

import { useFacetas } from "@/hooks/tienda/useTienda";
import { cn } from "@/lib/utils";

/**
 * Sidebar de navegación por categoría o colección.
 *
 * Se alimenta de `GET /catalogo/facetas`, que trae los dos grupos con sus
 * conteos en una sola llamada. Los conteos son globales y están cacheados 5
 * min en el back, así que esto NO se repinta al cambiar de filtro.
 *
 * Navega por slug, no por nombre: el nombre se edita desde el panel y usarlo
 * en la URL rompería los enlaces al primer cambio de texto.
 */
export default function CatalogoSidebar({
  modo,
  slugActual,
}: {
  modo: "categorias" | "colecciones";
  slugActual?: string;
}) {
  const { data, isLoading } = useFacetas();

  const items =
    modo === "categorias"
      ? (data?.data.categorias ?? [])
      : (data?.data.colecciones ?? []);

  const titulo =
    modo === "categorias" ? "Filtrar por categoría" : "Filtrar por colección";
  const param = modo === "categorias" ? "categoria" : "coleccion";

  const clases = (activo: boolean) =>
    cn(
      "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all",
      activo
        ? "bg-pink-500 text-white shadow-sm ring-1 ring-pink-500/40"
        : "text-neutral-900 hover:bg-neutral-100",
    );

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="text-sm font-semibold text-neutral-900">{titulo}</div>

      <div className="mt-3 flex flex-col gap-1">
        <Link href={`/producto?tipo=${modo}`} className={clases(!slugActual)}>
          <span
            className={cn(
              "h-5 w-1 rounded-full transition-all",
              !slugActual ? "bg-white" : "bg-neutral-300",
            )}
            aria-hidden="true"
          />
          <span className="leading-tight">Todos</span>
        </Link>

        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="mx-1 my-1 h-6 animate-pulse rounded bg-neutral-100"
              />
            ))
          : items.map((item) => {
              const activo = item.slug === slugActual;

              return (
                <Link
                  key={item.id}
                  href={`/producto?tipo=${modo}&${param}=${encodeURIComponent(item.slug)}`}
                  className={clases(activo)}
                >
                  <span
                    className={cn(
                      "h-5 w-1 rounded-full transition-all",
                      activo ? "bg-white" : "bg-neutral-300",
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 leading-tight">{item.nombre}</span>
                  <span
                    className={cn(
                      "text-xs font-normal tabular-nums",
                      activo ? "text-white/80" : "text-neutral-500",
                    )}
                  >
                    {item.productos}
                  </span>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
