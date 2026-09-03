import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import {
  claveCatalogo,
  construirQueryCatalogo,
  type OpcionesCatalogo,
} from "@/lib/catalogo-query";
import type { ApiListResponse } from "@/types/ApiResponse";
import type { ProductoTarjetaSalida } from "@/types/catalogo";

type RespuestaTarjetas = ApiListResponse<ProductoTarjetaSalida>;

/**
 * Los GET públicos del catálogo mandan `Cache-Control` con
 * `stale-while-revalidate` y `ETag` con 304, así que react-query no necesita
 * refetchear agresivamente: se apoya en la caché HTTP.
 */
const CACHE_CATALOGO = {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
} as const;

const listado = (ruta: string, recurso: string) => {
  return (opciones: OpcionesCatalogo = {}) =>
    useQuery<RespuestaTarjetas>({
      queryKey: claveCatalogo(recurso, opciones),
      queryFn: () =>
        api
          .get(ruta, { searchParams: construirQueryCatalogo(opciones) })
          .json<RespuestaTarjetas>(),
      ...CACHE_CATALOGO,
    });
};

/** `GET /catalogo` — grilla principal, con filtros y búsqueda FULLTEXT. */
export const useCatalogo = listado("catalogo", "listado");

/** `GET /catalogo/destacados` */
export const useDestacados = listado("catalogo/destacados", "destacados");

/** `GET /catalogo/novedades` */
export const useNovedades = listado("catalogo/novedades", "novedades");

/** `GET /catalogo/mas-vendidos` */
export const useMasVendidos = listado("catalogo/mas-vendidos", "mas-vendidos");

/** `GET /catalogo/categoria/:slug` */
export const useCatalogoPorCategoria = (
  slug: string,
  opciones: OpcionesCatalogo = {},
) =>
  useQuery<RespuestaTarjetas>({
    queryKey: claveCatalogo(`categoria/${slug}`, opciones),
    enabled: Boolean(slug),
    queryFn: () =>
      api
        .get(`catalogo/categoria/${encodeURIComponent(slug)}`, {
          searchParams: construirQueryCatalogo(opciones),
        })
        .json<RespuestaTarjetas>(),
    ...CACHE_CATALOGO,
  });

/** `GET /catalogo/coleccion/:slug` */
export const useCatalogoPorColeccion = (
  slug: string,
  opciones: OpcionesCatalogo = {},
) =>
  useQuery<RespuestaTarjetas>({
    queryKey: claveCatalogo(`coleccion/${slug}`, opciones),
    enabled: Boolean(slug),
    queryFn: () =>
      api
        .get(`catalogo/coleccion/${encodeURIComponent(slug)}`, {
          searchParams: construirQueryCatalogo(opciones),
        })
        .json<RespuestaTarjetas>(),
    ...CACHE_CATALOGO,
  });

/** `GET /catalogo/producto/:slug/relacionados` */
export const useRelacionados = (slug: string) =>
  useQuery<RespuestaTarjetas>({
    queryKey: ["catalogo", "relacionados", slug],
    enabled: Boolean(slug),
    queryFn: () =>
      api
        .get(`catalogo/producto/${encodeURIComponent(slug)}/relacionados`)
        .json<RespuestaTarjetas>(),
    ...CACHE_CATALOGO,
  });
