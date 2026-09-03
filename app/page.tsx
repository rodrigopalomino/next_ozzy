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

import { useDestacados, useMasVendidos, useNovedades } from "@/hooks/catalogo/useCatalogo";

export default function HomePage() {
  // Tres rutas dedicadas en vez de una sola llamada grande filtrada en el
  // cliente: cada sección pide lo suyo, con su propia caché HTTP.
  const { data: destacados } = useDestacados({ limit: 10 });
  const { data: novedades } = useNovedades({ limit: 10 });
  const { data: masVendidos } = useMasVendidos({ limit: 12 });

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
          items={destacados?.data ?? []}
          autoplayMs={0}
        />

        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

        <ProductCarousel
          title="Novedades"
          subtitle="Lo último que llegó"
          items={novedades?.data ?? []}
          autoplayMs={0}
        />

        <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-pink-200 to-transparent" />

        <div id="mas-vendidos" />
        <BestSellersGrid productos={masVendidos?.data ?? []} />

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
