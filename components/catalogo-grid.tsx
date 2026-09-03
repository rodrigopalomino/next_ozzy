"use client";

import { useSearchParams } from "next/navigation";

import {
  CatalogoFiltrosMovil,
  FiltrosActivos,
} from "@/components/catalogo-filtros";
import PaginationBar from "@/components/pagination-bar";
import ProductGrid from "@/components/product-grid";
import SortBar from "@/components/sort-bar";
import { useCatalogo } from "@/hooks/catalogo/useCatalogo";
import type { OpcionesCatalogo } from "@/lib/catalogo-query";

const POR_PAGINA = 20;

/** `null` o texto no numérico -> `undefined`, para no mandar un filtro roto. */
const numero = (valor: string | null): number | undefined => {
  if (!valor) return undefined;
  const n = Number(valor);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * Los grupos multiselección se guardan repitiendo el parámetro en la URL, así
 * que se leen con `getAll`: un valor con coma sigue siendo uno solo.
 */
const lista = (
  params: URLSearchParams,
  clave: string,
): string[] | undefined => {
  const valores = params.getAll(clave).filter(Boolean);
  return valores.length ? valores : undefined;
};

/**
 * Grilla del catálogo.
 *
 * Va siempre contra `GET /catalogo` con `filtros[...]`, no contra las rutas
 * por categoría: sólo así se combinan varios filtros a la vez («hoodies» +
 * «en oferta»). Las rutas dedicadas sólo saben de un criterio.
 *
 * La URL es la fuente de verdad, así que cualquier combinación de filtros es
 * compartible y el botón atrás funciona.
 */
export default function CatalogoGrid({
  categoriaSlug,
  coleccionSlug,
}: {
  categoriaSlug?: string;
  coleccionSlug?: string;
}) {
  const searchParams = useSearchParams();

  // El panel escribe en la URL, que manda sobre el slug de la ruta.
  const params = new URLSearchParams(searchParams.toString());
  const categorias =
    lista(params, "categoria") ?? (categoriaSlug ? [categoriaSlug] : undefined);
  const colecciones =
    lista(params, "coleccion") ?? (coleccionSlug ? [coleccionSlug] : undefined);

  const opciones: OpcionesCatalogo = {
    page: Number(searchParams.get("page") ?? 1) || 1,
    limit: POR_PAGINA,
    q: searchParams.get("q") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    order: (searchParams.get("order") as "asc" | "desc" | null) ?? undefined,
    precioMin: numero(searchParams.get("desde")),
    precioMax: numero(searchParams.get("hasta")),
    filtros: {
      categorias,
      colecciones,
      insignias: lista(params, "insignia"),
      colores: lista(params, "color"),
      tallas: lista(params, "talla"),
    },
  };

  const { data, isLoading, isError, error } = useCatalogo(opciones);
  const productos = data?.data ?? [];
  const meta = data?.meta;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CatalogoFiltrosMovil />
          <p className="text-sm text-neutral-600">
            {isLoading
              ? "Buscando..."
              : meta
                ? `${meta.total} ${meta.total === 1 ? "producto" : "productos"}`
                : null}
          </p>
        </div>
        <SortBar />
      </div>

      <div className="mb-5">
        <FiltrosActivos />
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          No se pudo cargar el catálogo.
          {/* Un filtro fuera de la whitelist o un `limit` sobre 100 devuelven
              400 con el detalle: mostrarlo ahorra adivinar. */}
          {error?.message ? (
            <span className="mt-1 block text-xs opacity-80">
              {error.message}
            </span>
          ) : null}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] w-full rounded-xl bg-neutral-100" />
              <div className="mx-auto mt-3 h-3 w-3/4 rounded bg-neutral-100" />
              <div className="mx-auto mt-2 h-3 w-1/3 rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid productos={productos} />
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="mt-8 flex justify-center">
          <PaginationBar current={meta.page} totalPages={meta.totalPages} />
        </div>
      ) : null}
    </section>
  );
}
