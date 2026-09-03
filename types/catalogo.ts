/**
 * Tipos del catálogo público de nest_ozzy (`GET /catalogo/*`).
 *
 * Dos reglas que vienen del contrato del back y conviene no olvidar:
 *
 * 1. El precio NO se calcula aquí. La cascada (precio de variante, oferta
 *    vigente, precioOriginal, precioBase) la resuelve el servidor y llega
 *    resuelta en `PrecioEfectivo`. Si el front la recalcula, el catálogo
 *    acaba anunciando un precio distinto al de la ficha.
 * 2. El stock tampoco se interpreta aquí. `stock: null` significa "sin control
 *    de stock" — o sea disponible, no cero. La respuesta ya trae `agotado`.
 */

/** Precio ya resuelto por el servidor. */
export interface PrecioEfectivo {
  /** El que se cobra. */
  precio: number;
  /** Tachado, sólo si hay oferta vigente. */
  precioAnterior: number | null;
  /** 0 si no hay oferta. */
  porcentajeDescuento: number;
  enOferta: boolean;
}

/**
 * Imagen procesada. `urlSm`/`urlMd`/`urlLg` son WebP de 300/600/1200px y
 * `blurData` es el LQIP para `placeholder="blur"` de `next/image`.
 *
 * Las imágenes subidas antes del procesamiento traen esos campos en `null`:
 * en ese caso hay que caer a `url`.
 */
export interface ImagenSalida {
  id: number;
  url: string;
  alt: string | null;
  orden: number;
  esPrincipal: boolean;
  esHover: boolean;
  urlSm: string | null;
  urlMd: string | null;
  urlLg: string | null;
  ancho: number | null;
  alto: number | null;
  blurData: string | null;
}

export interface InsigniaSalida {
  id: number;
  nombre: string;
  slug: string;
  color: string | null;
}

export interface CategoriaTarjetaSalida {
  id: number;
  nombre: string;
  slug: string;
}

/** Color tal como llega en una tarjeta de grilla (sin galería ni tallas). */
export interface ColorTarjetaSalida {
  id: number;
  nombre: string;
  hex: string | null;
  imagenPrincipal: string | null;
  imagenHover: string | null;
  agotado: boolean;
  /** Precio más bajo de ese color. */
  desde: PrecioEfectivo | null;
}

/**
 * Tarjeta ligera de los listados de grilla. NO trae `descripcion`, `videos`,
 * `colecciones` ni la galería completa — sólo portada y hover. Lo que falte
 * hay que pedirlo en el detalle.
 *
 * Stock cero no oculta el producto: llega `agotado: true` y sigue visible.
 */
export interface ProductoTarjetaSalida {
  id: number;
  nombre: string;
  slug: string;
  destacado: boolean;
  precio: PrecioEfectivo;
  agotado: boolean;
  imagenPrincipal: ImagenSalida | null;
  imagenHover: ImagenSalida | null;
  colores: ColorTarjetaSalida[];
  insignias: InsigniaSalida[];
  /** Categoría principal (determinista, por `categoria.orden`). */
  categoria: CategoriaTarjetaSalida | null;
}

/**
 * Una talla dentro de un color. `agotado` es de la combinación talla+color,
 * no de la talla en abstracto, porque cada `TallaSalida` vive dentro de un
 * color.
 */
export interface TallaSalida {
  id: number;
  etiqueta: string;
  /** El id que se le pasa a `GET /catalogo/producto/:slug/whatsapp`. */
  variante_id: number;
  sku: string | null;
  /** `null` = sin control de stock = disponible. Usar `agotado`, no esto. */
  stock: number | null;
  agotado: boolean;
  /** Precio de ESA combinación talla+color. */
  precio: PrecioEfectivo;
}

/** Color en el detalle: con galería propia y sus tallas. */
export interface ColorSalida {
  id: number;
  nombre: string;
  hex: string | null;
  /** Galería de ese color. */
  imagenes: ImagenSalida[];
  imagenPrincipal: string | null;
  imagenHover: string | null;
  tallas: TallaSalida[];
  /** `true` sólo si TODAS sus tallas lo están. */
  agotado: boolean;
  desde: PrecioEfectivo | null;
}
