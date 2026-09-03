import type { MetadataRoute } from "next";

import { obtenerDelCatalogo } from "@/lib/api-servidor";
import type { SitemapSalida } from "@/types/tienda";

/**
 * `GET /catalogo/sitemap` devuelve todo de una vez (no pagina) y sólo lo
 * publicado o activo, así que no hay que filtrar aquí.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const respuesta = await obtenerDelCatalogo<SitemapSalida>(
    "catalogo/sitemap",
    { revalidate: 3600 },
  );

  if (!respuesta) return [];

  const { urlBase, productos, categorias, colecciones } = respuesta.data;

  return [
    { url: urlBase, changeFrequency: "daily" as const, priority: 1 },
    ...productos.map((p) => ({
      url: `${urlBase}/producto/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categorias.map((c) => ({
      url: `${urlBase}/producto?tipo=categorias&categoria=${c.slug}`,
      lastModified: new Date(c.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...colecciones.map((c) => ({
      url: `${urlBase}/producto?tipo=colecciones&coleccion=${c.slug}`,
      lastModified: new Date(c.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
