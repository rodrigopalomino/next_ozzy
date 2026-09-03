import { z } from "zod";

import type { ProductoTarjetaSalida } from "./catalogo";

/**
 * `GET /catalogo/facetas` — filtros disponibles con conteos.
 *
 * Los conteos son GLOBALES: no respetan los filtros ya aplicados, y la
 * respuesta está cacheada 5 min en el back. Por eso se pide una sola vez y no
 * se repinta en cada cambio de filtro.
 */
export interface FacetaCategoria {
  id: number;
  nombre: string;
  slug: string;
  /** Conteo global. La clave es `productos`, no `conteo`. */
  productos: number;
}

export interface FacetaColeccion extends FacetaCategoria {
  imagenPortada: string | null;
  destacada: boolean;
}

export interface FacetaInsignia extends FacetaCategoria {
  color: string | null;
}

export interface FacetasSalida {
  categorias: FacetaCategoria[];
  colecciones: FacetaColeccion[];
  insignias: FacetaInsignia[];
  /**
   * `productos` cuenta productos distintos, no variantes: un producto con
   * S/M/L en negro cuenta una vez en "Negro".
   */
  colores: {
    id: number;
    nombre: string;
    hex: string | null;
    productos: number;
  }[];
  tallas: { id: number; etiqueta: string; productos: number }[];
  /** Ambos `0` si ningún producto tiene `precioDesde`: proteger el slider. */
  precio: { min: number; max: number };
}

/**
 * `GET /configuracion` — ajustes públicos, objeto plano clave -> string.
 *
 * Todas las claves están presentes; una sin configurar llega como `''`. Las
 * claves llevan punto, así que se leen con corchetes:
 * `config["whatsapp.numero"]`.
 */
export type ClaveConfiguracion =
  | "whatsapp.numero"
  | "whatsapp.horario"
  | "tienda.nombre"
  | "tienda.url"
  | "tienda.moneda"
  | "tienda.moneda_simbolo"
  | "redes.instagram"
  | "redes.tiktok"
  | "redes.facebook"
  | "envio.info";

export type ConfiguracionSalida = Record<ClaveConfiguracion, string>;

/**
 * `GET /catalogo/producto/:slug/guia-tallas` — `data` es `null` si el producto
 * no tiene guía (200, no 404).
 */
export interface GuiaTallasSalida {
  id: number;
  nombre: string;
  nota: string | null;
  /**
   * El back valida la tabla al guardar y también al leer, así que llega con
   * forma firme. `null` significa "la guía existe pero su tabla no es
   * pintable" (guardada antes de esa validación, o por otra vía): en ese caso
   * se muestra la `nota`.
   */
  datos: TablaGuiaTallas | null;
}

/**
 * Forma de la tabla de tallas. El back la valida en el alta y en la lectura,
 * así que este esquema es una red de seguridad que no debería disparar: sirve
 * para que un cambio de contrato salga como tabla ausente y no como una ficha
 * rota.
 */
export const tablaGuiaTallas = z.object({
  columnas: z.array(z.string()).min(1),
  filas: z.array(z.array(z.union([z.string(), z.number()]))).min(1),
});

export type TablaGuiaTallas = z.infer<typeof tablaGuiaTallas>;

/** Devuelve la tabla si es pintable, `null` si hay que caer a la nota. */
export const parsearGuiaTallas = (
  datos: GuiaTallasSalida["datos"],
): TablaGuiaTallas | null => {
  if (datos === null) return null;

  const resultado = tablaGuiaTallas.safeParse(datos);
  return resultado.success ? resultado.data : null;
};

/** `GET /cliente/favoritos` — no pagina (`meta: null`). */
export interface FavoritosSalida {
  total: number;
  productos: ProductoTarjetaSalida[];
}

/**
 * `GET /cupon/:codigo/validar` — siempre 200, unión discriminada por `valido`.
 *
 * Un cupón inválido no es un error de la petición, así que cualquier excepción
 * de ky en esta ruta ya es red o servidor.
 */
export type ValidacionCupon =
  | {
      valido: true;
      codigo: string;
      porcentaje: number | null;
      montoFijo: number | null;
      terminaEn: string | null;
    }
  | { valido: false; motivo: "INVALIDO" | "AGOTADO"; codigo: string };

/** `GET /catalogo/sitemap` — devuelve todo, no pagina. */
export interface SitemapSalida {
  /** `tienda.url` sin barra final. */
  urlBase: string;
  productos: { slug: string; updatedAt: string }[];
  categorias: { slug: string; updatedAt: string }[];
  colecciones: { slug: string; updatedAt: string }[];
}
