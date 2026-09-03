"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ShoppingBag, Trash2 } from "lucide-react";

import QuantityPicker from "@/components/quantity-picker";
import {
  useCarrito,
  useCarritoAcciones,
  useCarritoWhatsApp,
} from "@/hooks/carrito/useCarrito";
import { IMAGEN_FALLBACK, formatearPrecio } from "@/lib/catalogo";
import { cn } from "@/lib/utils";
import type { CarritoItemSalida } from "@/types/carrito";

function Linea({ item }: { item: CarritoItemSalida }) {
  const { cambiarCantidad, quitar } = useCarritoAcciones();

  return (
    <div
      className={cn(
        "flex gap-4 border-b border-neutral-200 py-5 last:border-b-0",
        !item.disponible && "opacity-60",
      )}
    >
      <Link
        href={`/producto/${item.producto.slug}`}
        className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
      >
        <Image
          src={item.imagen?.urlSm ?? item.imagen?.url ?? IMAGEN_FALLBACK}
          alt={item.imagen?.alt ?? item.producto.nombre}
          fill
          sizes="80px"
          className="object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/producto/${item.producto.slug}`}
          className="line-clamp-2 text-sm font-semibold text-neutral-900 hover:underline"
        >
          {item.producto.nombre}
        </Link>

        <p className="mt-1 text-xs text-neutral-600">
          {item.color.nombre} · Talla {item.talla.etiqueta}
        </p>

        {!item.disponible ? (
          <p className="mt-1 text-xs font-semibold text-amber-700">
            Ya no está disponible: no se incluirá en el pedido.
          </p>
        ) : item.agotado ? (
          <p className="mt-1 text-xs font-semibold text-amber-700">
            Sin stock por ahora.
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <QuantityPicker
            label=""
            value={item.cantidad}
            onChange={(cantidad) =>
              cambiarCantidad.mutate({
                variante_id: item.variante_id,
                cantidad,
              })
            }
          />

          <button
            type="button"
            onClick={() => quitar.mutate(item.variante_id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-red-600"
            aria-label={`Quitar ${item.producto.nombre} del carrito`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Quitar
          </button>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="text-sm font-semibold text-pink-600">
          {formatearPrecio(item.subtotal)}
        </div>
        {item.cantidad > 1 ? (
          <div className="mt-0.5 text-xs text-neutral-500">
            {formatearPrecio(item.precio.precio)} c/u
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CarritoVista() {
  const { data, isLoading, isError } = useCarrito();
  const { vaciar } = useCarritoAcciones();
  const pedir = useCarritoWhatsApp();

  // Los omitidos se muestran antes de redirigir: el cliente tiene que saber
  // qué quedó fuera del pedido.
  const [omitidos, setOmitidos] = useState<string[] | null>(null);
  const [urlPendiente, setUrlPendiente] = useState<string | null>(null);

  const carrito = data?.data;

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

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        No se pudo cargar el carrito.
      </div>
    );
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center">
        <ShoppingBag className="mx-auto h-8 w-8 text-neutral-400" />
        <p className="mt-3 text-sm font-semibold text-neutral-900">
          Tu carrito está vacío
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Explora el catálogo y agrega lo que te guste.
        </p>
        <Link
          href="/producto"
          className="mt-5 inline-flex rounded bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-600"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section>
        <div className="rounded-2xl border border-neutral-200 bg-white px-5">
          {carrito.items.map((item) => (
            <Linea key={item.id} item={item} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => vaciar.mutate()}
          className="mt-4 text-xs font-semibold text-neutral-500 hover:text-red-600"
        >
          Vaciar carrito
        </button>
      </section>

      <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 lg:sticky lg:top-6">
        <h2 className="text-sm font-semibold text-neutral-900">Resumen</h2>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-600">Productos</dt>
            <dd className="tabular-nums">{carrito.cantidad}</dd>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold">
            <dt>Total</dt>
            {/* El total lo calcula el servidor: aquí no se suma nada. */}
            <dd className="tabular-nums text-pink-600">
              {formatearPrecio(carrito.total)}
            </dd>
          </div>
        </dl>

        {omitidos ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-900">
              Estos productos no entran en el pedido:
            </p>
            <ul className="mt-1.5 list-inside list-disc text-xs text-amber-800">
              {omitidos.map((nombre) => (
                <li key={nombre}>{nombre}</li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (urlPendiente) window.location.href = urlPendiente;
                }}
                className="rounded bg-pink-500 px-3 py-2 text-xs font-semibold text-white hover:bg-pink-600"
              >
                Continuar igual
              </button>
              <button
                type="button"
                onClick={() => {
                  setOmitidos(null);
                  setUrlPendiente(null);
                }}
                className="rounded border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                Revisar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={cerrarPedido}
            disabled={pedir.isPending || carrito.cantidad === 0}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded bg-pink-500 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
          >
            {pedir.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparando pedido...
              </>
            ) : (
              "Pedir por WhatsApp"
            )}
          </button>
        )}

        {pedir.isError ? (
          <p className="mt-2 text-center text-xs text-red-600" role="alert">
            No se pudo preparar el pedido. Intenta de nuevo.
          </p>
        ) : null}

        <p className="mt-3 text-center text-xs text-neutral-500">
          El pedido se cierra por WhatsApp con un asesor.
        </p>
      </aside>
    </div>
  );
}
