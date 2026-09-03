import type { EstadoProducto, ISODateString, PlataformaVideo } from "./helpers-enums";
import type {
  CategoriaTarjetaSalida,
  ColorSalida,
  ImagenSalida,
  InsigniaSalida,
  PrecioEfectivo,
} from "./catalogo";

/**
 * Detalle completo: `GET /catalogo/producto/:slug`.
 *
 * A diferencia de la tarjeta de grilla, aquí sí vienen `descripcion`, videos,
 * la galería completa y la jerarquía `colores[].tallas[]` con el precio y el
 * `agotado` de cada combinación talla+color.
 */

export interface VideoSalida {
  id: number;
  /** Enum cerrado en el schema: INSTAGRAM | TIKTOK. */
  plataforma: PlataformaVideo;
  url: string;
  etiqueta: string | null;
  orden: number;
}

export interface ColeccionSalida {
  id: number;
  nombre: string;
  slug: string;
}

export interface SeoSalida {
  titulo: string;
  descripcion: string | null;
  /** Cae a `imagenPrincipal` si el producto no tiene una propia. */
  ogImagen: string | null;
  /** `canonica`, sin L: así lo emite el back. */
  canonica: string;
}

export interface ProductoDetalleSalida {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  estado: EstadoProducto;
  destacado: boolean;

  precio: PrecioEfectivo;
  agotado: boolean;

  /** Galería genérica: imágenes sin color asignado. */
  imagenes: ImagenSalida[];
  /**
   * Asimetría heredada del back: a nivel producto esto es la URL en `string`,
   * mientras en `ProductoTarjetaSalida` es un objeto `ImagenSalida`.
   */
  imagenPrincipal: string | null;
  imagenHover: string | null;

  /** Jerarquía producto -> colores -> tallas, ya resuelta por el servidor. */
  colores: ColorSalida[];

  videos: VideoSalida[];

  /**
   * En el detalle son varias (`categorias`); la clave en singular existe sólo
   * en la tarjeta de grilla.
   */
  categorias: CategoriaTarjetaSalida[];
  colecciones: ColeccionSalida[];
  insignias: InsigniaSalida[];

  createdAt: ISODateString;
  updatedAt: ISODateString;

  seo: SeoSalida;
  /**
   * schema.org `Product` + `AggregateOffer` ya armado por el back. Se inyecta
   * en un `<script type="application/ld+json">` con `serializarJsonLd`.
   */
  jsonLd: Record<string, unknown>;
}

/**
 * Cuando se pide un slug viejo, el back responde 200 (no 301) con este `data`
 * en vez del producto. Se detecta con `"redirigirA" in data`.
 */
export interface ProductoRedirigido {
  redirigirA: string;
}

export type RespuestaDetalle = ProductoDetalleSalida | ProductoRedirigido;

export const esRedireccion = (
  data: RespuestaDetalle,
): data is ProductoRedirigido => "redirigirA" in data;

/**
 * `GET /catalogo/producto/:slug/whatsapp`.
 *
 * Registra el lead en la misma llamada, así que NO hay que llamar además a
 * `POST /lead`: eso duplicaría el lead. Si el registro interno falla, el
 * enlace se devuelve igual.
 */
export interface WhatsAppSalida {
  /** `wa.me` listo: sólo redirigir. */
  url: string;
  mensaje: string;
  numero: string;
  lead_id: number | null;
  /** `true` si es reintento dentro de 5 min (dedupe por IP). */
  duplicado: boolean;
  producto: { id: number; nombre: string; slug: string };
  variante: { id: number; talla: string; color: string } | null;
  precio: PrecioEfectivo;
  cupon: { codigo: string } | null;
}

export type OrigenWhatsApp = "INICIO" | "CATALOGO" | "DETALLE_PRODUCTO" | "OTRO";
