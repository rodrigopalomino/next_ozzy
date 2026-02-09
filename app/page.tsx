"use client";

import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ProductCarousel from "@/components/product-carousel";

import Image from "next/image";
import Link from "next/link";
import CollectionsSection from "@/components/collections-section";
import BenefitsBar from "@/components/benefits-bar";
import BestSellersGrid from "@/components/best-sellers-grid";
import SocialSection from "@/components/social-section";
import StoresSection from "@/components/stores-section";
import CategoriesSection from "@/components/categories-section";

import { useProductos } from "@/hooks/producto/useProductos";
import type { Producto } from "@/types/Producto";

type UiItem = {
  id: string;
  name: string;
  price: number;
  discountPercent?: number;
  image: string; // principal
  hoverImage?: string; // ✅ hover opcional
  badge?: string;
};

function pickImage(p: Producto) {
  const imgs = p?.imagenes ?? [];
  if (!Array.isArray(imgs) || imgs.length === 0) return "/img/polo.png";

  const ordered = imgs
    .slice()
    .sort((a, b) => Number(a?.orden ?? 0) - Number(b?.orden ?? 0));

  const principal = ordered.find((x) => x?.tipo === "principal");
  return principal?.url ?? ordered[0]?.url ?? "/img/polo.png";
}

function calcDiscountPercent(p: Producto): number | undefined {
  const precio = p?.precio;
  if (!precio?.activo) return undefined;

  const original = Number(precio?.precioOriginal ?? 0);
  const oferta =
    precio?.precioOferta == null ? null : Number(precio?.precioOferta);

  if (!Number.isFinite(original) || original <= 0) return undefined;
  if (oferta == null || !Number.isFinite(oferta) || oferta <= 0)
    return undefined;
  if (oferta >= original) return undefined;

  return Math.round(((original - oferta) / original) * 100);
}

function getPrice(p: Producto) {
  const precioBase = Number(p?.precioBase ?? 0);
  const precio = p?.precio;

  const oferta =
    precio?.activo && precio?.precioOferta != null
      ? Number(precio?.precioOferta)
      : null;

  if (oferta != null && Number.isFinite(oferta) && oferta > 0) return oferta;
  if (Number.isFinite(precioBase) && precioBase > 0) return precioBase;

  return 0;
}

function getBadge(p: Producto): string | undefined {
  const d = calcDiscountPercent(p);
  if (d) return `-${d}%`;

  // Si tu backend incluye insignia real:
  // producto.insignias: [{ insignia: { nombre: "TOP" } }]
  const insignias = p?.insignias ?? [];
  const nombre = insignias?.[0]?.insignia?.nombre;
  if (typeof nombre === "string" && nombre.trim()) return nombre.trim();

  return undefined;
}

function pickHoverImage(p: Producto) {
  const imgs = p?.imagenes ?? [];
  if (!Array.isArray(imgs) || imgs.length < 2) return undefined;

  const ordered = imgs
    .slice()
    .sort((a, b) => Number(a?.orden ?? 0) - Number(b?.orden ?? 0));

  // ✅ segunda imagen como hover
  return ordered[1]?.url;
}

function toUiItem(p: Producto): UiItem {
  return {
    id: String(p?.id),
    name: String(p?.nombre ?? ""),
    price: getPrice(p),
    discountPercent: calcDiscountPercent(p),
    image: pickImage(p),
    hoverImage: pickHoverImage(p), // ✅
    badge: getBadge(p),
  };
}
function hasOferta(p: Producto) {
  const precio = p?.precio;
  return Boolean(
    precio?.activo &&
    (precio?.precioOferta != null ||
      Number(precio?.porcentajeDescuento ?? 0) > 0),
  );
}

export default function HomePage() {
  // ✅ usa TU hook genérico (getProductos)
  const { data: resp } = useProductos({
    page: 1,
    limit: 80,
    include: ["imagenes", "precio", "insignias"],
  });

  const productos: Producto[] = resp?.data ?? [];

  // ✅ reemplazo directo de tu data de prueba
  const featured = productos.slice(0, 10).map(toUiItem);
  const offers = productos.filter(hasOferta).slice(0, 10).map(toUiItem);
  const bestSellers = productos.slice(0, 12).map(toUiItem);

  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <SiteHeader />

      {/* HERO editorial orientado a colección */}
      <section className="relative">
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="relative mt-4 h-[320px] overflow-hidden rounded-2xl sm:h-[380px] md:h-[460px]">
            <Image
              src="/img/banner.jpg"
              alt="Colección Primavera 2025"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1152px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

            <div className="absolute inset-0 flex items-center">
              <div className="px-6 sm:px-10">
                <p className="inline-flex rounded-full bg-pink-500/90 px-3 py-1 text-xs font-semibold text-white">
                  Colección Primavera 2025
                </p>

                <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
                  Urbano, femenino y con actitud
                </h1>

                <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                  Catálogo oficial OZZY. Elige tu estilo y pídelo directo por
                  WhatsApp.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/colecciones/primavera-2025"
                    className="rounded bg-pink-500 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-600"
                  >
                    Ver colección
                  </Link>
                  <Link
                    href="#mas-vendidos"
                    className="rounded border border-white/60 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    Ver más vendidos
                  </Link>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <CategoriesSection />

        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

        <CollectionsSection />

        <div className="my-10" />

        <BenefitsBar />

        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-pink-200 to-transparent" />

        <ProductCarousel
          title="Destacado"
          subtitle="Lo más pedido esta semana"
          items={featured}
          autoplayMs={0}
        />

        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

        <ProductCarousel
          title="Ofertas"
          subtitle="Descuentos por tiempo limitado"
          items={offers}
          autoplayMs={0}
        />

        <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-pink-200 to-transparent" />

        <div id="mas-vendidos" />
        <BestSellersGrid items={bestSellers} />

        <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

        <StoresSection />

        <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

        <SocialSection />

        <div className="my-12" />

        {/* <NewsletterSection /> */}
      </main>

      <SiteFooter />
    </div>
  );
}
