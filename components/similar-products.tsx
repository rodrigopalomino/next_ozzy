"use client";

import React from "react";
import Link from "next/link";

type SimilarItem = {
  id: number;
  nombre: string;
  slug?: string;
  imagen?: string;
  precio?: number;
  precioOferta?: number;
};

export default function SimilarProducts({
  title = "Similares para ti",
  items,
}: {
  title?: string;
  items: SimilarItem[];
}) {
  if (!items?.length) return null;

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <p className="mt-1 text-xs text-neutral-600">
            Productos que combinan con este estilo.
          </p>
        </div>

        <Link
          href="/producto?tipo=categorias"
          className="text-xs font-semibold text-neutral-900 underline-offset-4 hover:underline"
        >
          Ver más
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => {
          const showOffer =
            typeof p.precioOferta === "number" && p.precioOferta > 0;
          const img = p.imagen ?? "/img/polo.png";

          return (
            <Link
              key={p.id}
              href={`/producto/${p.slug ?? p.id}`}
              className="group rounded-2xl border border-neutral-200 bg-white p-3 transition hover:border-neutral-300"
            >
              <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={p.nombre}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                />
              </div>

              <div className="mt-3">
                <div className="line-clamp-2 text-sm font-semibold text-neutral-900">
                  {p.nombre}
                </div>

                <div className="mt-2">
                  {showOffer ? (
                    <div className="flex items-end gap-2">
                      <span className="text-sm font-semibold text-brand">
                        S/ {p.precioOferta!.toFixed(2)}
                      </span>
                      {typeof p.precio === "number" ? (
                        <span className="text-xs text-neutral-500 line-through">
                          S/ {p.precio.toFixed(2)}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-neutral-900">
                      S/ {(p.precio ?? 0).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
