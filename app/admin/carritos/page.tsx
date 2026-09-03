"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import PaginationBar from "@/components/pagination-bar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCarritosAdmin } from "@/hooks/admin/useAdmin";
import { IMAGEN_FALLBACK, formatearPrecio } from "@/lib/catalogo";
import { cn } from "@/lib/utils";
import type { CarritoAdminSalida } from "@/types/admin";

/** El criterio de "abandonado" lo calcula el servidor en `diasInactivo`. */
const inactividad = (dias: number) => {
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Ayer";
  return `Hace ${dias} días`;
};

function Carrito({ carrito }: { carrito: CarritoAdminSalida }) {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base">
            {carrito.cliente
              ? (carrito.cliente.nombre || carrito.cliente.email)
              : "Visitante sin cuenta"}
          </CardTitle>
          <CardDescription>
            {carrito.cliente ? carrito.cliente.email : "Sin datos de contacto"}
          </CardDescription>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {carrito.anonimo ? (
            <Badge variant="secondary">Anónimo</Badge>
          ) : (
            <Badge>Con cuenta</Badge>
          )}
          <Badge
            variant="outline"
            className={cn(carrito.diasInactivo >= 7 && "border-amber-400 text-amber-700")}
          >
            {inactividad(carrito.diasInactivo)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Misma forma que el carrito público: se reutiliza la lectura. */}
        <ul className="divide-y divide-neutral-200">
          {carrito.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2">
              <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-neutral-100">
                <Image
                  src={item.imagen?.urlSm ?? item.imagen?.url ?? IMAGEN_FALLBACK}
                  alt={item.imagen?.alt ?? item.producto.nombre}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {item.producto.nombre}
                </p>
                <p className="text-xs text-neutral-600">
                  {item.color.nombre} · {item.talla.etiqueta} ×{item.cantidad}
                  {!item.disponible ? " · ya no disponible" : ""}
                </p>
              </div>

              <span className="shrink-0 text-sm tabular-nums">
                {formatearPrecio(item.subtotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-sm">
          <span className="text-neutral-600">
            {carrito.cantidad} {carrito.cantidad === 1 ? "producto" : "productos"}
          </span>
          <span className="font-semibold tabular-nums">
            {formatearPrecio(carrito.total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function CarritosContenido() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1) || 1;

  const { data, isLoading, isError } = useCarritosAdmin(page, 20);
  const carritos = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Carritos abandonados</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Carritos con productos que no acabaron en un pedido, del más reciente
          al más antiguo. {meta ? `${meta.total} en total.` : ""}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">
            No se pudieron cargar los carritos. Revisa que tengas sesión de
            administrador.
          </CardContent>
        </Card>
      ) : carritos.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-neutral-500">
            No hay carritos con productos ahora mismo.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {carritos.map((carrito) => (
            <Carrito key={carrito.id} carrito={carrito} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="flex justify-center">
          <PaginationBar current={meta.page} totalPages={meta.totalPages} />
        </div>
      ) : null}
    </div>
  );
}

export default function CarritosPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CarritosContenido />
    </Suspense>
  );
}
