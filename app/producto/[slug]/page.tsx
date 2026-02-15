"use client";

import React from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import ProductGallery from "@/components/product-gallery";
import SizePicker from "@/components/size-picker";
import ColorPicker from "@/components/color-picker";
import QuantityPicker from "@/components/quantity-picker";
import WhatsAppButton from "@/components/whatsapp-button";
import SizeGuide from "@/components/size-guide";
import SimilarProducts from "@/components/similar-products";
import Link from "next/link";
import {
  Instagram,
  Music2,
  Play,
  Flame,
  Sparkles,
  TrendingUp,
  Tag,
} from "lucide-react";

import { useProducto } from "@/hooks/producto/useProducto";

function BadgePill({ label }: { label: string }) {
  const map: Record<string, { icon: React.ReactNode; className: string }> = {
    OFERTA: {
      icon: <Tag className="h-3.5 w-3.5" />,
      className: "bg-brand text-white",
    },
    HOT: {
      icon: <Flame className="h-3.5 w-3.5" />,
      className: "bg-black text-white",
    },
    TOP: {
      icon: <Sparkles className="h-3.5 w-3.5" />,
      className: "bg-amber-400 text-black",
    },
    TENDENCIA: {
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      className: "bg-emerald-500 text-white",
    },
    NUEVO: {
      icon: <Sparkles className="h-3.5 w-3.5" />,
      className: "bg-sky-500 text-white",
    },
  };

  const conf = map[label] ?? {
    icon: null,
    className: "bg-neutral-900 text-white",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        conf.className,
      ].join(" ")}
    >
      {conf.icon}
      {label}
    </span>
  );
}

