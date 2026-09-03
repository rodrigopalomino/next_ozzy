import Image from "next/image";
import Link from "next/link";

import FavoriteButton from "@/components/favorite-button";

import {
  etiquetaDescuento,
  formatearPrecio,
  propsDeImagen,
  tieneHoverDistinto,
  urlDeImagen,
} from "@/lib/catalogo";
import { cn } from "@/lib/utils";
import type { ProductoTarjetaSalida } from "@/types/catalogo";

export default function ProductCard({
  producto,
  className,
  sizes = "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
}: {
  producto: ProductoTarjetaSalida;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const { nombre, slug, precio, agotado, imagenPrincipal, imagenHover } =
    producto;

  const descuento = etiquetaDescuento(precio);
  const principal = propsDeImagen(imagenPrincipal, nombre);
  const urlHover = imagenHover ? urlDeImagen(imagenHover) : null;
  const hasHover = tieneHoverDistinto(String(principal.src), urlHover);

  // Los colores traen su propia portada: sirven de swatch sin pedir el detalle.
  const swatches = producto.colores.slice(0, 5);

  return (
    <div className={cn("group", className)}>
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        <div className="absolute left-3 top-3 z-20 flex flex-col items-start gap-1.5">
          {descuento ? (
            <span className="rounded-full bg-pink-500 px-3 py-1 text-xs font-semibold text-white">
              {descuento}
            </span>
          ) : null}

          {producto.insignias.map((insignia) => (
            <span
              key={insignia.id}
              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
              // El color lo define el panel; sin color, negro neutro.
              style={{ backgroundColor: insignia.color ?? "#171717" }}
            >
              {insignia.nombre}
            </span>
          ))}
        </div>

        <FavoriteButton
          producto_id={producto.id}
          className="absolute right-3 top-3 z-20"
        />

        <Link href={`/producto/${encodeURIComponent(slug)}`} className="block">
          <div className="relative aspect-[3/4] w-full bg-neutral-100">
            <Image
              {...principal}
              fill
              sizes={sizes}
              priority={priority}
              className={cn(
                "object-cover transition-all duration-700 ease-out md:group-hover:scale-[1.02]",
                hasHover ? "md:group-hover:opacity-0" : "opacity-100",
              )}
            />

            {hasHover ? (
              <Image
                {...propsDeImagen(imagenHover, `${nombre} - vista 2`)}
                fill
                sizes={sizes}
                className="object-cover opacity-0 transition-all duration-700 ease-out md:group-hover:scale-[1.02] md:group-hover:opacity-100"
              />
            ) : null}

            {agotado ? (
              <div className="absolute inset-0 z-10 flex items-end justify-center bg-white/45 pb-4 backdrop-blur-[1px]">
                <span className="rounded-full bg-neutral-900/90 px-3 py-1 text-xs font-semibold text-white">
                  Agotado
                </span>
              </div>
            ) : null}
          </div>

          <div className="p-4 text-center">
            <div className="line-clamp-1 text-sm font-semibold text-neutral-900">
              {nombre}
            </div>

            <div className="mt-1">
              {precio.precioAnterior !== null ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-neutral-500 line-through">
                    {formatearPrecio(precio.precioAnterior)}
                  </span>
                  <span className="text-sm font-semibold text-pink-600">
                    {formatearPrecio(precio.precio)}
                  </span>
                </div>
              ) : (
                <div className="text-sm font-semibold text-pink-600">
                  {formatearPrecio(precio.precio)}
                </div>
              )}
            </div>

            {swatches.length > 1 ? (
              <div className="mt-2 flex items-center justify-center gap-1.5">
                {swatches.map((color) => (
                  <span
                    key={color.id}
                    title={color.nombre}
                    className={cn(
                      "h-3.5 w-3.5 rounded-full border border-neutral-300",
                      color.agotado && "opacity-40",
                    )}
                    style={{ backgroundColor: color.hex ?? "#e5e5e5" }}
                  />
                ))}
                {producto.colores.length > swatches.length ? (
                  <span className="text-xs text-neutral-500">
                    +{producto.colores.length - swatches.length}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </Link>
      </div>
    </div>
  );
}
