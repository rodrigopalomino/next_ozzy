import type { PrecioEfectivo } from "./catalogo";

/**
 * Carrito de nest_ozzy (`/carrito`). Cierra por WhatsApp, igual que el botón
 * individual del producto.
 *
 * El total lo calcula el servidor: el front sólo manda `variante_id` y
 * cantidad. Nunca precios — un cliente que pudiera enviarlos pediría un polo
 * a S/ 1 desde la consola.
 */

export interface CarritoItemSalida {
  id: number;
  variante_id: number;
  cantidad: number;
  producto: { id: number; nombre: string; slug: string };
  talla: { id: number; etiqueta: string };
  color: { id: number; nombre: string; hex: string | null };
  imagen: { url: string; urlSm: string | null; alt: string | null } | null;
  precio: PrecioEfectivo;
  subtotal: number;
  agotado: boolean;
  /**
   * `false` si el producto se ocultó después de añadirlo. No entra en el total
   * ni en el mensaje de WhatsApp, pero se sigue mostrando para que el cliente
   * entienda el cambio.
   */
  disponible: boolean;
}

export interface CarritoSalida {
  id: number | null;
  items: CarritoItemSalida[];
  /** Sólo lo pedible: excluye los no disponibles. */
  cantidad: number;
  /** Sólo lo pedible. Lo calcula el servidor. */
  total: number;
  moneda: string;
  simbolo: string;
}

export interface CarritoWhatsAppSalida {
  /** `wa.me` listo: sólo redirigir. */
  url: string;
  mensaje: string;
  numero: string;
  total: number;
  cantidad: number;
  moneda: string;
  /** Líneas que quedaron fuera del pedido: hay que avisar antes de abrir. */
  omitidos: string[];
}

/** Topes del back: el mensaje de WhatsApp tiene límite de longitud. */
export const MAX_POR_LINEA = 20;
export const MAX_PRODUCTOS_DISTINTOS = 30;