function VideoCTA({ igUrl, ttUrl }: { igUrl?: string; ttUrl?: string }) {
  const hasAny = Boolean(igUrl || ttUrl);
  if (!hasAny) return null;

  return (
    <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <Play className="h-4 w-4" />
            Mira el video del producto
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            Míralo en Instagram o TikTok antes de pedir.
          </p>
        </div>
      </div>

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
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
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

function toNumberDecimal(v: any, fallback = 0) {
  if (v === null || v === undefined) return fallback;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function uniqueStrings(arr: Array<string | undefined | null>) {
  return Array.from(new Set(arr.filter(Boolean) as string[]));
}

export default function ProductDetailPage() {
  // ✅ Estático por ahora
  const producto_id = 1;

  const { data, isLoading, isError } = useProducto(producto_id, {
    include: [
      "imagenes",
      "videos",
      "variantes",
      "variantes.color",
      "variantes.talla",
      "precio",
      "insignias",
      "categorias",
      "colecciones",
    ],
  });

  const producto = data?.data;

  // ---- estados base
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-white text-neutral-900">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl border border-neutral-200 p-6 text-sm text-neutral-600">
            Cargando producto...
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (isError || !producto) {
    return (
      <div className="min-h-dvh bg-white text-neutral-900">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            No se pudo cargar el producto.
          </div>
          <div className="mt-6">
            <Link
              href="/producto?tipo=categorias"
              className="text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
            >
              Volver al catálogo
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // ---- mapping (API -> UI)
  const name = producto.nombre ?? "Producto";
  const description = producto.descripcion ?? "";

  // Imágenes: prioriza esPrincipal, luego orden
  const imagesSorted = [...(producto.imagenes ?? [])].sort((a: any, b: any) => {
    const ap = a?.esPrincipal ? 0 : 1;
    const bp = b?.esPrincipal ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return (a?.orden ?? 0) - (b?.orden ?? 0);
  });

  const images = imagesSorted.length
    ? imagesSorted.map((i: any) => i.url).filter(Boolean)
    : ["/img/polo.png"]; // fallback

  // Variantes -> tallas y colores (únicos)
  const variantes = producto.variantes ?? [];
  const sizes = uniqueStrings(variantes.map((v) => v?.talla?.etiqueta));
  const colors = uniqueStrings(variantes.map((v) => v?.color?.nombre));

  // Precio:
  const precioOriginal = toNumberDecimal(
    producto.precio?.precioOriginal,
    toNumberDecimal(producto.precioBase, 0),
  );

  const discountPercent = producto.precio?.activo
    ? toNumberDecimal(producto.precio?.porcentajeDescuento, 0)
    : 0;

  const hasDiscount = discountPercent > 0;

  const precioOferta = producto.precio?.activo
    ? toNumberDecimal(producto.precio?.precioOferta, 0)
    : 0;

  const finalPrice =
    hasDiscount && (precioOferta > 0 || discountPercent > 0)
      ? precioOferta > 0
        ? precioOferta
        : Math.round(precioOriginal * (1 - discountPercent / 100) * 100) / 100
      : precioOriginal;

  // Insignias (según tu include real puede que falte `insignias.insignia`)
  const badges = (producto.insignias ?? [])
    .map((pi) => pi?.insignia?.nombre ?? pi?.insignia)
    .filter(Boolean) as string[];

  // Videos
  const videos = producto.videos ?? [];
  const igUrl =
    videos.find((v) => v?.plataforma === "INSTAGRAM")?.url ?? undefined;
  const ttUrl =
    videos.find((v) => v?.plataforma === "TIKTOK")?.url ?? undefined;

  // Breadcrumbs
  const breadcrumbLabel =
    (producto.categorias?.[0]?.categoria?.nombre as string | undefined) ??
    "Producto";

  // ✅ Similares (estático, pero coherente con lo que se ve en pantalla)
  const coverImage = images[0] ?? "/img/polo.png";

  const similares = [
    {
      id: 2,
      nombre: "Blusa básica manga corta",
      slug: "blusa-basica-manga-corta",
      imagen: coverImage,
      precio: precioOriginal,
      precioOferta: hasDiscount ? finalPrice : undefined,
    },
    {
      id: 3,
      nombre: "Polo cuello redondo premium",
      slug: "polo-cuello-redondo-premium",
      imagen: coverImage,
      precio: Math.max(0, precioOriginal + 10),
      precioOferta: undefined,
    },
    {
      id: 4,
      nombre: "Top rib ajustado",
      slug: "top-rib-ajustado",
      imagen: coverImage,
      precio: Math.max(0, precioOriginal - 15),
      precioOferta: undefined,
    },
    {
      id: 5,
      nombre: "Polo oversize dama",
      slug: "polo-oversize-dama",
      imagen: coverImage,
      precio: Math.max(0, precioOriginal + 25),
      precioOferta: hasDiscount ? Math.max(0, finalPrice + 5) : undefined,
    },
  ];

  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: breadcrumbLabel, href: "/producto?tipo=categorias" },
            { label: name },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Galería */}
          <ProductGallery images={images} />

          {/* Info */}
          <section>
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {badges.map((b) => (
                <BadgePill key={b} label={b} />
              ))}
              {hasDiscount ? (
                <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  -{discountPercent}% OFF
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-2xl font-semibold">{name}</h1>

            {/* Precio (con oferta) */}
            <div className="mt-3">
              {hasDiscount ? (
                <div className="flex items-end gap-3">
                  <span className="text-xl font-semibold text-brand">
                    S/ {finalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-neutral-500 line-through">
                    S/ {precioOriginal.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="text-xl font-semibold">
                  S/ {precioOriginal.toFixed(2)}
                </div>
              )}
            </div>

            {/* CTA videos */}
            <VideoCTA igUrl={igUrl} ttUrl={ttUrl} />

            <div className="mt-6 space-y-5">
              <SizePicker
                label="Talla:"
                sizes={sizes.length ? sizes : ["Única"]}
              />
              <ColorPicker
                label="Color:"
                colors={colors.length ? colors : ["Sin color"]}
              />
              <QuantityPicker label="Cantidad:" />

              {/* ✅ Guía de tallas tipo Shein */}
              <div className="-mt-2">
                <SizeGuide
                  sizes={sizes.length ? sizes : ["S", "M", "L", "XL"]}
                />
              </div>

              <WhatsAppButton
                phone="+51904634045"
                message={`Hola, quiero pedir: ${name}. Precio: S/ ${finalPrice.toFixed(
                  2,
                )}${hasDiscount ? ` (Antes S/ ${precioOriginal.toFixed(2)} / ${discountPercent}% OFF)` : ""}.`}
              />
            </div>

            <div className="mt-8">
              <h3 className="mb-2 text-sm font-semibold">Descripción:</h3>
              <p className="text-sm leading-6 text-neutral-700">
                {description || "Sin descripción."}
              </p>
            </div>
          </section>
        </div>

        {/* ✅ Similares (estático por ahora) */}
        <SimilarProducts items={similares} />
      </main>

      <SiteFooter />
    </div>
  );
}
