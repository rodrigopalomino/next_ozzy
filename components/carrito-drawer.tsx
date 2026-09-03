"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCarrito,
  useCarritoAcciones,
  useCarritoWhatsApp,
} from "@/hooks/carrito/useCarrito";
import { IMAGEN_FALLBACK, formatearPrecio } from "@/lib/catalogo";
import { cn } from "@/lib/utils";
import { useCarritoDrawer } from "@/store/carrito-drawer-store";
import { MAX_POR_LINEA, type CarritoItemSalida } from "@/types/carrito";

/** Línea compacta: el drawer es estrecho, así que la cantidad va debajo. */
function Linea({ item }: { item: CarritoItemSalida }) {
  const { cambiarCantidad, quitar } = useCarritoAcciones();
  const { cerrar } = useCarritoDrawer();

  const ocupado = cambiarCantidad.isPending || quitar.isPending;

  return (
    <li
      className={cn(
        "flex gap-3 py-4",
        !item.disponible && "opacity-55",
      )}
    >
      <Link
        href={`/producto/${item.producto.slug}`}
        onClick={cerrar}
        className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
      >
        <Image
          src={item.imagen?.urlSm ?? item.imagen?.url ?? IMAGEN_FALLBACK}
          alt={item.imagen?.alt ?? item.producto.nombre}
          fill
          sizes="64px"
          className="object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/producto/${item.producto.slug}`}
            onClick={cerrar}
            className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
          >
            {item.producto.nombre}
          </Link>

          <button
            type="button"
            onClick={() => quitar.mutate(item.variante_id)}
            disabled={ocupado}
            className="shrink-0 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-600 disabled:opacity-40"
            aria-label={`Quitar ${item.producto.nombre}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
          {item.color.hex ? (
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full border border-neutral-300"
              style={{ backgroundColor: item.color.hex }}
              aria-hidden="true"
            />
          ) : null}
          {item.color.nombre} · {item.talla.etiqueta}
        </p>

        {!item.disponible ? (
          <p className="mt-1 text-xs font-medium text-amber-700">
            Ya no disponible
          </p>
        ) : item.agotado ? (
          <p className="mt-1 text-xs font-medium text-amber-700">Sin stock</p>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-full border border-neutral-200">
            <button
              type="button"
              onClick={() =>
                cambiarCantidad.mutate({
                  variante_id: item.variante_id,
                  cantidad: item.cantidad - 1,
                })
              }
              disabled={ocupado || item.cantidad <= 1}
              className="grid h-7 w-7 place-items-center rounded-l-full text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Quitar uno"
            >
              <Minus className="h-3 w-3" />
            </button>

            <span className="w-7 text-center text-xs font-medium tabular-nums">
              {item.cantidad}
            </span>

            <button
              type="button"
              onClick={() =>
                cambiarCantidad.mutate({
                  variante_id: item.variante_id,
                  cantidad: item.cantidad + 1,
                })
              }
              disabled={ocupado || item.cantidad >= MAX_POR_LINEA}
              className="grid h-7 w-7 place-items-center rounded-r-full text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Agregar uno"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span className="text-sm font-semibold tabular-nums text-neutral-900">
            {formatearPrecio(item.subtotal)}
          </span>
        </div>
      </div>
    </li>
  );
}

export default function CarritoDrawer() {
  const { abierto, cerrar } = useCarritoDrawer();
  const { data, isLoading, isError } = useCarrito();
  const pedir = useCarritoWhatsApp();

  // Los omitidos se muestran antes de redirigir: el cliente tiene que saber
  // qué queda fuera del pedido.
  const [omitidos, setOmitidos] = useState<string[] | null>(null);
  const [urlPendiente, setUrlPendiente] = useState<string | null>(null);

  const carrito = data?.data;
  const vacio = !carrito || carrito.items.length === 0;

  const cerrarPedido = () => {
    pedir.mutate(undefined, {
      onSuccess: ({ data: whatsapp }) => {
        if (whatsapp.omitidos.length > 0) {
          setOmitidos(whatsapp.omitidos);
          setUrlPendiente(whatsapp.url);
          return;
        }
        window.location.href = whatsapp.url;
      },
    });
  };

  return (
    <Sheet open={abierto} onOpenChange={(v) => !v && cerrar()}>
      {/* `flex` + `p-0` para que el footer quede fijo abajo y sólo la lista
          haga scroll. */}
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-neutral-200 px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-4 w-4" />
            Tu carrito
            {carrito && carrito.cantidad > 0 ? (
              <span className="rounded-full bg-pink-500 px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
                {carrito.cantidad}
              </span>
            ) : null}
          </SheetTitle>
          <SheetDescription className="text-xs">
            El pedido se cierra por WhatsApp con un asesor.
          </SheetDescription>
        </SheetHeader>

        {/* Contenido con scroll */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          {isLoading ? (
            <div className="space-y-4 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex animate-pulse gap-3">
                  <div className="aspect-[3/4] w-16 shrink-0 rounded-lg bg-neutral-100" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-3/4 rounded bg-neutral-100" />
                    <div className="h-3 w-1/3 rounded bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-10 text-center">
              <p className="text-sm text-red-700">
                No se pudo cargar el carrito.
              </p>
            </div>
          ) : vacio ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-neutral-100">
                <ShoppingBag className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="mt-4 text-sm font-semibold text-neutral-900">
                Tu carrito está vacío
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Explora el catálogo y agrega lo que te guste.
              </p>
              <Link
                href="/producto"
                onClick={cerrar}
                className="mt-5 inline-flex rounded-full bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-600"
              >
                Ver catálogo
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {carrito.items.map((item) => (
                <Linea key={item.id} item={item} />
              ))}
            </ul>
          )}
        </div>

        {/* Footer fijo, sólo con contenido */}
        {!vacio && carrito ? (
          <div className="shrink-0 border-t border-neutral-200 bg-white px-5 py-4">
            {omitidos ? (
              <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="flex items-start gap-1.5 text-xs font-semibold text-amber-900">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Estos no entran en el pedido:
                </p>
                <ul className="mt-1.5 max-h-24 list-inside list-disc overflow-y-auto text-xs text-amber-800">
                  {omitidos.map((nombre) => (
                    <li key={nombre}>{nombre}</li>
                  ))}
                </ul>
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (urlPendiente) window.location.href = urlPendiente;
                    }}
                    className="flex-1 rounded-full bg-pink-500 px-3 py-2 text-xs font-semibold text-white hover:bg-pink-600"
                  >
                    Continuar igual
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOmitidos(null);
                      setUrlPendiente(null);
                    }}
                    className="rounded-full border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    Revisar
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-neutral-500">
                  {carrito.cantidad}{" "}
                  {carrito.cantidad === 1 ? "producto" : "productos"}
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {/* El total lo calcula el servidor: aquí no se suma nada. */}
                  {formatearPrecio(carrito.total)}
                </p>
              </div>

              <Link
                href="/carrito"
                onClick={cerrar}
                className="text-xs font-medium text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
              >
                Ver detalle
              </Link>
            </div>

            {!omitidos ? (
              <button
                type="button"
                onClick={cerrarPedido}
                disabled={pedir.isPending || carrito.cantidad === 0}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
              >
                {pedir.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparando...
                  </>
                ) : (
                  "Pedir por WhatsApp"
                )}
              </button>
            ) : null}

            {pedir.isError ? (
              <p className="mt-2 text-center text-xs text-red-600" role="alert">
                No se pudo preparar el pedido. Intenta de nuevo.
              </p>
            ) : null}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
