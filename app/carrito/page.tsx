import type { Metadata } from "next";

import Breadcrumbs from "@/components/breadcrumbs";
import CarritoVista from "@/components/carrito-vista";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export const metadata: Metadata = {
  title: "Tu carrito",
  // El carrito es privado de cada visitante: no tiene nada que indexar.
  robots: { index: false, follow: false },
};

export default function CarritoPage() {
  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs
          items={[{ label: "Inicio", href: "/" }, { label: "Carrito" }]}
        />

        <h1 className="mt-4 text-2xl font-semibold">Tu carrito</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Revisa tus productos y cierra el pedido por WhatsApp.
        </p>

        <div className="mt-6">
          <CarritoVista />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
