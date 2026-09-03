"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import ProductGrid from "@/components/product-grid";
import { useFavoritos } from "@/hooks/tienda/useTienda";

export default function FavoritosVista() {
  const { data, isLoading, isError } = useFavoritos();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] w-full rounded-xl bg-neutral-100" />
            <div className="mx-auto mt-3 h-3 w-3/4 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        No se pudieron cargar tus favoritos.
      </div>
    );
  }

  const productos = data?.data.productos ?? [];

  if (productos.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center">
        <Heart className="mx-auto h-8 w-8 text-neutral-400" />
        <p className="mt-3 text-sm font-semibold text-neutral-900">
          Todavía no guardaste nada
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Toca el corazón de un producto para guardarlo aquí.
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

  return <ProductGrid productos={productos} />;
}
