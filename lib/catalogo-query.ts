/**
 * Construcción de query params para el catálogo público (`GET /catalogo/*`).
 *
 * Separado a propósito de `buildQueryOptions`, que sirve al panel admin:
 *
 * - El panel busca con `filtros[global]` + `filtros[globalKeys]`; el catálogo
 *   público busca con `?q=`, que va por el índice FULLTEXT de MySQL en vez de
 *   un LIKE sin índice.
 * - El catálogo valida los filtros contra una whitelist y responde 400 con
 *   `invalid` y `allowed` si se le manda un campo fuera de ella, así que aquí
 *   sólo se emiten los permitidos.
 * - `limit` tiene tope 100 en el servidor: pasarse es un 400, no un recorte.
 */

/**
 * Filtros que acepta el catálogo público. Cualquier otro campo responde 400
 * con la lista de permitidos.
 *
 * Los de relación comparan exacto, no por fragmento: los valores salen de la
 * lista cerrada de facetas, así que «Negro» no debe traer «Negro Mate».
 *
 * `colores` y `tallas` cuelgan de las variantes, no del producto: filtrar por
 * XL devuelve productos que TIENEN una variante XL, no que estén disponibles
 * en XL.
 */
export type FiltrosCatalogo = {
  nombre?: string;
  slug?: string;
  destacado?: boolean;
  categorias?: string[];
  colecciones?: string[];
  insignias?: string[];
  colores?: string[];
  tallas?: string[];
};

export const LIMIT_MAXIMO = 100;
export const LIMIT_POR_DEFECTO = 20;

export type OpcionesCatalogo = {
  page?: number;
  limit?: number;
  /** Búsqueda FULLTEXT sobre nombre + descripción. */
  q?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  filtros?: FiltrosCatalogo;
  /** Rango de precio. Se traduce a `precioDesde[gte]` / `[lte]`. */
  precioMin?: number;
  precioMax?: number;
};

/**
 * Recorta `limit` al tope del servidor. Preferimos servir 100 a que el
 * usuario vea una grilla vacía por un 400.
 */
const normalizarLimit = (limit?: number): number => {
  if (!limit || !Number.isFinite(limit) || limit < 1) return LIMIT_POR_DEFECTO;
  return Math.min(Math.trunc(limit), LIMIT_MAXIMO);
};

export const construirQueryCatalogo = (
  opciones: OpcionesCatalogo = {},
): URLSearchParams => {
  const { page, q, sortBy, order, filtros = {} } = opciones;
  const params = new URLSearchParams();

  if (page && page > 1) params.set("page", String(page));
  params.set("limit", String(normalizarLimit(opciones.limit)));

  const termino = q?.trim();
  if (termino) params.set("q", termino);

  if (sortBy) params.set("sortBy", sortBy);
  if (order) params.set("order", order);

  // `precioDesde` EXIGE operador: sin él el servidor responde 200 con cero
  // resultados en vez de un error, así que un rango mal formado se vería como
  // "no hay productos".
  const { precioMin, precioMax } = opciones;
  if (precioMin !== undefined && Number.isFinite(precioMin)) {
    params.set("filtros[precioDesde][gte]", String(precioMin));
  }
  if (precioMax !== undefined && Number.isFinite(precioMax)) {
    params.set("filtros[precioDesde][lte]", String(precioMax));
  }

  // Formato `filtros[campo]=valor`, que el back parsea con `qs`.
  //
  // Los valores múltiples se mandan REPITIENDO el parámetro, no separados por
  // coma. El servidor acepta las dos formas, pero repetir mantiene íntegro un
  // valor que contenga una coma: un color llamado «Negro, Mate» se partiría en
  // dos valores inexistentes y devolvería cero sin error.
  Object.entries(filtros).forEach(([campo, valor]) => {
    if (valor === undefined || valor === null || valor === "") return;

    if (Array.isArray(valor)) {
      valor
        .filter((v) => v !== undefined && v !== null && v !== "")
        .forEach((v) => params.append(`filtros[${campo}]`, String(v)));
      return;
    }

    params.set(`filtros[${campo}]`, String(valor));
  });

  return params;
};

/** Clave de react-query estable para un conjunto de opciones. */
export const claveCatalogo = (
  recurso: string,
  opciones: OpcionesCatalogo = {},
): readonly unknown[] => [
  "catalogo",
  recurso,
  opciones.page ?? 1,
  normalizarLimit(opciones.limit),
  opciones.q?.trim() ?? null,
  opciones.sortBy ?? null,
  opciones.order ?? null,
  opciones.precioMin ?? null,
  opciones.precioMax ?? null,
  opciones.filtros ?? null,
];
