import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import CategorySidebar from "@/components/category-sidebar";
import SortBar from "@/components/sort-bar";
import ProductGrid from "@/components/product-grid";
import PaginationBar from "@/components/pagination-bar";

const CATEGORY_FILTERS = [
  "Poleras",
  "Casacas",
  "Polos",
  "Blusas",
  "Pantalones",
  "Shorts",
];

const COLLECTION_FILTERS = ["Primavera 2025", "Invierno", "Colección 2025"]; // ✅ estático por ahora

type Tipo = "categorias" | "colecciones";

function normalizeTipo(tipo?: string): Tipo {
  if (tipo === "colecciones") return "colecciones";
  return "categorias";
}

function buildProducts({ mode, filter }: { mode: Tipo; filter: string }) {
  return Array.from({ length: 12 }).map((_, i) => ({
    id: `${mode}-${filter}-${i + 1}`,
    name: "Camiseta Ray",
    price: 50,
    discountPercent: i % 4 === 0 ? 20 : undefined,
    image: "/img/polo.png",
    slug: "camiseta-ray",
    category: mode === "categorias" ? filter : undefined,
    collection: mode === "colecciones" ? filter : undefined,
  }));
}

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; filtro?: string }>;
}) {
  const sp = await searchParams;

  const mode = normalizeTipo(sp.tipo);

  const sidebarTitle = mode === "categorias" ? "Categorías" : "Colecciones";
  const options = mode === "categorias" ? CATEGORY_FILTERS : COLLECTION_FILTERS;

  const selected = (sp.filtro && decodeURIComponent(sp.filtro)) || options[0];

  const products = buildProducts({ mode, filter: selected });

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Producto", href: "/producto?tipo=categorias" },
            { label: sidebarTitle, href: `/producto?tipo=${mode}` },
            { label: selected },
          ]}
        />

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              {sidebarTitle}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {mode === "categorias"
                ? "Explora por tipo de prenda."
                : "Explora por temporada/drop."}
            </p>
          </div>

          <div className="inline-flex rounded-full border border-muted/25 bg-white px-3 py-1 text-xs font-semibold text-ink">
            {selected}
          </div>
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-[240px_1fr]">
          <aside>
            <CategorySidebar
              title={`Filtrar por ${mode === "categorias" ? "categoría" : "colección"}`}
              current={selected}
              items={options}
              baseHref={`/producto?tipo=${mode}&filtro=`}
            />
          </aside>

          <section>
            <div className="mb-5 flex items-center justify-end">
              <SortBar />
            </div>

            <ProductGrid products={products} />

            <div className="mt-8 flex justify-center">
              <PaginationBar current={1} totalPages={5} />
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
