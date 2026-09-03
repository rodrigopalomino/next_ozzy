import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import ProductoDetalle from "@/components/producto-detalle";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { obtenerDelCatalogo } from "@/lib/api-servidor";
import { serializarJsonLd } from "@/lib/catalogo";
import { esRedireccion, type RespuestaDetalle } from "@/types/producto-detalle";

type Params = { params: Promise<{ slug: string }> };

/**
 * Un slug que cambió responde 200 con `{ redirigirA }` en vez del producto —
 * no un 301 —, así que la redirección la hace Next y no el fetch.
 */
const resolver = async (slug: string) => {
  const respuesta = await obtenerDelCatalogo<RespuestaDetalle>(
    `catalogo/producto/${encodeURIComponent(slug)}`,
  );

  if (!respuesta) notFound();

  if (esRedireccion(respuesta.data)) {
    redirect(`/producto/${respuesta.data.redirigirA}`);
  }

  return respuesta.data;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  // `generateMetadata` no debe tumbar la página: si el catálogo falla se
  // devuelven metadatos vacíos y del error se encarga el render.
  try {
    const producto = await resolver(slug);
    const { seo } = producto;

    return {
      title: seo.titulo,
      description: seo.descripcion ?? undefined,
      alternates: { canonical: seo.canonica },
      openGraph: {
        title: seo.titulo,
        description: seo.descripcion ?? undefined,
        url: seo.canonica,
        type: "website",
        images: seo.ogImagen ? [{ url: seo.ogImagen }] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const producto = await resolver(slug);

  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* schema.org Product + AggregateOffer ya armado por el back. Se
            escapa porque el nombre y la descripción se editan en el panel. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializarJsonLd(producto.jsonLd),
          }}
        />

        <ProductoDetalle producto={producto} />
      </main>

      <SiteFooter />
    </div>
  );
}
