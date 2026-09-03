import type { Metadata } from "next";

import Breadcrumbs from "@/components/breadcrumbs";
import FavoritosVista from "@/components/favoritos-vista";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export const metadata: Metadata = {
  title: "Tus favoritos",
  // Lista privada de cada visitante: nada que indexar.
  robots: { index: false, follow: false },
};

export default function FavoritosPage() {
  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs
          items={[{ label: "Inicio", href: "/" }, { label: "Favoritos" }]}
        />

        <h1 className="mt-4 text-2xl font-semibold">Tus favoritos</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Lo que guardaste para pedir después.
        </p>

        <div className="mt-6">
          <FavoritosVista />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
