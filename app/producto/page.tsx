import { Suspense } from "react";

import Breadcrumbs from "@/components/breadcrumbs";
import CatalogoGrid from "@/components/catalogo-grid";
import { CatalogoFiltros } from "@/components/catalogo-filtros";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

type Tipo = "categorias" | "colecciones";

const normalizarTipo = (tipo?: string): Tipo =>
  tipo === "colecciones" ? "colecciones" : "categorias";

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    categoria?: string;
    coleccion?: string;
  }>;
}) {
  const sp = await searchParams;

  const modo = normalizarTipo(sp.tipo);
  const categoriaSlug = sp.categoria;
  const coleccionSlug = sp.coleccion;
  const slugActual = modo === "categorias" ? categoriaSlug : coleccionSlug;

  const tituloSeccion = modo === "categorias" ? "Categorías" : "Colecciones";

  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: tituloSeccion, href: `/producto?tipo=${modo}` },
            ...(slugActual ? [{ label: slugActual }] : []),
          ]}
        />

        <div className="mt-4">
          <h1 className="text-2xl font-semibold">{tituloSeccion}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {modo === "categorias"
              ? "Explora por tipo de prenda."
              : "Explora por temporada o drop."}
          </p>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Los filtros sólo se muestran aquí en escritorio: en móvil van
              en un drawer que abre la propia grilla. */}
          <aside className="hidden lg:block">
            {/* `useSearchParams` obliga a Suspense en una página servida. */}
            <Suspense
              fallback={
                <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
              }
            >
              <CatalogoFiltros />
            </Suspense>
          </aside>

          <Suspense
            fallback={
              <div className="h-96 animate-pulse rounded-2xl bg-neutral-100" />
            }
          >
            <CatalogoGrid
              categoriaSlug={categoriaSlug}
              coleccionSlug={coleccionSlug}
            />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
