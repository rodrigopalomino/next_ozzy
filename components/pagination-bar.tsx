"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Ventana de páginas alrededor de la actual, con la primera y la última
 * siempre visibles. `null` marca un salto (…).
 */
const construirVentana = (
  actual: number,
  total: number,
): Array<number | null> => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const paginas = new Set<number>([1, total, actual]);
  if (actual - 1 > 1) paginas.add(actual - 1);
  if (actual + 1 < total) paginas.add(actual + 1);

  const ordenadas = [...paginas].sort((a, b) => a - b);

  return ordenadas.flatMap((pagina, idx) => {
    const anterior = ordenadas[idx - 1];
    return anterior !== undefined && pagina - anterior > 1
      ? [null, pagina]
      : [pagina];
  });
};

export default function PaginationBar({
  current,
  totalPages,
}: {
  current: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  // Se preservan los filtros y el orden: sólo cambia `page`.
  const hrefDe = (pagina: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pagina <= 1) params.delete("page");
    else params.set("page", String(pagina));

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const clases = (activa: boolean) =>
    cn(
      "grid h-8 min-w-8 place-items-center rounded px-2 text-sm transition-colors",
      activa
        ? "bg-pink-500 text-white"
        : "border border-neutral-300 hover:bg-black/5",
    );

  return (
    <nav
      className="flex items-center gap-2"
      aria-label="Paginación de resultados"
    >
      {current > 1 ? (
        <Link
          href={hrefDe(current - 1)}
          className={clases(false)}
          aria-label="Página anterior"
          scroll
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : null}

      {construirVentana(current, totalPages).map((pagina, idx) =>
        pagina === null ? (
          <span
            key={`salto-${idx}`}
            className="px-1 text-sm text-neutral-400"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Link
            key={pagina}
            href={hrefDe(pagina)}
            className={clases(pagina === current)}
            aria-current={pagina === current ? "page" : undefined}
            aria-label={`Página ${pagina}`}
            scroll
          >
            {pagina}
          </Link>
        ),
      )}

      {current < totalPages ? (
        <Link
          href={hrefDe(current + 1)}
          className={clases(false)}
          aria-label="Página siguiente"
          scroll
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </nav>
  );
}
