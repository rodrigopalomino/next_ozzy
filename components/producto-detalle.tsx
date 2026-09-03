"use client";

import React from "react";
import { Instagram, Music2, Play } from "lucide-react";

import AddToCartButton from "@/components/add-to-cart-button";
import Breadcrumbs from "@/components/breadcrumbs";
import ProductGallery from "@/components/product-gallery";
import ProductCarousel from "@/components/product-carousel";
import QuantityPicker from "@/components/quantity-picker";
import SizeGuide from "@/components/size-guide";
import StockAlert from "@/components/stock-alert";
import VariantPicker from "@/components/variant-picker";
import WhatsAppButton from "@/components/whatsapp-button";
import { useRelacionados } from "@/hooks/catalogo/useCatalogo";
import { etiquetaDescuento, formatearPrecio } from "@/lib/catalogo";
import type { ColorSalida, TallaSalida } from "@/types/catalogo";
import type { ProductoDetalleSalida } from "@/types/producto-detalle";

/**
 * Insignia del panel. El nombre y el color son editables desde el admin y no
 * hay set cerrado de valores, así que no se mapean iconos por nombre: una
 * insignia nueva desaparecería en silencio. Se pinta lo que manda el servidor.
 */
function BadgePill({
  nombre,
  color,
}: {
  nombre: string;
  color: string | null;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: color ?? "#171717" }}
    >
      {nombre}
    </span>
  );
}

function VideoCTA({ igUrl, ttUrl }: { igUrl?: string; ttUrl?: string }) {
  if (!igUrl && !ttUrl) return null;

  return (
    <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
        <Play className="h-4 w-4" />
        Mira el video del producto
      </div>
      <p className="mt-1 text-xs text-neutral-600">
        Míralo en Instagram o TikTok antes de pedir.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {igUrl ? (
          <a
            href={igUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-black/90"
            aria-label="Ver video del producto en Instagram"
          >
            <Instagram className="h-4 w-4" />
            Ver video (Instagram)
          </a>
        ) : null}

        {ttUrl ? (
          <a
            href={ttUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
            aria-label="Ver video del producto en TikTok"
          >
            <Music2 className="h-4 w-4" />
            Ver video (TikTok)
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function ProductoDetalle({
  producto,
}: {
  producto: ProductoDetalleSalida;
}) {
  const { data: relacionados } = useRelacionados(producto.slug);

  // La selección se guarda como "lo que el usuario eligió", y el valor
  // efectivo se deriva cayendo a la preselección cuando no hay elección o
  // cuando la que había ya no existe (otro color). Así no hace falta un
  // effect que resetee estado y provoque un render intermedio.
  const [colorElegido, setColorElegido] = React.useState<number | null>(null);
  const [tallaElegida, setTallaElegida] = React.useState<number | null>(null);
  const [cantidad, setCantidad] = React.useState(1);

  const colorActivo: ColorSalida | undefined =
    producto.colores.find((c) => c.id === colorElegido) ??
    producto.colores.find((c) => !c.agotado) ??
    producto.colores[0];

  const tallaActiva: TallaSalida | undefined =
    colorActivo?.tallas.find((t) => t.id === tallaElegida) ??
    colorActivo?.tallas.find((t) => !t.agotado) ??
    colorActivo?.tallas[0];

  // El precio mostrado es el de la combinación elegida cuando hay una; si no,
  // el del producto. En ambos casos lo resolvió el servidor.
  const precio = tallaActiva?.precio ?? producto.precio;
  const descuento = etiquetaDescuento(precio);

  // La galería sigue al color elegido; si ese color no tiene imágenes propias,
  // cae a la galería del producto.
  const imagenes =
    colorActivo?.imagenes.length ? colorActivo.imagenes : producto.imagenes;

  // `orden` lo define el panel: el primero de cada plataforma es el elegido.
  const videos = [...producto.videos].sort((a, b) => a.orden - b.orden);
  const igUrl = videos.find((v) => v.plataforma === "INSTAGRAM")?.url;
  const ttUrl = videos.find((v) => v.plataforma === "TIKTOK")?.url;

  const sinTallaElegida = Boolean(colorActivo?.tallas.length) && !tallaActiva;
  const noPedible = sinTallaElegida || Boolean(tallaActiva?.agotado);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          ...(producto.categorias[0]
            ? [
                {
                  label: producto.categorias[0].nombre,
                  href: `/producto?tipo=categorias&categoria=${producto.categorias[0].slug}`,
                },
              ]
            : []),
          { label: producto.nombre },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery imagenes={imagenes} nombre={producto.nombre} />

        <section>
          <div className="flex flex-wrap items-center gap-2">
            {producto.insignias.map((insignia) => (
              <BadgePill
                key={insignia.id}
                nombre={insignia.nombre}
                color={insignia.color}
              />
            ))}
            {descuento ? (
              <span className="inline-flex items-center rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-600">
                {descuento} OFF
              </span>
            ) : null}
            {producto.agotado ? (
              <span className="inline-flex items-center rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                Agotado
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-2xl font-semibold">{producto.nombre}</h1>

          <div className="mt-3">
            {precio.precioAnterior !== null ? (
              <div className="flex items-end gap-3">
                <span className="text-xl font-semibold text-pink-600">
                  {formatearPrecio(precio.precio)}
                </span>
                <span className="text-sm text-neutral-500 line-through">
                  {formatearPrecio(precio.precioAnterior)}
                </span>
              </div>
            ) : (
              <div className="text-xl font-semibold">
                {formatearPrecio(precio.precio)}
              </div>
            )}
          </div>

          <VideoCTA igUrl={igUrl} ttUrl={ttUrl} />

          <div className="mt-6 space-y-5">
            <VariantPicker
              colores={producto.colores}
              colorId={colorActivo?.id ?? null}
              tallaId={tallaActiva?.id ?? null}
              onColorChange={(color) => {
                setColorElegido(color.id);
                // La talla elegida pertenecía al color anterior: se olvida y
                // la derivación de arriba elige la primera disponible.
                setTallaElegida(null);
              }}
              onTallaChange={(talla) => setTallaElegida(talla.id)}
            />

            <QuantityPicker
              label="Cantidad:"
              value={cantidad}
              onChange={setCantidad}
            />

            <div className="-mt-2">
              <SizeGuide slug={producto.slug} />
            </div>

            <div className="space-y-3">
              <WhatsAppButton
                slug={producto.slug}
                variante_id={tallaActiva?.variante_id}
                origen="DETALLE_PRODUCTO"
                disabled={noPedible}
                etiqueta={
                  tallaActiva?.agotado
                    ? "Talla agotada"
                    : sinTallaElegida
                      ? "Elige una talla"
                      : "Pedir por WhatsApp"
                }
              />

              <AddToCartButton
                variante_id={tallaActiva?.variante_id}
                cantidad={cantidad}
                disabled={noPedible}
              />

              {/* Talla agotada: en vez de dejar dos botones muertos, se
                  ofrece el aviso de reposición. */}
              {tallaActiva?.agotado ? (
                <StockAlert variante_id={tallaActiva.variante_id} />
              ) : null}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-2 text-sm font-semibold">Descripción:</h2>
            <p className="whitespace-pre-line text-sm leading-6 text-neutral-700">
              {producto.descripcion || "Sin descripción."}
            </p>
          </div>
        </section>
      </div>

      {relacionados?.data?.length ? (
        <div className="mt-12">
          <ProductCarousel
            title="Similares para ti"
            subtitle="Productos que combinan con este estilo."
            items={relacionados.data}
          />
        </div>
      ) : null}
    </>
  );
}
