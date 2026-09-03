import type { ImagenSalida, PrecioEfectivo } from "@/types/catalogo";

/** Placeholder cuando un producto todavía no tiene imagen. */
export const IMAGEN_FALLBACK = "/img/polo.png";

const formatoSoles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

/** `1350.5` -> `"S/ 1,350.50"`. */
export const formatearPrecio = (valor: number): string =>
  formatoSoles.format(Number.isFinite(valor) ? valor : 0);

/**
 * Props de `next/image` a partir de una `ImagenSalida`.
 *
 * Las imágenes procesadas traen WebP en 300/600/1200px y un LQIP en
 * `blurData`. Las subidas antes del procesamiento traen esos campos en `null`
 * y hay que caer a `url`, sin `placeholder="blur"` (que exige un blurDataURL
 * válido o revienta en runtime).
 */
export const propsDeImagen = (
  imagen: ImagenSalida | null | undefined,
  nombreProducto: string,
) => {
  if (!imagen) {
    return {
      src: IMAGEN_FALLBACK,
      alt: nombreProducto,
      placeholder: "empty" as const,
    };
  }

  return {
    src: imagen.urlMd ?? imagen.url,
    alt: imagen.alt ?? nombreProducto,
    ...(imagen.blurData
      ? { placeholder: "blur" as const, blurDataURL: imagen.blurData }
      : { placeholder: "empty" as const }),
  };
};

/** `url` de una imagen con fallback, para cuando sólo se necesita el string. */
export const urlDeImagen = (imagen: ImagenSalida | null | undefined): string =>
  imagen?.urlMd ?? imagen?.url ?? IMAGEN_FALLBACK;

/**
 * Hover válido sólo si existe y es distinto de la principal: repetir la misma
 * imagen produce un fade que no se ve pero descarga dos veces.
 */
export const tieneHoverDistinto = (
  principal: string,
  hover: string | null | undefined,
): boolean => {
  const h = (hover ?? "").trim();
  return h.length > 0 && h !== principal;
};

/**
 * Serializa el `jsonLd` del back para inyectarlo en un
 * `<script type="application/ld+json">`.
 *
 * El escape NO es opcional: el nombre y la descripción de un producto se
 * editan desde el panel, así que un valor con `</script>` cerraría la etiqueta
 * y lo que siguiera se ejecutaría como HTML. Escapando `<` y los separadores
 * de línea U+2028/U+2029 (válidos en JSON pero no en un literal de JS) el
 * documento queda inerte y sigue siendo JSON-LD válido.
 */
export const serializarJsonLd = (jsonLd: Record<string, unknown>): string =>
  JSON.stringify(jsonLd)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

/**
 * Etiqueta de descuento, o `null` si no hay oferta vigente.
 *
 * El porcentaje viene del servidor: no se recalcula a partir de los precios.
 */
export const etiquetaDescuento = (precio: PrecioEfectivo): string | null =>
  precio.enOferta && precio.porcentajeDescuento > 0
    ? `-${Math.round(precio.porcentajeDescuento)}%`
    : null;
